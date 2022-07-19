---
slug: xgb-pipeline
title: Data Preprocessing and XGBoost Model Training on GPU with AzureML Pipelines
author: Danny Sievers
author_title: Machine Learning Engineer, AI Platforms & Transformation
author_url: https://github.optum.com/dsievers
author_image_url: /img/userphoto.png
tags: [xgboost, AzureML, pipelines, ML Engineering]
---

**_Co-authored by Max Marchionda_**

Machine learning projects can become expensive and complex very quickly. By using AzureML Pipelines, you can simplify ML workflows into a series of repeatable steps with Azure compute targets that save money and time. In this example, you will see how to use AzureML Pipelines with Optum IQStudio to train an XGBoost model on a GPU.

<!--truncate-->

## Requirements

This example has the following requirements:

- [Azure Machine Learning Python SDK](https://docs.microsoft.com/en-us/python/api/overview/azure/ml/?view=azure-ml-py)
- [IQStudio Workspace](https://workbench.optum.ai/workspaces/)
- [AzureML Workspace](https://workbench.optum.ai/azureml-workspace/)
- [AmlCompute CPU cluster](https://workbench.optum.ai/azureml-compute-cluster/)
- [AmlCompute GPU cluster](https://workbench.optum.ai/azureml-compute-cluster/)

## Infrastructure Components

Optum IQStudio provides a [single command to create an AzureML Workspace](https://workbench.optum.ai/azureml-workspace/#deploying-an-azureml-workspace) within your IQStudio Workspace. After creating an AzureML Workspace, the Pipelines functionality becomes available. However, to use AzureML Pipelines, you will need at least one compute target. For this example, we use two different AzureML Compute clusters. One AmlCompute cluster is a CPU VM sku (Standard_D13_v2) with an SSD and large amounts of memory, while the other is a GPU VM sku (Standard_NC6). Each cluster is suited for a specific task. The first step, which is used for data preprocessing, requires a large amount of memory, so we will use the CPU/SSD AmlCompute cluster. The second step, which is used for model training, requires a GPU, so we will use the GPU AmlCompute cluster.

## Pipeline Overview

The following pipeline consists of two main steps:

1. Create Train/Test Split From Raw Data
2. Train XGBoost Model

Our pipeline begins by providing [PipelineParameters](https://docs.microsoft.com/en-us/python/api/azureml-pipeline-core/azureml.pipeline.core.graph.pipelineparameter?view=azure-ml-py) that describe a registered AzureML Dataset containing our raw data. The Dataset is a [Tabular Dataset](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.data.tabulardataset?view=azure-ml-py), named `higgs-small`. It was registered from the [UCI Higgs Boson dataset](https://archive.ics.uci.edu/ml/datasets/HIGGS) that we uploaded to the AzureML Datastore associated with the IQStudio workspace blob container.

The Dataset is read in during the first Pipeline step named - Create Train/Test Split From Raw Data. This step will create two Outputs - higgs_train_dmatrix and higgs_test_dmatrix. These Outputs are computed by splitting the raw data into a train and test set, which are then converted to a [DMatrix](https://xgboost.readthedocs.io/en/latest/python/python_api.html#xgboost.DMatrix) and provided as Input into the final step - Train XGBoost Model.

The final step takes the two [DMatrix](https://xgboost.readthedocs.io/en/latest/python/python_api.html#xgboost.DMatrix) Inputs and trains an XGBoost model. Once the model is trained, it is registered as an AzureML Model for versioning and downstream use.

One important thing to understand is that the Pipeline configuration and creation code exists _separately_ from the code that is actually being run as part of the Pipeline step itself. In our example, there is the xgb-pipeline.ipynb file that creates the Pipeline configuration. However, the actual code that is being run as part of the Pipeline is made up of the train-test-split.py, and the train.py files that get submitted to a compute target to then be run.

![AzureML Pipeline](https://github.optum.com/raw/OptumIQStudio/OptumIQ-Studio-ML-Engineering/master/examples/azureml/pipelines/aml-compute-xgb-gpu/pipeline.jpg)

### Authentication to AzureML Workspace

Let's get started by authenticating to our AzureML Workspace:

```python
from azureml.core import Workspace

### Authenticate to AzureML Workspace ###
iqs_workspace_name = 'mlblog'

resource_group = '{}-common'.format(iqs_workspace_name)
aml_workspace_name = '{}-aml'.format(iqs_workspace_name)

subscription_id = 'b9a8036a-370e-4737-a287-7082737c2534'

ws = Workspace.get(name=aml_workspace_name,
                   subscription_id=subscription_id,
                   resource_group=resource_group)
```

### Create Train/Test Split From Raw Data Step

Before training our XGBoost model, we want to do some data preprocessing to get the data prepared for training. The following sections detail how we set up the data preparation step in the AzureML Pipeline.

#### Configuring Compute Target

Each Pipeline step must have infrastructure to run on, this infrastructure is called a Compute Target. For the data preprocessing step, we require an AmlCompute cluster with a lot of memory to hold our intermediate Pandas dataframe. In this case, we used the VM sku Standard_D13_v2, which also has SSD storage that makes it efficient for reads and writes. Using the AzureML Python SDK, we get a reference to our AmlCompute cluster like this:

```python
ssd_cluster = ComputeTarget(workspace=authenticated_ws_object, name='nameofyourcpucluster')
```

#### Configuring Parameters and Outputs

To leverage AzureML Datasets in our data preprocessing step, we create three PipelineParameters for the raw data and two Outputs for the processed data. In our preprocessing script, we will read in the raw data which is registered as an AzureML Dataset. Below you can see how to create PipelineParameters:

```python
### Create PipelineParameter specifying the name of the Dataset to be used in training ###
raw_dataset_name_param = PipelineParameter(name='raw_dataset_name', default_value='higgs-small')

### Create PipelineParameter specifying the version of the Dataset to be used in training ###
raw_dataset_version_param = PipelineParameter(name='raw_dataset_version', default_value=1)

### Create PipelineParameter specifying the comma-separated feature names to be used from the training Dataset ###
feature_names_param = PipelineParameter(name='feature_names', default_value='jet_1_b-tag,jet_1_eta,jet_1_phi,jet_1_pt,jet_2_b-tag,jet_2_eta,' \
            'jet_2_phi,jet_2_pt,jet_3_b-tag,jet_3_eta,jet_3_phi,jet_3_pt,jet_4_b-tag,jet_4_eta,jet_4_phi,jet_4_pt,lepton_eta,lepton_pT,' \
            'lepton_phi,m_bb,m_jj,m_jjj,m_jlv,m_lv,m_wbb,m_wwbb,missing_energy_magnitude,missing_energy_phi')

### Create PipelineParameter specifying the name of the label column in the training Dataset ###
label_column_name_param = PipelineParameter(name='label_column_name', default_value='class_label')
```

After we have done our preprocessing on the raw Dataset, we want to create Outputs for the next step to consume as Inputs. You can create an Output with the following code:

```python
train_dmatrix_output = PipelineData('higgs_train_dmatrix',
                                    datastore=datastore).as_dataset()

test_dmatrix_output = PipelineData('higgs_test_dmatrix',
                                    datastore=datastore).as_dataset()
```

#### Configuring Step RunConfiguration

Pipeline RunConfiguration objects define the environment that needs to be set up on the compute target infrastructure. When creating a RunConfiguration, users can specify custom Docker images and other dependencies that need to be included. In our example, we use the default CPU base image provided by AzureML for the data preprocessing step and inject Python package dependencies with the CondaDependencies object:

```python
# Create a new runconfig object
dataprep_run_config = RunConfiguration()

# Specify the ssd_cluster referenced above
dataprep_run_config.target = ssd_cluster

# Enable Docker
dataprep_run_config.environment.docker.enabled = True

# Set Docker base image to the default CPU-based image
dataprep_run_config.environment.docker.base_image = DEFAULT_CPU_IMAGE

# Use conda_dependencies.yml to create a conda environment in the Docker image for execution
dataprep_run_config.environment.python.user_managed_dependencies = False

# Specify CondaDependencies obj, add necessary packages
dataprep_run_config.environment.python.conda_dependencies = CondaDependencies.create(
    pip_packages=[
        'azureml-sdk',
        'azureml-defaults',
        'xgboost==1.1.1',
        'scikit-learn',
        'numpy'
    ]
)
```

#### Creating the Preprocessing Pipeline Step

Once all of the pieces of your Pipeline step have been configured - PipelineParameters, Outputs, Compute Target, Run Configuration - it is time to create the actual Pipeline step itself. Our example uses a PythonScriptStep that will take a local Python script and run it on the compute target specified.

```python
### Create data prep PythonScriptStep for AzureML Pipeline ###
train_dmatrix_name = 'higgs_train.dmatrix'
test_dmatrix_name = 'higgs_test.dmatrix'

data_prep_script_name = 'train-test-split.py'

data_prep_step = PythonScriptStep(
    name='Create Train/Test Split From Raw Data',
    script_name=data_prep_script_name,
    arguments=['--raw_dataset_name', raw_dataset_name_param,
               '--raw_dataset_version', raw_dataset_version_param,
               '--feature_names', feature_names_param,
               '--label_column_name', label_column_name_param,
               '--output_train', train_dmatrix_output,
               '--output_test', test_dmatrix_output,
               '--train_dmatrix_name', train_dmatrix_name,
               '--test_dmatrix_name', test_dmatrix_name],
    outputs=[train_dmatrix_output, test_dmatrix_output],
    compute_target=ssd_cluster,
    runconfig=dataprep_run_config,
    source_directory=source_directory,
    allow_reuse=True
)
```

### Train XGBoost Model Step

After the data preprocessing step completes and creates the DMatrix Outputs, we want to use those Outputs as Inputs to train an XGBoost model. The following sections detail how we set up the model training step in our AzureML Pipeline.

#### Configuring Compute Target

To accelerate our XGBoost model training, we want to use a GPU machine. Our AmlCompute GPU cluster makes a fine target for this step and can be configured as follows:

```python
gpu_cluster = ComputeTarget(workspace=authenticated_ws_object, name='nameofyourgpucluster')
```

#### Configuring Inputs

For our example, we do not have any Pipeline Outputs for the training step, since we will be registering a model with AzureML in our training Python script. However, we have Inputs that we want to consume in the training step from the previous data preprocessing step. Since we have already [defined our Outputs from the previous step](#configuring-inputs-and-outputs), we can use those same Output objects as inputs to the training step ([seen below when creating our training step](#creating-the-pipeline-step))

#### Configuring Step RunConfiguration

For our training step, we use the default AzureML GPU base image and add dependencies with a CondaDependencies object:

```python
training_script_name = 'train.py'
source_directory = '.'

xgbenv = Environment(name='xgboost')
xgbenv.docker.enabled = True
xgbenv.docker.base_image = DEFAULT_GPU_IMAGE

# Define the packages needed by the model and scripts
conda_dep = CondaDependencies()
conda_dep.add_pip_package('azureml-defaults')
conda_dep.add_pip_package('xgboost==1.1.1')
conda_dep.add_pip_package('numpy')

xgbenv.python.conda_dependencies=conda_dep

runconfig = ScriptRunConfig(source_directory=source_directory, script=training_script_name)

# Attach compute target to run config
runconfig.run_config.target = gpu_cluster

# Attach environment to run config
runconfig.run_config.environment = xgbenv
```

#### Creating the Training Pipeline Step

Now that we have configured the pieces of the training step, we can create the following PythonScriptStep:

```python
xgb_step = PythonScriptStep(
    name='Train XGBoost Model',
    script_name=training_script_name,
    arguments=['--raw_dataset_name', raw_dataset_name_param,
               '--raw_dataset_version', raw_dataset_version_param],
    runconfig=runconfig.run_config,
    source_directory=source_directory,
    inputs=[train_dmatrix_output.as_direct(),
            test_dmatrix_output.as_direct()]
)
```

As you can see, the Inputs to this steps are actually the [Outputs specified from the data preprocessing step](#configuring-inputs-and-outputs) before.

### Creating the AzureML Pipeline

Once you have created all of your steps, it's time to tie them together as a full AzureML Pipeline:

```python
steps = [data_prep_step, xgb_step]
pipeline = Pipeline(workspace=ws, steps=[steps])
pipeline_run = Experiment(ws, 'DataPrepAndTraining').submit(pipeline)
```

The final line in the example above creates an AzureML Experiment and actually submits a Run of the pipeline we just created. After you submit the pipeline, you can view the details of the Run in the [AzureML UI](https://ml.azure.com) Pipelines section.

### Publishing the AzureML Pipeline

Publishing an AzureML Pipeline creates a REST endpoint that allows others to [trigger the Pipeline via REST calls over HTTP](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-create-your-first-pipeline#publish-a-pipeline). For example, imagine that you have an [Azure Function](https://docs.microsoft.com/en-us/azure/azure-functions/) that is listening to the [Azure Event Grid](https://docs.microsoft.com/en-us/azure/event-grid/overview) for new uploads to blob storage. When new data shows up in the storage location, the Azure Function could run and trigger the Pipeline via the REST endpoint and a new model could be trained.

```python
published_pipeline = pipeline.publish(name=pipeline_name,
                                      description='Train an XGBoost model with a Tabular Dataset and GPU machine',
                                      version='1')
```

## Closing Remarks

AzureML Pipelines provide the framework for creating robust and repeatable machine learning instructions. By using compute targets that scale from 0 such as AmlCompute or Databricks, users can experience significant cost savings for batch workloads. AzureML Pipelines can also tie in the rest of the AzureML ecosystem such as Datasets, Models, Endpoints, and Experiments so that users can create a true end-to-end machine learning lifecycle.

!!! info "Full code examples can be found in our [GitHub repository](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/tree/master/examples/azureml/pipelines/aml-compute-xgb-gpu)"

## Contact Us

We would love to hear about your machine learning use cases! Feel free to contact Danny Sievers (daniel.sievers@optum.com) or Max Marchionda (max.marchionda@optum.com) for more information about ML engineering at Optum.

## Continued Reading

1. [Canary Deployments with AzureML and Azure Kubernetes Service](https://ai-community.uhg.com/blog/canary-deployments)
2. [Create Labeled Datasets with AzureML Data Collection and Pipelines](https://ai-community.uhg.com/blog/labeled-datasets)
3. [AzureML Pipelines Documentation](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-create-your-first-pipeline)
4. [AzureML SDK Documentation](https://docs.microsoft.com/en-us/python/api/overview/azure/ml/?view=azure-ml-py)
5. [AzureML Documentation](https://docs.microsoft.com/en-us/azure/machine-learning/)
