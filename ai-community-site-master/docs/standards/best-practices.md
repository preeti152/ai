---
id: best-practices
title: AI Software Best Practices
---

:::note Active Development

These standards and best practices are under active development. If you wish to contribute, please review our [Contributors guide](https://github.optum.com/ai-community/ai-community-site/blob/master/CONTRIBUTING.md) on GitHub.

:::

## AI Software Checklist
The AI Software Checklist is not a list a requirements, but a collection of best practices and considerations when build, deploying and maintaining AI software. This checklist is community driven, generated and owned. [Contributions](https://github.optum.com/ai-community/ai-community-site/blob/master/CONTRIBUTING.md) are not only welcome, they are encouraged. Thank for participating in the UHG AI community!


|       |    Applicable    | 
| ----------- | :----------- |
| [Data Provenance](#link-training-datasets-with-models): Can you programmatically track between source data and model artifacts?    ||||      |
| [Data Quality](#define-and-measure-data-evaluation-metrics-over-time): Do you have defined and measurable data evaluation metrics?   ||||          |
| [Data Quality](#accurate-data-labels-and-annotations): Did you use accurate labels/annotations? ||||          |
| [Data Availability](#train-on-data-you-can-use-in-production): Is the data available to the training and production systems? ||||          |
| [Reproducibility](#be-able-to-reproduce-model-results): Can you reproduce the results? ||||          |
| [Reproducibility](#reusable-pipelines-for-model-training-evaluation-and-serving): Did you package your code for reuse? ||||          |
| [Model Evaluation](#define-model-evaluation-metrics): Did you define model evaluation metrics? ||||          |
| [Model Evaluation](#define-and-measure-metrics-for-business-and-medical-cases): Did you define measurable business and/or clinical metrics? ||||          |
| [Model Serving](#inference-slas): Did you model deployment meet the standard SLAs? ||||          |
| [Model Serving](#define-and-check-schema): Do you check data schema? ||||          |
| [Model Serving](#collect-ground-truth-labels-from-production-systems): Do collect ground truth labels in production? ||||          |
| [Model Serving](#data-drift): Did you define data monitoring metrics for production? ||||          |
| [Model Serving](#data-collection): Do you have appropriate service logging? ||||    |
| [Model Serving](#security): Are you meeting enterprise security requirements? ||||    |


## Further Reading

### Data Provenance

##### Link training datasets with models

Acquiring the proper metadata throughout the AI life cycle allows the pipeline and model leads to improved reproducibility, data validation, and retraining. This can be accomplished with comprehensive meta data acquisition from data, training, evaluation, and deployment.

### Data Quality

##### Define and measure data evaluation metrics over time

As data changes over time the AI systems must be able identify changes to maintain system quality. Evolving data left unaddressed will degrade AI software. Having well defined data and model monitoring metrics before deployment allows for improved analysis of data drifts. For example Wasserstain Distance applied to numerical sensor data.
[6](/standards/references/#6-eff-ai-metrics)

##### Use accurate data labels and annotations

In many situations (ie. supervised learning), it is critical to ensure the quality of data labels and annotations. Working with domain experts can lead to better labels meaning better models. 

### Data Availability

##### Train on data you can use in production

Ensuring training data will also be available for production will allow data science teams to design a feature set that can be operationalized. 

### Reproducibility

##### Be able to reproduce model results

Combine strong development principals, metadata capture and documentation to produce reproducible research.

##### Create reuseable pipelines for model training, evaluation and serving

AI pipelines are often created ad hoc, with glue code and custom scripts. This creates a high volume of technical debt that will create challenges to operationalize AI and manage AI over time.

### Model Evaluation

##### Define model evaluation metrics

Core metric(s) to measure, compare, and determine model performance. These can largely vary depending on the use case. Decent overview of common classification and regression metrics can be found [here](https://towardsdatascience.com/20-popular-machine-learning-metrics-part-1-classification-regression-evaluation-metrics-1ca3e282a2ce), note, this is not a comprehensive list. These evaluation metrics allow for comparison across researchers and ml solutions. [6](/standards/references/#6-eff-ai-metrics)

##### Define and measure metrics for business and medical cases

Without clear purpose and measurability, AI software can be left without the empirical evidence to continue development.

### Model Serving

##### Inference SLAs

Like traditional software, AI software needs to meet system requirements to integrate with a given product. Outside of typical SLAs, ML engineers should focus on serving latency of the model asset(s). Managing the model complexity and it's on impact inference time and memory management can sometime be a tradeoff between model performance and meeting SLAs7. Critical decisions around serving infrastructure, especially for mobile applications, should also be optimized.
[7](/standards/references/)

##### Define and Check Schema

Defining schema allows for AI applications to perform schema validation. This helps to ensure the model is scoring appropriate data and can mitigate misleading scores. 
[9](/standards/references/)

##### Collect ground truth labels from production systems

Collecting accurate true labels/annotations from production systems can be a big challenge. Accomplishing this allows for AI software to maintain its quality even if data and context change. 


##### Data Drift

Having well defined data and model monitoring metrics for model deployment allows for improved analysis of data drifts. For example, Wasserstain Distance applied to sensor data. Two common reasons for data drifts are sample selection bias and non-stationary environments, it is critical for AI systems to be able to identify possible quality impacts and mitigate.
[10](/standards/references/), [11](/standards/references/)

##### Data Collection

- Collect data from incoming request (when possible)
- Collect model output (inference result)
- Collect true labels (when possible)
- Collect trace, telemetry, and system level metrics

##### Security

Security for web service deployment, follow API security requirements as deemed by https://api-docs.optum.com.