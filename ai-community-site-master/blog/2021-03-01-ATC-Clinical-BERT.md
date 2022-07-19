---
slug: atc-clinical-bert
title: "UHG Clinical Pretrained Language Models"
author: Ravi Kondadadi
author_title: Distinguished Engineer, Advanced Technology Collaborative
author_image_url: /img/userphoto.png
tags: [transformers, BERT, clinical, deep learning, nlp]
---

Deep learning has enabled significant improvements in NLP (Natural Language Processing) throughout the last year. Transformer[^1]  based pretrained models are one of the main reasons behind this revolution in the field of NLP. These new language models can be trained on vast amounts of unlabeled data. The models have shown to learn various syntactic and semantic dependencies between words and phrases that were previously hard to capture. BERT[^2]  (Bidirectional Encoder Representations for Transformers) based models have outperformed humans on GLUE[^3]  benchmark NLP tasks and have achieved state-of-the-art results on summarization, machine translation, and question answering. 

<!--truncate-->

However, most of the pretrained models are trained on publicly available data and cover almost no data with clinical language, so they do not work quite as well on clinical language understanding (CLU). There are models like Clinical BERT[^4]  and BioBERT[^5]  which were trained on MIMIC data and PubMed data. They perform better on CLU tasks than general BERT models, but the amount of clinical data (MIMIC only has around 2M de-identified clinical notes) is still small compared to the data used to train the original BERT. Also, these models rely on the vocabulary created in the original BERT where most of the entries are not related to clinical domain. For example, the token atrial in original BERT is represented as two subtokens “at” and “rial”. This will cause the model to form erroneous relations between tokens that are not necessarily related. 

As the largest healthcare organization in United States, UHG owns a lot of healthcare data. Our enterprise processes millions of clinical notes that belong to our customers every day, and a lot of information is buried in the unstructured parts of the notes. Hence, we have a huge need for clinical language understanding tools. If we can use this data and build pretrained language models, they can be finetuned on a variety of downstream NLP tasks including Computer Assisted Coding (CAC), Clinical documentation improvement (CACDI), and clinical named entity extraction (extraction of conditions, procedures and medications). 

Advanced Technology Collaborative (ATC) has been working closely with Clinical Language Intelligence (CLI) on building clinical pretrained language models. We have received hundreds of millions of HL7 messages directly from the clinics and hospitals the CLI group is serving. We extracted unstructured clinical notes from these messages and built pretrained language models from scratch. We trained a custom tokenizer model to work with clinical data to address the problem of clinical words getting tokenized into multiple out-of-domain sub tokens.

Today, we announce the first release of these pretrained models on OptumIQ Studio. The model download links can be found in the table below. Instructions on using the models can be found at **https://github.optum.com/ATC/clinicaltransformers**.

| Model | Baseline | Download Link |
|-------|----------|-------------- |
| ATC Biobert | Bio BERT | [Download ATC Biobert](https://s3api-core.uhc.com/bert-models/clinical/atc_biobert/model.tgz) |
| ATC Biomegatron | BioMegatron | [Download ATC Biomegatron](https://s3api-core.uhc.com/bert-models/clinical/atc_biomegatron/model.tgz) |
| ATC ClinicalBert | Clinical BERT | [Download ATC ClinicalBert](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_bert/model.tgz) |
| ATC ClinicalBert V2 | None (from scratch) | [Download ATC ClinicalBert V2](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_bert_v2/model.tgz) |
| ATC PubmedBert-small | PubMed BERT | [Download ATC PubmedBert-small](https://s3api-core.uhc.com/bert-models/clinical/atc_pubmed_bert_small/model.tgz) |
| ATC PubmedBert-large | PubMed BERT | [Download ATC PubmedBert-large](https://s3api-core.uhc.com/bert-models/clinical/atc_pubmed_bert_large/model.tgz) |
| ATC Clinical DistilBert | None (from scratch) | [Download ATC Clinical DistilBert](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_distilbert/model.tgz) |
| ATC Clinical Longformer | bert-base | [Download ATC Clinical Longformer](https://s3api-core.uhc.com/bert-models/clinical/atc_clinical_longformer/model.tgz) |
| ATC UMLSBert | UMLS BERT | [Download ATC UMLS Bert](https://s3api-core.uhc.com/bert-models/clinical/atc_umls_bert.zip) |

All of these models are based on BERT model architecture. So, the maximum sequence length the models can handle is 512. Our next release will have a broader set of models including models like Reformer[^8]  and Longformer[^9]  that can handle longer sequences of text. We also plan on reducing the complexity of these models by creating distilled versions to make them run faster on CPUs. 

We hope the NLP community in our enterprise finds these models useful for their clinical NLP usecases. 

[^1]: http://jalammar.github.io/illustrated-transformer/
[^2]: https://ai.googleblog.com/2018/11/open-sourcing-bert-state-of-art-pre.html
[^3]: https://gluebenchmark.com/
[^4]: https://arxiv.org/pdf/1904.03323.pdf
[^5]: https://github.com/dmis-lab/biobert
[^6]: https://ngc.nvidia.com/catalog/models/nvidia:biomegatron345muncased
[^7]: https://www.microsoft.com/en-us/research/blog/domain-specific-language-model-pretraining-for-biomedical-natural-language-processing/
[^8]: https://ai.googleblog.com/2020/01/reformer-efficient-transformer.html
[^9]: https://github.com/allenai/longformer


<br/>

<hr/>

Have thoughts or questions? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1611860766292?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1611860766292&teamName=AI%20Community&channelName=Blog&createdTime=1611860766292" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>
