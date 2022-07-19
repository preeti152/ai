---
id: kpis
title: KPIs for AI Software
---

:::note Active Development

These standards and best practices are under active development. If you wish to contribute, please review our [Contributors guide](https://github.optum.com/ai-community/ai-community-site/blob/master/CONTRIBUTING.md) on GitHub.

:::

## Defined and measurable metrics for business and medical case

Largely depends on use case, but these are the business efficiencies, medical impact metrics that should be well defined and measurable for AI software to succeed. These metrics will drive model evaluation, monitoring, safety. Without these well defined AI software will be a challenge to build and operationalize.

## Defined model evaluation metrics

Core metric(s) to measure model performance largely depend on the use case. Decent overview of common classification and regression metrics can be found [here](https://towardsdatascience.com/20-popular-machine-learning-metrics-part-1-classification-regression-evaluation-metrics-1ca3e282a2ce), note, this is not a comprehensive list.

## Data monitoring metrics by data type

These are a collection of metrics intended to ensure the data should be scored by the AI software. Metrics derived from model performance, data distribution, data drift algorithms create this collection. These can vary widely by data type (tabular, time-series, etc.)

## Define retraining metrics and cadence

Closely related to data monitoring metrics, this metric is around establishing the agreed upon metrics and triggers for retraining the AI Software. Teams and use cases loaded with technical debt will struggle to scale here.

## Define bias and fairness metrics

Clearly define and articulate AI software performance by cohort, demographic, or relevant statistic.
