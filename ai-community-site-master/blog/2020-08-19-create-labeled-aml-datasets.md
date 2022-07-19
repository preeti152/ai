---
slug: labeled-datasets
title: Create Labeled Datasets with AzureML Pipelines
author: Danny Sievers
author_title: Machine Learning Engineer, AI Platforms & Transformation
author_url: https://github.optum.com/dsievers
author_image_url: /img/userphoto.png
tags: [labeled datasets, AzureML, ML Engineering]
---

**_Co-authored by Max Marchionda_**

Machine learning has changed the way that software is being written. Andrej Karpathy, Director of AI at Tesla, calls it [Software 2.0](https://medium.com/@karpathy/software-2-0-a64152b37c35). A majority of these new systems require a key component: labeled data. We're going to use AzureML Pipelines to show how you can create labeled datasets by joining feature data ([collected from a deployed model](https://ai-community.uhg.com/blog/canary-deployments)) with associated labels.

<!--truncate-->

## Requirements

- [Azure Machine Learning Python SDK](https://docs.microsoft.com/en-us/python/api/overview/azure/ml/?view=azure-ml-py)
- [IQStudio Workspace](https://workbench.optum.ai/workspaces/)
- [AzureML Workspace](https://workbench.optum.ai/azureml-workspace/)
- [AmlCompute Cluster](https://workbench.optum.ai/azureml-compute-cluster/)
- Feature data stored in an AzureML Datastore
- Label data stored in an AzureML Datastore

:::caution
Feature and label data entries must be associated with a shared ID

To create a labeled dataset, we are assuming that the incoming data (feature data) and the acquired labels share a unique ID. This ID will be used to associate data entries across files.
:::

### Optional Requirements

- [Model deployed with AzureML Data Collection](https://ai-community.uhg.com/blog/canary-deployments)
- [Data collected via AzureML Data Collection registered as AzureML Datastore](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-access-data#create-and-register-datastores-via-the-sdk)

:::caution
At the time of this writing, IQStudio Workbench does not automatically register the modeldata container that contains collected data from deployed AzureML Models.

The IQS team is working on automatically registering this as a Datastore. For now, we manually register the Datastore - this requires Contributor permissions in your Azure subscription.
:::

## Importance and Difficulty of Acquiring True Labels in Healthcare

Before we dive into [the technical details](#overview) of this post, it is useful to understand one of the largest pain points for machine learning in healthcare: label acquisition. When machine learning is applied to a new problem space, the largest barrier to creating effective models is the lack of labeled training data. This is especially true for the healthcare industry. Label acquisition for healthcare problems may require:

- The consultation of domain experts - doctors, nurses, etc.
- Time delay and hidden complexity

### Domain Expertise Required for Label Acquisition

Let's start with a real world example: we want to predict risk of heart disease in patients based on their past claims history and clinical data. We have a model that is deployed and serving risk scores to inform a pysician's decision making process. Every time a physician or nurse inputs the required information, that data is collected by our system and stored. We want to use this data to improve our current training dataset, or build a new dataset for retraining.

To make this incoming data valuable for model development, we need to acquire labels. In many cases, techniques like [weak labeling](https://watermark.silverchair.com/nwx106.pdf?token=AQECAHi208BE49Ooan9kkhW_Ercy7Dm3ZL_9Cf3qfKAc485ysgAAApkwggKVBgkqhkiG9w0BBwagggKGMIICggIBADCCAnsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMfXQjAmnryDEtUqRTAgEQgIICTBPKwgXU6JM27S1wKRXyYvAvUL7LK5vyYbBsjX1Fp9Sq3bUGevIwAK7hjPJlB1QkwnUzJJAj5k0L3SPPfav5yZqY17F3iG0BDHv4C_2ki86LzEwJwYsBoXA2n2u_fTysmETh_cnVzuOaRlsiLE98hV6DuaGl-cEdv2uD7Ct1t3MSKjDGXyMiqR0gPkKyM8arZsDDvl1pXGneQiezfXiTe3pt-fOFelzyahaIs4hgvXx0mM196Qqw6ZjvFnvEglSM8W0vetUe9hfnOT8QxY5bWi94QWXFUSsQF_UuDXaBafyQXZdPjvG06VCwN6Xg1j7TlFUmxyoJs6fdiAnosIsRS3jrtCGCwxTTYUKWgLMlOhH-1cYnEF0WzeatXta1YProCu4t90pO2-CYDE7ivVg4zWZf0rfx7SHOa9xGEW0EXuEkNtA-Vi-787spjrgCqD75hHFVSw0aYwkDrGQo587nXJLz5OzxeYiqpie9z96b93JvqPfbtGWqcw1T_YTgHd5_Zb4g8tWfy3SDfxe-pdb9vOfGvY3l1g8ZwDnWAl7aa6DAOlbIWB8Rr1Zk7xLpGPoBi1d_krQAoBY73EWMMutlwzai_ETTK9RbskQbu9P0hQ9vVHt-x4sJLgPxisrqj_0DNz4UpMLiEch8xklhu2ETHmpR4AeequzWYkiJ42S-JHuKpv0dGSt2gOOE4L3xmfPDUzBV4JBh4EkJ7iXgHSy_aqLFziNTyAp-uIzaAsaMRtnY3KLEfSWo9OiidbzhXv3NhdI69sWwvYgLOzQIrg) are used to generate "near-ground-truth" labels. However, scenarios where a model is being used to inform decisions that can have a significant impact on an individual's health outcome, "near-ground-truth" may not be the type of data we want to be training on.

To acquire true labels, we would need to consult a domain expert - these experts likely do not have the time to sit around manually labeling millions of data inputs.

### Time Delay and Hidden Complexity in Label Acquisition

For the example above, predicting risk of heart disease, the true label may not be available until years down the road, when the patient does in fact have heart disease. If the patient does not have heart disease, when do we say the true label is negative? Contrast this label acquisition process with a model that is serving advertisements to a user visiting a website. If the user clicked on the ad, the label can be systematically captured as positive. If the user did not click on the ad, the label can be systematically captured as negative. The hidden complexities of healthcare label acquisition make this a difficult problem to solve.

## Overview

This post is not going to tackle the problem of label acquisition. Instead, we are focusing on how to improve the machine learning system post-label acquisition. We will show how to use AzureML Pipelines to create a labeled dataset by joining feature data that has been collected from a deployed model with associated labels.

### Infrastructure Components

Our Pipeline will consist of a single step that joins two CSV files on a shared request ID column. To perform this join, we require compute that has a large amount of memory to hold the output Dataframe. We will use an AmlCompute cluster that scales from zero nodes to one node of the VM SKU Standard_D13_v2 (8 Cores, 56 GB RAM, 400 GB Disk). The compute infrastructure must be large enough to hold any intermediate Dataframes created during the pipeline.

### Authenticate to AzureML Workspace

Let's get started by authenticating to our AzureML Workspace:

```python
from azureml.core import Workspace

### Authenticate to AzureML Workspace ###
workspace_name = 'mlblog'

resource_group = '{}-common'.format(workspace_name)
workspace_name = '{}-aml'.format(workspace_name)

subscription_id = 'b9a8036a-370e-4737-a287-7082737c2534'

ws = Workspace.get(name=workspace_name,
                   subscription_id=subscription_id,
                   resource_group=resource_group)
```

### Specify Pipeline Compute Target

Our Pipeline will need a compute target to run the jobs. We are using an AmlCompute cluster named `highmemory` with a minimum node count of 0 and a max node count of 1. The VM SKU is Standard_D13_v2 (8 Cores, 56 GB RAM, 400 GB Disk):

```python
from azureml.core.compute import ComputeTarget

### Get reference to AmlCompute cluster ###
ssd_cluster = ComputeTarget(workspace=ws, name='highmemory')
```

### Define Dependencies with RunConfiguration Object

The Python script that runs during our Pipeline step has several dependencies. We can provide them by creating an AzureML RunConfiguration object. When we submit a run, AzureML will create (or reuse) a Docker container that contains all dependencies we specify:

```python
from azureml.core.environment import DEFAULT_CPU_IMAGE
from azureml.core.conda_dependencies import CondaDependencies
from azureml.core.runconfig import RunConfiguration

### Create a new runconfig object ###
update_dataset_run_config = RunConfiguration()

### Specify the ssd_cluster referenced above
update_dataset_run_config.target = ssd_cluster

### Enable Docker ###
update_dataset_run_config.environment.docker.enabled = True

### Set Docker base image to the default CPU-based image ###
update_dataset_run_config.environment.docker.base_image = DEFAULT_CPU_IMAGE

### Use conda_dependencies.yml to create a conda environment in the Docker image for execution ###
update_dataset_run_config.environment.python.user_managed_dependencies = False

### Specify CondaDependencies obj, add necessary packages ###
update_dataset_run_config.environment.python.conda_dependencies = CondaDependencies.create(
    pip_packages=[
        'azureml-sdk',
        'azureml-defaults',
        'pandas'
    ]
)
```

### Define Pipeline Parameters for Dynamic Inputs

One of the more complex pieces of this Pipeline is understanding how AzureML handles dynamic inputs. AzureML uses `PipelineParameters` to control inputs to a Pipeline step. When submitting an AzureML Pipeline, users can specify the value of each `PipelineParameter`. Our goal with this pipeline is to allow any feature dataset (without labels) stored in an AzureML Datastore to be joined with associated labels. Let's walk through how we do this with various Pipeline Parameters.

#### DataPath Pipeline Parameters

To access the target files that contain features and labels, AzureML allows users to pass a [DataPath](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.data.datapath.datapath?view=azure-ml-py) object. A DataPath is a reference to a specific location in an AzureML [Datastore](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.core.datastore.datastore?view=azure-ml-py). When the Pipeline step is executed, the provided DataPath will be mounted into the runtime container and the files will be available to the program. We have two DataPath Pipeline parameters, one referencing the file that contains the incoming features, and the other referencing the file that contains the labels associated with those features.

In our case, we are setting the default values of the DataPath parameters to use the data being collected from a model we deployed in a [prior post](https://ai-community.uhg.com/blog/canary-deployments). These default values can be overridden when submiting the Pipeline. The labels file in this article is a CSV of mocked labels for the incoming feature data. In reality, there would need to be external mechanisms in place to acquire these labels and save them to the Datastore with an associated request ID to match with each incoming feature.

```python
from azureml.data.datapath import DataPath, DataPathComputeBinding
from azureml.core.datastore import Datastore
from azureml.pipeline.core import PipelineParameter

### Build default base path ###
default_model_name = 'higgsxgboost'
default_endpoint_version = 'higgs-xgboost-version-b'
default_model_version = '2'

default_base_path = f'{subscription_id}/{resource_group}/{workspace_name}/{default_model_name}/{default_endpoint_version}/{default_model_version}'

default_incoming_data_path = default_base_path + '/inputs/2020/08/27/inputs.csv'
default_labels_path = default_base_path + '/labels/2020/08/27/labels.csv'

### Reference the default Datastore that contains incoming data and labels ###
default_datastore = Datastore(workspace=ws, name='modeldata')

### Create default DataPath objects for incoming data and incoming labels ###
default_incoming_datapath = DataPath(datastore=default_datastore, path_on_datastore=default_incoming_data_path)
default_incoming_labels_datapath = DataPath(datastore=default_datastore, path_on_datastore=default_labels_path)

### Create PipelineParameter for the incoming datapath ###
incoming_data_datapath_pipeline_param = (PipelineParameter(name='incoming_data_datapath', default_value=default_incoming_datapath),
                                         DataPathComputeBinding(mode='mount'))

### Create PipelineParameter for the lables associated with the incoming data ###
incoming_labels_datapath_pipeline_param = (PipelineParameter(name='incoming_labels_datapath', default_value=default_incoming_labels_datapath),
                                           DataPathComputeBinding(mode='mount'))
```

For context, here is a sample from inputs.csv (incoming features):

| feat1     | feat2       | feat3       | feat4      | feat5      | feat6      | feat6       | feat7       | feat8      | feat9      | feat10     | feat11     | feat12     | feat13     | feat14    | feat15     | feat16 | feat17     | feat18      | feat19     | feat20 | feat21     | feat22     | feat23     | feat24     | feat25     | feat26     | feat27     | feat28     | \$aml_dc_correlation_id              | \$aml_dc_scoring_timestamp | \$aml_dc_boundary | \$aml_workspace                                               | \$aml_service_name | \$aml_model_name        | \$aml_model_version | \$aml_request_id                     |
| --------- | ----------- | ----------- | ---------- | ---------- | ---------- | ----------- | ----------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | --------- | ---------- | ------ | ---------- | ----------- | ---------- | ------ | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ------------------------------------ | -------------------------- | ----------------- | ------------------------------------------------------------- | ------------------ | ----------------------- | ------------------- | ------------------------------------ |
| 1.1386826 | -0.72663486 | -0.00578982 | 0.20411839 | 0.15384236 | 1.58590412 | -0.04557601 | -1.44852722 | 1.08653808 | 1.59847081 | 0.39929485 | 0.12806517 | 2.21487212 | 1.20669425 | 0.1385307 | 1.29632187 | 0      | 0.37922832 | -2.43980002 | 0.07364186 | 0      | 1.79049718 | 1.73059154 | 0.98058659 | 0.74306524 | 2.37875152 | 1.53486252 | 1.22755849 | 1.47382187 | edea20ef-5f7e-43df-a9c8-33f22699877a | 2020-08-13T15:54:16.691697 | 1440              | b9a8036a-370e-4737-a287-7082737c2534/mlblog-common/mlblog-aml | higgsxgboost       | higgs-xgboost-version-b | 7                   | ae249167-ab81-46d2-9553-e42c1f93fa77 |

Below is a sample from labels.csv (associated labels):

| label | \$aml_request_id                     |
| ----- | ------------------------------------ |
| 1     | ae249167-ab81-46d2-9553-e42c1f93fa77 |

!!! info "Acquired labels must be associated with feature input via a shared column!"
To creat a labeled dataset, we are assuming that the incoming data (features) have a unique ID. In our case, that column name is `$aml_request_id`. You will notice that the labels.csv sample also has an `$aml_request_id`. This is the ID that is used to match features with their acquired labels.

#### Feature Names Pipeline Parameter

When users are sending data to our [deployed model](https://ai-community.uhg.com/blog/canary-deployments), they are sending specific features required for inference. We want to provide this list to our Pipeline, so it knows what columns to keep as part of the dataset. At the time of this writing, it is not possible to send `list` objects as Pipeline parameters, so we specify this list as a single string of comma-separated feature names.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter specifying the comma-separated feature names to be joined with labels ###
sample_feature_names = 'feat1,feat2,feat3,feat4,feat5,feat6,feat7,feat8,feat9,feat10,feat11,feat12,feat13,feat14,feat15,' \
                       'feat16,feat17,feat18,feat19,feat20,feat21,feat22,feat23,feat24,feat25,feat26,feat27,feat28'

feature_names_param = PipelineParameter(name='feature_names', default_value=sample_feature_names)
```

#### Label Column Pipeline Parameter

The file containing our labels may also contain columns that we do not care about. To avoid including unnecessary columns, we specify the name of the label column to be joined with our features.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter specifying the name of the labels column to be joined with features ###
label_column_param = PipelineParameter(name='label_column_name', default_value='label')
```

#### Request ID Column Name Parameter

When joining our feature and label datasets, we need to know which label is associated with which feature. Our Pipeline expects the request ID column name parameter to be shared between the label and feature datasets.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter specifying the name of the request id column used to join features and labels ###
request_id_column_param = PipelineParameter(name='request_id_column_name', default_value='request_id')
```

#### Is AzureML Data Collection Parameter

When the feature data is collected through AzureML data collection, the request ID is the `$aml_request_id` column. However, (at the time of this writing) if you send the column name `$aml_request_id` the leading `$` will cause parsing errors in the Python script that handles Pipeline parameters. If this parameter is set to the string `true`, the request ID column name will be set to `$aml_request_id` in the Python script.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter specifying if the incoming data was generated from AzureML Data Collection ###
is_aml_data_collection_param = PipelineParameter(name='is_aml_data_collection', default_value='true')
```

#### Target Output Datastore Name Parameter

After creating our labeled dataset, we want to save it to an AzureML Datastore so that we can register and version it as an AzureML Dataset. We will provide our Pipeline the name of the target Datastore.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter for the name of the Dataset to be created/updated ###
target_datastore_name_param = PipelineParameter(name='target_datastore_name', default_value='modeldata')
```

#### Target Output Path Parameter

We also want to allow the output path to be specified on the target Datastore.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter for the path of the labeled data output on target Datastore ###
target_output_path_param = PipelineParameter(name='target_output_path', default_value='labeled-data')
```

#### Target Output File Name Parameter

The labeled data will be saved to a specific file at the target Datastore path. This parameter is the name of the labeled data file.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter for the name of the labeled data output ###
target_output_file_name_param = PipelineParameter(name='target_output_file_name', default_value='labeled-data.csv')
```

#### Target Output Dataset Name Parameter

After saving the labeled data to a Datastore, we want to register and version the data as an AzureML Dataset. This parameter is the name of the Dataset to register - if it has already been registered, the Pipeline will create a new version of the Dataset.

```python
from azureml.pipeline.core import PipelineParameter

### Create PipelineParameter for the name of the Dataset to be created/updated ###
target_dataset_name_param = PipelineParameter(name='target_dataset_name', default_value='higgs-incoming-data')
```

!!! info "Limited data types allowed as Pipeline Parameter inputs"
At the time of this writing, the only data types allowed as Pipeline Parameter inputs are: int, float, bool, string, DataPath, PipelineDataset, FileDataset, and TabularDataset.

### Create Pipeline Step to Create/Update Labeled Dataset

Every AzureML Pipeline consists of Pipeline Steps. Each step runs a specified script on an AzureML compute target and can have inputs and outputs. Our Pipeline will consist of a single step that has [two DataPath inputs](#datapath-pipeline-parameters). Instead of having outputs, our script will register a new AzureML Dataset, or create a new version of the target Dataset if it already exists.

```python
from azureml.pipeline.steps import PythonScriptStep

### Create PythonScriptStep for AzureML Pipeline ###
source_directory = '.'

create_or_update_dataset_script = 'create-or-update-incoming-dataset.py'

create_or_update_dataset_step = PythonScriptStep(
    name='Create or update AzureML Dataset from specified DataPath by joining features and labels on request ID',
    script_name=create_or_update_dataset_script,
    arguments=['--incoming_data_datapath', incoming_data_datapath_pipeline_param,
               '--incoming_labels_datapath', incoming_labels_datapath_pipeline_param,
               '--feature_names', feature_names_param,
               '--label_column_name', label_column_param,
               '--request_id_column_name', request_id_column_param,
               '--is_aml_data_collection', is_aml_data_collection_param,
               '--target_output_path', target_output_path_param,
               '--target_output_file_name', target_output_file_name_param,
               '--target_datastore_name', target_datastore_name_param,
               '--target_dataset_name', target_dataset_name_param],
    inputs=[incoming_data_datapath_pipeline_param,
            incoming_labels_datapath_pipeline_param],
    compute_target=ssd_cluster,
    runconfig=update_dataset_run_config,
    source_directory=source_directory,
    allow_reuse=True
)
```

### Create and Run Pipeline

Now that we have the steps, inputs, and outputs defined for the Pipeline, it is time to create the Pipeline and submit a run. Since we have configured the various Pipeline parameters with default values, these values will be used during Pipeline submission. In our case, the parameter default values are the desired inputs - if they weren't we would [specify different parameter values](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.core.experiment.experiment?view=azure-ml-py#submit-config--tags-none----kwargs-) before submitting a run.

```python
### Create Pipeline and submit Experiment Run ###
pipeline_name = 'CreateOrUpdateIncomingDataset'

steps = [create_or_update_dataset_step]
pipeline = Pipeline(workspace=ws, steps=[steps])
pipeline_run = Experiment(ws, pipeline_name).submit(pipeline)
pipeline_run.wait_for_completion()
```

### Publish Pipeline

Publishing an AzureML Pipeline creates a REST endpoint that allows others to [trigger the Pipeline via REST calls over HTTP](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-create-your-first-pipeline#publish-a-pipeline). For example, imagine there is a Java application that is producing data that could be used to create a labeled dataset. Once this Java application has generated enough data and sent it to an Azure storage location, the system could trigger the Pipeline via the REST endpoint and the data could be registered as an AzureML Dataset and consumed by downstream data scientists.

```python
published_pipeline = pipeline.publish(name=pipeline_name,
                                      description='Create or update AzureML Dataset from specified DataPath by joining features and labels on request ID',
                                      version='1')
```

## Dataset Create/Update Script Details

With the Pipeline created, we can dig into the details of the code that is submited in our Pipeline step.

### Reference Workspace from Run Environment

From within a Pipeline execution, you can access the AzureML Workspace via the Run object. We also fetch the current working directory for future use.

```python
import os
from azureml.core import Run

cwd = os.getcwd()
run = Run.get_context()
workspace = run.experiment.workspace
```

### Parse Pipeline Parameters

We can access the [passed in Pipeline parameters](#define-pipeline-parameters-for-dynamic-inputs) by using the argparse package. These parameters are passed as command line flags to the Python script that is run by the Pipeline. Each argument is then available via `args.parameter_name`.

```python
### Parse incoming step arguments ###
parser = argparse.ArgumentParser('split')
parser.add_argument('--incoming_data_datapath', type=str, help='incoming data DataPath')
parser.add_argument('--incoming_labels_datapath', type=str, help='incoming labels DataPath')
parser.add_argument('--feature_names', type=str, help='string of comma separated feature names to be joined with labels')
parser.add_argument('--label_column_name', type=str, help='column name of the labels to be joined with features')
parser.add_argument('--request_id_column_name', type=str, help='column name of the request id to join feature names and labels')
parser.add_argument('--is_aml_data_collection', type=str, help='is incoming data from AzureML Data Collection? (true/false)')
parser.add_argument('--target_output_path', type=str, help='path to output labeled data on specified Datastore')
parser.add_argument('--target_output_file_name', type=str, help='file name for labeled data output on specified Datastore')
parser.add_argument('--target_datastore_name', type=str, help='target Datastore that contains target Dataset')
parser.add_argument('--target_dataset_name', type=str, help='target Dataset to be created/updated')

args = parser.parse_args()

print('Argument 1 (incoming data DataPath reference): %s' % args.incoming_data_datapath)
print('Argument 2 (incoming labels DataPath reference): %s' % args.incoming_labels_datapath)
print('Argument 3 (list of feature names to be joined with labels): %s' % args.feature_names)
print('Argument 4 (column name of the labels to be joined with features): %s' % args.label_column_name)
print('Argument 5 (column name of the request id to join feature names and labels): %s' % args.request_id_column_name)
print('Argument 6 (is incoming data from AzureML Data Collection?): %s' % args.is_aml_data_collection)
print('Argument 7 (path to output labeled data on specified Datastore): %s' % args.target_output_path)
print('Argument 8 (file name for labeled data output on specified Datastore): %s' % args.target_output_file_name)
print('Argument 9 (target Datastore that contains target Dataset): %s' % args.target_datastore_name)
print('Argument 10 (target Dataset to be created/updated): %s' % args.target_dataset_name)
```

!!! info "[DataPath](https://docs.microsoft.com/en-us/python/api/azureml-core/azureml.data.datapath.datapath?view=azure-ml-py) parameters return the path of the mounted storage object"
DataPath parameters provide a reference to a file or directory on an AzureML Datastore. That file or directory is then mounted to the container that runs during pipeline execution.The parsed argument returns a string that is the path to the mounted files.

### Check if Incoming Data is from AzureML Data Collection

We perform a brief check for common true values being passed in to handle the `$` parameter in the request ID column name for data coming from AzureML data collection. We also discussed this in the [AzureML data collection Pipeline parameter](#is-azureml-data-collection-parameter) portion of this post.

```python
### Check if request ID column is coming from AzureML data collection and prepend $ character ###
request_id_col = args.request_id_column_name

if args.is_aml_data_collection.lower() in ['true', '1', 'yes']:
    request_id_col = '$aml_request_id'
```

### Get Feature Names + Request ID Column

Because we passed in the feature and request ID column names, we can create a full list of columns that we want to keep from our incoming data.

```python
### Get feature names + request ID column name ###
feature_names = args.feature_names.split(',')
feature_names.append(request_id_col)
```

### Create Features Dataframe from Incoming Data DataPath

The features Dataframe will contain only the feature names and the request ID columns. It is created using the list we specified above.

```python
import pandas as pd

### Read raw Dataframe ###
incoming_data_path = args.incoming_data_datapath
df_raw = pd.read_csv(incoming_data_path)

### Create features Dataframe ###
df_features = df_raw[[feature for feature in feature_names]]
```

### Create Labels Dataframe from Labels DataPath

Similar to the features Dataframe, we want to load in our labels file and ensure it only includes the label and request ID columns.

```
import pandas as pd

### Load labels associated with incoming data ###
incoming_labels_path = args.incoming_labels_datapath
df_labels = pd.read_csv(incoming_labels_path)

### Clean labels data to only include label and request ID columns
df_labels_clean = df_labels[[args.label_column_name, request_id_col]]
```

### Join Labels and Features Dataframes on Request ID

Now that we have our features Dataframe and our labels Dataframe, we want to join them on the shared request ID column.

```
import pandas as pd

df_labeled = pd.concat(
    [df_features.set_index(request_id_col), df_labels_clean.set_index(request_id_col)],
    axis=1,
    join='inner').reset_index()
```

!!! info "Room for improvement!"
If your incoming data is large enough, it could be worth distributing this type of preprocessing using tools like Apache Spark. AzureML Pipelines also has a [DatabricksStep](https://docs.microsoft.com/en-us/python/api/azureml-pipeline-steps/azureml.pipeline.steps.databricks_step.databricksstep?view=azure-ml-py) that allows you to submit steps directly to Databricks where you can use optimized Spark runtimes.

### Write Out Labeled Dataframe Locally

Let's write the Dataframe to a local CSV so that we can upload it to an AzureML Datastore. Keep an eye on the `output_path` on the Datastore, the date formatting will come into play later.

```python
import os
from datetime import datetime

### Write labeled data to CSV file ###
date = datetime.today().strftime('%Y-%m-%d')
year, month, day = date.split('-')

output_dir = f'{args.target_output_path}/{year}/{month}/{day}/'
output_path = output_dir + args.target_output_file_name

local_output_dir = f'{cwd}/{output_path}'
local_output_path = f'{local_output_dir}/{args.target_output_file_name}'

if not os.path.exists(local_output_dir):
    os.makedirs(local_output_dir)

df_labeled.to_csv(local_output_path)
```

### Upload Labeled Dataframe to Target Datastore

Once the CSV has been written out locally, we can upload it to an AzureML Datastore for future processing. In the future, we may want to monitor these labeled datasets for [data drift](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-monitor-datasets), so we save the file to a date-formatted path on the Datastore.

```python
### Reference target Datastore object ###
dstore = Datastore.get(workspace, args.target_datastore_name)

### Upload labeled data to target Datastore ###
dstore.upload_files(files = [local_output_path],
                    target_path = output_dir,
                    overwrite = True,
                    show_progress = True)
```

### Create Target Dataset

Now that we have the labeled data uploaded to an AzureML Datastore, we can register the data as an AzureML Tabular Dataset. By registering a Dataset, we can version the data over time and tie it into the rest of the AzureML ecosystem. The reason we want to use Tabular Datasets (vs a standard File Dataset), is so that we can use it with [AzureML data drift detection](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-monitor-datasets) in the future.

Another requirement of AzureML data drift features is that the Dataset under inspection has a timestamp column. Since we do not enforce our incoming data and labels to include a timestamp column, we can add a [virtual column](https://docs.microsoft.com/en-us/azure/machine-learning/how-to-monitor-datasets#create-target-dataset) by specifying the folder structure that [follows a date pattern](#write-out-labeled-dataframe-locally). The `partition_format` specifies the path structure that will generate the `date` _virtual column_ for the Tabular Dataset.

```python
### Specify Datastore path to labeled data ###
dstore_path = (dstore, output_path)

### Specify partition format to create 'date' as a virtual column ###
partition_format = args.target_output_path + '/{date:yyyy/MM/dd}/' + args.target_output_file_name

### Create Tabular dataset with 'date' as a virtual column ###
dset = Dataset.Tabular.from_delimited_files(path=dstore_path, partition_format=partition_format)

### Assign the timestamp attribute to virtual date column in the Dataset ###
dset = dset.with_timestamp_columns('date')
```

### Register or Create New Version of Target Dataset

After we create the Tabular Dataset object, we can register it with AzureML. If the Dataset already exists, it will create a new version.

```python
### Register the Dataset as the target Dataset name and create new version if it already exists ###
dset = dset.register(workspace, args.target_dataset_name, create_new_version=True)
```

## Closing Remarks

Acquiring labels for new data can be a pain point for many industry, especially healthcare. This post focused on how to improve the machine learning lifecycle after labels have been acquired for incoming data. By registering and versioning new labeled datasets as AzureML Datasets, they can be consumed by downstream systems in an automated and traceable fashion.

If you have any thoughts or use cases around label acquistion in healthcare, or improving the machine learning lifecycle in any way, don't hesitate to reach out!

- Danny Sievers (daniel.sievers@optum.com)
- Max Marchionda (max.marchionda@optum.com)

!!! info "Full code examples can be found in our [GitHub repository](https://github.optum.com/AI-Platforms-Transformation/ml-engineering/tree/master/examples/azureml/pipelines/aml-labeled-datasets)"

## Continued Reading

1. [Software 2.0](https://medium.com/@karpathy/software-2-0-a64152b37c35)
2. [Introduction to Weakly Supervised Learning](https://watermark.silverchair.com/nwx106.pdf?token=AQECAHi208BE49Ooan9kkhW_Ercy7Dm3ZL_9Cf3qfKAc485ysgAAApkwggKVBgkqhkiG9w0BBwagggKGMIICggIBADCCAnsGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMfXQjAmnryDEtUqRTAgEQgIICTBPKwgXU6JM27S1wKRXyYvAvUL7LK5vyYbBsjX1Fp9Sq3bUGevIwAK7hjPJlB1QkwnUzJJAj5k0L3SPPfav5yZqY17F3iG0BDHv4C_2ki86LzEwJwYsBoXA2n2u_fTysmETh_cnVzuOaRlsiLE98hV6DuaGl-cEdv2uD7Ct1t3MSKjDGXyMiqR0gPkKyM8arZsDDvl1pXGneQiezfXiTe3pt-fOFelzyahaIs4hgvXx0mM196Qqw6ZjvFnvEglSM8W0vetUe9hfnOT8QxY5bWi94QWXFUSsQF_UuDXaBafyQXZdPjvG06VCwN6Xg1j7TlFUmxyoJs6fdiAnosIsRS3jrtCGCwxTTYUKWgLMlOhH-1cYnEF0WzeatXta1YProCu4t90pO2-CYDE7ivVg4zWZf0rfx7SHOa9xGEW0EXuEkNtA-Vi-787spjrgCqD75hHFVSw0aYwkDrGQo587nXJLz5OzxeYiqpie9z96b93JvqPfbtGWqcw1T_YTgHd5_Zb4g8tWfy3SDfxe-pdb9vOfGvY3l1g8ZwDnWAl7aa6DAOlbIWB8Rr1Zk7xLpGPoBi1d_krQAoBY73EWMMutlwzai_ETTK9RbskQbu9P0hQ9vVHt-x4sJLgPxisrqj_0DNz4UpMLiEch8xklhu2ETHmpR4AeequzWYkiJ42S-JHuKpv0dGSt2gOOE4L3xmfPDUzBV4JBh4EkJ7iXgHSy_aqLFziNTyAp-uIzaAsaMRtnY3KLEfSWo9OiidbzhXv3NhdI69sWwvYgLOzQIrg)
3. [Data Collection for Machine Learning: A Big Data - AI Integration Perspective](https://arxiv.org/pdf/1811.03402.pdf)
4. [Model Monitoring and Why it is Important](https://christophergs.com/machine%20learning/2020/03/14/how-to-monitor-machine-learning-models/)
5. [Training an XGBoost model with GPUs and AzureML Pipelines](https://ai-community.uhg.com/blog/xgb-pipeline)
6. [Canary Deployments with AzureML and Azure Kubernetes Service](https://ai-community.uhg.com/blog/canary-deployments)
7. [AzureML Documentation](https://docs.microsoft.com/en-us/azure/machine-learning/)
