---
id: reuse
title: Reuse What Exists
---

As you get started, check these sources to see if you can find existing models, analytics or data that are available for consumption or reuse. 

And, if you are unable to find something, you can always ask the AI Community if something exists before getting started!

<br/> 

<ul class="contact-list">
	<li>
        <a href="https://teams.microsoft.com/l/channel/19%3ae8c379b417bc4153b3f5e109657105ed%40thread.tacv2/Help!?groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421" target="_blank">
            <span class='icon-wrap'>
                <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
            </span>
            Ask the Community
        </a>
    </li>
</ul>


## __Models & Analytics__

Check these sources to see if you can find a model or analytic that exists.

### Clinical Transformers

In UHG, as in other health care organizations, there is a huge need for clinical language understanding tools. Our enterprise processes millions of clinical notes every day where a lot of information is buried in the unstructured parts of the notes. Extracting information from this unstructured data will help in use cases like claim prediction, computer assisted coding and clinical documentation improvement. Pretrained language models have caused significant improvements in language understanding tasks in the last couple of years. BERT , a bidirectional masked language model, developed by Google has resulted in a series of other language models that have outperformed humans in most of the language understanding tasks on GLUE (General Language Understanding Evaluation) benchmark like machine translation, summarization.

A ready to use library designed to allow you to quickly and easily load custom pre-trained transformer language models. The current release has six clinical pretrained language models. 


| Model | Baseline | Download Link |
|-------|----------|-------------- |
| ATC Biobert | Bio BERT | [Download Biobert](https://s3api-core.uhc.com/bert-models/clinical/atc_biobert/model.tgz) |
| ATC Biomegatron | BioMegatron | [Download Biomegatron](https://s3api-core.uhc.com/bert-models/clinical/atc_biomegatron/model.tgz) |
| ATC ClinicalBert | Clinical BERT | [Download ClinicalBert](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_bert/model.tgz) |
| ATC ClinicalBert V2 | None (from scratch) | [Download ClinicalBert V2](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_bert_v2/model.tgz) |
| ATC PubmedBert-small | PubMed BERT | [Download PubmedBert-small](https://s3api-core.uhc.com/bert-models/clinical/atc_pubmed_bert_small/model.tgz) |
| ATC PubmedBert-large | PubMed BERT | [Download PubmedBert-large](https://s3api-core.uhc.com/bert-models/clinical/atc_pubmed_bert_large/model.tgz) |
| ATC Clinical DistilBert | None (from scratch) | [Download Clinical DistilBert](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_distilbert/model.tgz) |
| ATC Clinical Longformer | bert-base | [Download Clinical Longformer](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_longformer/model.tgz) |
| ATC UMLSBert | UMLS BERT | [Download ATC UMLS Bert](https://s3api-core.uhc.com/bert-models/clinical/atc_umls_bert.zip) |


Read more [**on GitHub**](https://github.optum.com/ATC/clinicaltransformers).

:::note Add a Model

If you have a model you would like to share for others to reuse, [**submit a GitHub issue**](https://github.optum.com/ai-community/ai-community-site/issues/new?assignees=jwilli&labels=model-reuse&template=publish-a-model-for-reuse.md&title=) to get it added to the site. 

:::

### OptumIQ Studio Analytics Library

The OptumIQ Studio Analytics Library is an inventory of analytics, including models, sample code, macros, data enrichments and product summaries. Visit the Library to search across these resources to see if something exists that you can reuse.

Check out the [**OptumIQ Studio Library**](https://uhgazure.sharepoint.com/sites/optumiqstudio).


## __Data__

Check these sources to see if you can consume data from an existing pipeline.

### Health Care Platform

The enterprise strategy for data access is to align with the [**Health Care Platform**](https://hcp.optum.com), so before connecting directly to one of the enterprise data sources, see if the platform is already publishing data streams and [consume from the streams](https://github.optum.com/kafka/kaas-alpha) instead.

### Healthcare Graph

The Healthcare Graph is an enterprise data asset that creates and hosts connected healthcare data at scale. The connected nature of data across domains combined with native graph storage & graph-based processing enables it to provide very niche and differentiating capabilities to our enterprise (like real-time analytics, holistic views/journeys, experience APIs, complex relationships management, etc.). As a key component and primary consumer of the Health Care Platform (HCP), Healthcare Graph is positioned to drive the modernization of data, digital and analytics aspects of UHG’s products and solutions.

While a graph database is at the core of the Healthcare Graph, managing the storage and processing of data, the asset ecosystem has multiple other technology stacks that are working together to bring the overall capability to bear.

Learn more and view the complete onboarding and consumer guide at [**healthcaregraph.optum.com**](https://healthcaregraph.optum.com/).

