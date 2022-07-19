---
slug: canary-deployments
title: Canary Deployments with AzureML and Azure Kubernetes Service
author: Max Marchionda
author_title: Machine Learning Engineer, AI Platforms & Transformation
author_url: https://github.optum.com/mmarchio
author_image_url: /img/userphoto.png
tags: [canary deployment, AzureML, ML Engineering]
---

**_Co-authored by Danny Sievers_**

Deploying a machine learning model as a web service can be simple. Wrap your model object in a Flask application, deploy it to your favorite infrastructure, and away you go... right? That solution may work for testing models in a development scenario, but most production systems require more intricate deployment patterns and monitoring, which can be difficult to implement. Luckily for us, AzureML has solved many realtime deployment challenges out of the box. In this post, we will talk about how to deploy models as a Flask application (wrapped in gunicorn) to Azure Kubernetes Service (AKS) in a canary deployment pattern with endpoint monitoring and data collection built in.

<!--truncate-->

## Requirements

This example has the following requirements:

- [Azure Machine Learning Python SDK](https://docs.microsoft.com/en-us/python/api/overview/azure/ml/?view=azure-ml-py)
- [IQStudio Workspace](https://workbench.optum.ai/workspaces/)
- [AzureML Workspace](https://workbench.optum.ai/azureml-workspace/)
- [Azure Kubernetes Service instance](https://workbench.optum.ai/aks/#creating-an-aks-instance/) - VM sku: Standard_DS3_v2, node count: 2
- [Attach Azure Kubernetes Service to AzureML Workspace](https://workbench.optum.ai/azureml-aks/#create-aks-and-attach-to-azureml-workspace)
- [Two or More AzureML Models](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-deploy-and-where#registermodel)

## Infrastructure Components

Our serving infrastructure will consist of a single [AKS cluster](https://workbench.optum.ai/aks/#creating-an-aks-instance/) that consists of two Standard_DS3_v2 VMs. We will also need an AzureML Workspace, which can be created in our IQ Studio workspace with a [single command](https://workbench.optum.ai/azureml-workspace/#deploying-an-azureml-workspace). Our example deploys a model that runs on CPU resources, if your model provides inference on GPU infrastructure, you could create an AKS cluster that consists of GPU-sku VMs.

## Why Canary Deployments?

Because machine learning models have inherent complexity and dependencies on training data, it is hard to know exactly how they are going to perform when deployed into the real world. Ideally, we could deploy new models to a small subset of incoming traffic and monitor results before committing to the model long-term. This is exactly what the canary deployment pattern allows us to do. By routing a specific percentage of traffic to new models, performance can be monitored and risk can be reduced.

![Canary Deployments](https://github.optum.com/raw/OptumIQStudio/OptumIQ-Studio-ML-Engineering/master/examples/azureml/deployment/aks-realtime-canary-deployment/canary.png)

## Overview

In a previous post about [training an XGBoost model with GPUs and AzureML Pipelines](https://ai.uhg.com/posts/xgb-pipeline/), we created and registered an XGBoost model as an AzureML Model. This post will use the model outputs of the pipeline detailed in the previous post.

First, we will deploy a single model as a web service that will handle 100% of the incoming traffic, this is called the **control** version in AzureML. Then, we will deploy a second model as a web service behind the same endpoint and route 20% of incoming traffic to the new model, this is called a **treatment** version in AzureML.

In addition to canary deployment, we want to make informed decisions about how each model is performing. We will show how to enable AzureML [data collection](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-enable-data-collection) and store incoming requests and outgoing predictions over time. In the spirit of maintaining some scope, we will not be talking about how teams would monitor incoming data and outgoing predictions. However, we highly recommend that you read [this article](https://christophergs.com/machine%20learning/2020/03/14/how-to-monitor-machine-learning-models/), by Christopher Samiullah, which goes into great detail about monitoring machine learning models. After a team decides a _treatment_ is better or worse than the _control_, we will show how you can update the _control_ model and remove any outdated models.

We will also dive into the details of the model [web service logic and deployment components](#model-service-details).

![Deployment Overview](https://github.optum.com/raw/OptumIQStudio/OptumIQ-Studio-ML-Engineering/master/examples/azureml/deployment/aks-realtime-canary-deployment/model_deployment_to_aks.png)

## Authenticate to AzureML Workspace

Users must [authenticate to the AzureML Workspace](https://workbench.optum.ai/azureml-setup/#authenticate-to-azure-ml-workspace) in order to perform all of the following steps. Once you have authenticated, you can begin using the AzureML SDK for deployment.

```python
from azureml.core import Workspace

### Authenticate to AzureML Workspace ###
iqs_workspace_name = 'mlblog'

resource_group = '{}-common'.format(iqs_workspace_name)
aml_workspace_name = '{}-aml'.format(iqs_workspace_name)

subscription_id = 'b9a8036a-370e-4737-a287-7082737c2534'

ws = Workspace.get(name = aml_workspace_name,
                   subscription_id = subscription_id,
                   resource_group = resource_group)
```

## Deploy Registered Model

:::note
All referenced code in [Deploy Registered Model](#deploy-registered-model) can be found in [deploy.py](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/blob/master/examples/azureml/deployment/aks-realtime-canary-deployment/deploy.py)
:::

### Load AzureML Model

Once you have trained and registered the models you want to deploy with AzureML, you can load the model objects. In our case, we have one model with two different versions:

```python
from azureml.core.model import Model

### Load AzureML Models ###
model_name = 'demo-higgs'

model_version = 1
model = Model(ws, name=model_name, version=model_version)
```

### Create InferenceConfig Objects

The InferenceConfig object provides AzureML the instructions necessary for deploying a model as a web service. It consists of an [entry script](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-deploy-and-where#script), an [environment file](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-deploy-and-where#1-define-inference-environment), and a specified runtime.

```python
from azureml.core.model import InferenceConfig

### Create inference configs for model scoring ###
path_to_files = "."

inference_config = InferenceConfig(entry_script="{}/score.py".format(path_to_files),
                                   conda_file="{}/env.yml".format(
    path_to_files),
    runtime="python")
```

### Specify Deployment Target

After [attaching your AKS instance to the AzureML Workspace](https://workbench.optum.ai/azureml-aks/#create-aks-and-attach-to-azureml-workspace), you can get a reference to the AKS instance through the AzureML SDK:

```python
### Reference the deployment compute target ###
aks_name = 'mlblogaks'
aks_target = ComputeTarget(ws, aks_name)
namespace = 'models'
```

### Deploy Model (Control)

The first model that we are going to deploy will handle 80% of the incoming traffic. Because there is only one endpoint version at this point in time, the first version will be the _default_ and considered the _control_ version. The _default_ endpoint version will handle all traffic that is not accounted for in the traffic percentiles. For example, if we have two model versions deployed that are each handling 40% of incoming traffic, there is still 20% of traffic that is not accounted for (40% + 40% = 80%). That extra 20% will be routed to the _default_ version.

```python
### Define the endpoint and version name ###
endpoint_name = 'higgs-xgboost'
version_name = 'higgs-v{}'.format(model_version)
version_traffic = 80

### Create the deployment config and define the scoring traffic percentile for the first deployment ###
endpoint_deployment_config = AksEndpoint.deploy_configuration(cpu_cores=1,
                                                              memory_gb=1,
                                                              enable_app_insights=True,
                                                              collect_model_data=True,
                                                              tags={
                                                                  'modelName': model_name,
                                                                  'modelType': 'XGBoost',
                                                                  'modelVersion': model_version,
                                                              },
                                                              description='XGBoost model trained on UCI Higgs dataset',
                                                              version_name=version_name,
                                                              traffic_percentile=version_traffic,
                                                              auth_enabled=True,
                                                              namespace=namespace)

### Deploy the model and endpoint ###
print(
    f'... Deploying Model Version {model_version} (Control): {version_traffic}% traffic ...')
endpoint = Model.deploy(ws, endpoint_name, [model], inference_config, endpoint_deployment_config, aks_target)
endpoint.wait_for_deployment(True)
```

:::note
After this step you now have a versioned model deployment accessible at

`https://<unique-aml-hash>.eastus.cloudapp.azure.com:443/api/v1/service/higgs-xgboost/score`
:::

## Deploy New Model

The second model that we are deploying is the _treatment_. We want to figure out if this model is going to perform better or worse than the existing _control_ version. Once we have determined if the _treatment_ is outperforming the _control_ (or is underperforming), we can consider promoting the _treatment_ model and phasing out the old _control_.

:::note
All referenced code in [Deploy New Model](#deploy-new-model) can be found in [rollout.py](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/blob/master/examples/azureml/deployment/aks-realtime-canary-deployment/rollout.py)
:::

### Get Existing Resources

First we need to fetch current deployment and the newly registered model.

```python
### Load New AzureML Model ###
model_name = 'demo-higgs'

model_version = 2
model = Model(ws, name=model_name, version=model_version)

### Create inference configs for model scoring ###
path_to_files = "examples/azureml/deployment/aks-realtime-canary-deployment/"
inference_config = InferenceConfig(entry_script="{}/new_score.py".format(path_to_files),
                                   conda_file="{}/env.yml".format(
    path_to_files),
    runtime="python")

### Reference the deployment compute target ###
aks_name = 'mlblogaks'
aks_target = ComputeTarget(ws, aks_name)
namespace = 'models'

### Get the endpoint ###
endpoint_name = 'higgs-xgboost'
endpoint = AksWebservice(name=endpoint_name, workspace=ws)
```

### Deploy New Model With Minimal Traffic

```python
### Add second model with different traffic percentile ###
version_name = 'higgs-v{}'.format(model_version)
version_traffic = 20

print(
    f'... Deploying Model Version B (Treatment): {version_traffic}% traffic ...')
endpoint.create_version(models=[model],
                        inference_config=inference_config,
                        collect_model_data=True,
                        tags={'modelName': model_name,
                              'modelType': 'XGBoost', 'modelVersion': model_version},
                        description='XGBoost model trained on UCI Higgs dataset',
                        version_name=version_name,
                        traffic_percentile=version_traffic)
endpoint.wait_for_deployment(True)
```

## Model Promotion

In our example, we have determined that the _treatment_ that has been deployed is outperforming the current _control_ version. In this case, we want to update the current _control_ to handle only 20% of the traffic. Remember, because the _control_ is also labelled as the _default_ version, it will still be handling 80% of the total traffic until we update the _treatment_ version.

:::note
All referenced code in [Model Promotion](#model-promotion) can be found in [model_promotion.py](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/blob/master/examples/azureml/deployment/aks-realtime-canary-deployment/model_promotion.py)
:::

### Promote New Model

Now that the new model has been confirmed to outperform the old model we can swap the two version for a short period of time to have a safe transfer.

```
### Update version A to lower traffic percentile ###
print('... Updating Model Version A with decreased traffic percentile ...')
version_a_name = 'higgs-v1'
endpoint.update_version(version_name=endpoint.versions[version_a_name].name,
                        traffic_percentile=20)

### Wait for the update to complete before updating version B ###
endpoint.wait_for_deployment(True)
```

After reducing the traffic percentile for the _control_, we want to increase the traffic being routed to the _treatment_. Since we want to phase out the current _control_, we will also promote the _treatment_ version to be the new _control_ and _default_ version:

```
### Update version B to higher traffic percentile and designate as default + control ###
print('... Updating Model Version B with increased traffic percentile ...')
version_b_name = 'higgs-v2'
endpoint.update_version(version_name=endpoint.versions[version_b_name].name,
                        traffic_percentile=80,
                        is_default=True,
                        is_control_version_type=True)

### Wait for the update to complete before deleting ###
endpoint.wait_for_deployment(True)
```

Finally, we want to get rid of the old _control_ entirely once the transfer has been deemed safe

```
### Delete version A in the endpoint ###
print('... Deleting outdated Model version ...')
version_a_name = 'higgs-version-a'
endpoint.delete_version(version_name=version_a_name)
```

This process can be repeated as you train models in the future, introducing them to a small percentage of the incoming traffic before committing to the model long-term.

:::note
You can use the AzureML SDK to check on current deployment status. An example can be found [here](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/blob/master/examples/azureml/deployment/aks-realtime-canary-deployment/model_status.py)
:::

## Model Service Details

The only extra code that you need to provide AzureML with is the _scoring file_ and the _environment file_. Our use case uses a Python runtime, so our scoring file consists of Python code. Behind the scenes, AzureML will use your scoring and environment files to create a Docker container that runs a [Flask](https://flask.palletsprojects.com/en/1.1.x/) application, which is also wrapped in [gunicorn](https://gunicorn.org/) to allow the Flask application to run in a multi-threaded fashion. This Docker container will then be deployed to AKS as our web service.

### Environment File

The environment file is a YAML file that specifies the dependencies of our scoring file:

```
name: xgb_controlled_rollout
dependencies:
  - python=3.6.2
  - pip:
    - azureml-defaults>=1.0.45
    - azureml-monitoring==0.1.0a21
    - xgboost==1.1.1
    - numpy
    - inference-schema[numpy-support]
```

### Scoring File

The scoring file is the core logic of your web service. It is broken into two main functions: _init_, and _run_. The following script is a complete scoring file. Much of it will look confusing at first, not to worry, we'll break down each piece.

```
import json
import numpy as np
import os
import xgboost as xgb

from azureml.core.model import Model
from azureml.monitoring import ModelDataCollector

from inference_schema.schema_decorators import input_schema, output_schema
from inference_schema.parameter_types.numpy_parameter_type import NumpyParameterType

### Initialize globals for repeated use in the 'run' function ###
def init():
    global model

    ### Note here "xgb_higgs_gpu.pkl" is the name of the model object registered ###
    model_path = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'xgb_higgs_gpu.pkl')

    ### Deserialize the model file back into an XGBoost model ###
    model = xgb.Booster({'nthread': 4})
    model.load_model(model_path)

    ### Configure data collection for retroactive analysis of incoming request data ###
    global input_dc, prediction_dc

    input_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                                  model_version = '1',
                                  webservice_name = 'higgsxgboost',
                                  designation = 'inputs',
                                  feature_names = ['feat1', 'feat2', 'feat3', 'feat4', 'feat5', 'feat6', 'feat7', 'feat8', 'feat9', 'feat10',
                                                'feat11', 'feat12', 'feat13', 'feat14', 'feat15', 'feat16', 'feat17', 'feat18', 'feat19', 'feat20',
                                                'feat21', 'feat22', 'feat23', 'feat24', 'feat25', 'feat26', 'feat27', 'feat28'])

    prediction_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                                       model_version = '1',
                                       webservice_name = 'higgsxgboost',
                                       designation = 'predictions',
                                       feature_names = ['prediction'])

### Provide example inputs and outputs to populate Swagger Endpoint ###
input_sample = np.array([[1.1386826, -0.72663486, -0.00578982, 0.20411839, 0.15384236, 1.58590412,
                        -0.04557601, -1.44852722, 1.08653808, 1.59847081, 0.39929485, 0.12806517,
                        2.21487212, 1.20669425, 0.1385307, 1.29632187, 0.000000, 0.37922832,
                        -2.43980002, 0.07364186, 0.000000, 1.79049718, 1.73059154, 0.98058659,
                        0.74306524, 2.37875152, 1.53486252, 1.22755849]])
output_sample = np.array([-0.8446956])

### Provide logic to be run on each request to the service ###
@input_schema('data', NumpyParameterType(input_sample))
@output_schema(NumpyParameterType(output_sample))
def run(data):
    try:
        dmatrix_input = xgb.DMatrix(data)
        result = model.predict(dmatrix_input)

        ### Collect inputs and predictions for future analysis ###
        input_dc.collect(data)
        prediction_dc.collect(result)

        ### you can return any datatype as long as it is JSON-serializable ###
        return result.tolist()
    except Exception as e:
        error = str(e)
        return error
```

### The Init Function

_Init_ is used to initialize any long-lived objects and is only run one time when the Docker container is initialized. Model objects are a perfect candidate for the _init_ function, as you wouldn't want to re-initialize it every time a new request comes in. In our case, we also initialize the data collectors that will be used to collect incoming data and outgoing predictions for every request. Notice all of the initialized variables are _global_ to allow for reuse on every request.

```
### Initialize globals for repeated use in the 'run' function ###
def init():
    global model

    ### Note here "xgb_higgs_gpu.pkl" is the name of the model object registered ###
    model_path = os.path.join(os.getenv('AZUREML_MODEL_DIR'), 'xgb_higgs_gpu.pkl')

    ### Deserialize the model file back into an XGBoost model ###
    model = xgb.Booster({'nthread': 4})
    model.load_model(model_path)

    ### Configure data collection for retroactive analysis of incoming request data ###
    global input_dc, prediction_dc

    input_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                                  model_version = '1',
                                  webservice_name = 'higgsxgboost',
                                  designation = 'inputs',
                                  feature_names = ['feat1', 'feat2', 'feat3', 'feat4', 'feat5', 'feat6', 'feat7', 'feat8', 'feat9', 'feat10',
                                                'feat11', 'feat12', 'feat13', 'feat14', 'feat15', 'feat16', 'feat17', 'feat18', 'feat19', 'feat20',
                                                'feat21', 'feat22', 'feat23', 'feat24', 'feat25', 'feat26', 'feat27', 'feat28'])

    prediction_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                                       model_version = '1',
                                       webservice_name = 'higgsxgboost',
                                       designation = 'predictions',
                                       feature_names = ['prediction'])
```

### The Run Function

_Run_ contains the logic that is fired every time a new request reaches the web service. In our example, we convert the incoming data to a DMatrix for prediction with the XGBoost model. We then collect the incoming data and the prediction output with the data collection objects we created in the _init_ function. Finally, we convert the results to a list and return it to the user.

```
### Logic that is executed for every request ###
def run(data):
    try:
        dmatrix_input = xgb.DMatrix(data)
        result = model.predict(dmatrix_input)

        ### Collect inputs and predictions for future analysis ###
        input_dc.collect(data)
        prediction_dc.collect(result)

        ### you can return any datatype as long as it is JSON-serializable ###
        return result.tolist()
    except Exception as e:
        error = str(e)
        return error
```

### Input/Output Schema

When a consumer wants to get a prediction from your web service, they will need to know how to provide data and also what the response data will look like. AzureML has built in decorators to provide exactly this functionality. By providing an input and output sample, AzureML will automatically generate and store [Swagger](https://swagger.io/) documentation for your endpoint. Users can then view the [Swagger](https://swagger.io/) documentation and know exactly how to generate predictions from your web service.

```
### Provide example inputs and outputs to populate Swagger Endpoint ###
input_sample = np.array([[1.1386826, -0.72663486, -0.00578982, 0.20411839, 0.15384236, 1.58590412,
                        -0.04557601, -1.44852722, 1.08653808, 1.59847081, 0.39929485, 0.12806517,
                        2.21487212, 1.20669425, 0.1385307, 1.29632187, 0.000000, 0.37922832,
                        -2.43980002, 0.07364186, 0.000000, 1.79049718, 1.73059154, 0.98058659,
                        0.74306524, 2.37875152, 1.53486252, 1.22755849]])
output_sample = np.array([-0.8446956])

### Provide logic to be run on each request to the service ###
@input_schema('data', NumpyParameterType(input_sample))
@output_schema(NumpyParameterType(output_sample))
def run(data):
    try:
        dmatrix_input = xgb.DMatrix(data)
        result = model.predict(dmatrix_input)

        ### Collect inputs and predictions for future analysis ###
        input_dc.collect(data)
        prediction_dc.collect(result)

        ### you can return any datatype as long as it is JSON-serializable ###
        return result.tolist()
    except Exception as e:
        error = str(e)
        return error
```

### Model Data Collection

In the interest of creating a true machine learning life cycle, the system doesn't end at the point of deployment. According to Ville Tuulos (Netflix), "the real problems start as soon as a model is deployed." Because models are tightly coupled with the data accessible to the system, collecting the incoming data and outgoing predictions is extremely important. By collecting this data over time, you can start monitoring things like [data drift](https://medium.com/data-from-the-trenches/a-primer-on-data-drift-18789ef252a6) and [concept drift](https://machinelearningmastery.com/gentle-introduction-concept-drift-machine-learning/). This information can inform the retraining process for your models that are in production down the road. The code snippet below is from our _init_ function, where we initialize the data collector objects provided by AzureML. Each data collector has the associated fields that we are collecting - for the inputs, all incoming features are collected - for outputs, the prediction is collected.

```
input_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                              model_version = '1',
                              webservice_name = 'higgsxgboost',
                              designation = 'inputs',
                              feature_names = ['feat1', 'feat2', 'feat3', 'feat4', 'feat5', 'feat6', 'feat7', 'feat8', 'feat9', 'feat10',
                                                'feat11', 'feat12', 'feat13', 'feat14', 'feat15', 'feat16', 'feat17', 'feat18', 'feat19', 'feat20',
                                                'feat21', 'feat22', 'feat23', 'feat24', 'feat25', 'feat26', 'feat27', 'feat28'])

prediction_dc = ModelDataCollector(model_name = 'higgs-xgboost-version-a',
                                   model_version = '1',
                                   webservice_name = 'higgsxgboost',
                                   designation = 'predictions',
                                   feature_names = ['prediction'])
```

### Monitoring with Application Insights

In addition to monitoring the data inputs and outputs, it is also important to collect telemetry around the health of your serving infrastructure. AzureML logs this type of telemetry through Azure [Application Insights](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-enable-app-insights#view-metrics-and-logs). To begin collecting information related to request/failure rates, response times, availability, and exceptions, you just need to set the `enable_app_insights` to `True` when deploying your endpoint. The following code snippet is from the deployment Python file:

```
### Create the deployment config and define the scoring traffic percentile for the first deployment ###
endpoint_deployment_config = AksEndpoint.deploy_configuration(cpu_cores = 1,
                                                              memory_gb = 1,
                                                              enable_app_insights = True,
                                                              collect_model_data = True,
                                                              tags = {'modelName': model_name, 'modelType': 'XGBoost', 'modelVersion': '1'},
                                                              description = 'XGBoost model trained on UCI Higgs dataset',
                                                              version_name = version_a_name,
                                                              traffic_percentile = version_a_traffic,
                                                              auth_enabled = True,
                                                              namespace = namespace)
```

## Closing Remarks

For a true machine learning lifecycle, it is important to not only deploy your models, but also to monitor them over time in production. Hopefully this post provides insight into how you can mitigate risk when deploying new models into production, while also monitoring inputs and outputs to be aware of endpoint health.

We would love to hear more about any of your machine learning use cases, please don't hesitate to reach out!

- Danny Sievers (daniel.sievers@optum.com)
- Max Marchionda (max.marchionda@optum.com)

:::info
Full code examples can be found in our [GitHub repository](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/tree/master/examples/azureml/deployment/aks-realtime-canary-deployment)
:::

## Continued Reading

1. [Training an XGBoost model with GPUs and AzureML Pipelines](https://ai-community.uhg.com/blog/xgb-pipeline)
2. [Create Labeled Datasets with AzureML Data Collection and Pipelines](https://ai-community.uhg.com/blog/labeled-datasets)
3. [Model Monitoring and Why it is Important](https://christophergs.com/machine%20learning/2020/03/14/how-to-monitor-machine-learning-models/)
4. [AzureML Documentation](https://docs.microsoft.com/en-us/azure/machine-learning/)
