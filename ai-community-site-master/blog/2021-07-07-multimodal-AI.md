---
slug: multimodal-ai
title: "Multimodal AI for Healthcare Data"
date: 07-07-2021
author: Irfan Bulu
author_title: Research Fellow, OptumLabs
author_url: https://hub.uhg.com/pages/userprofile.aspx?pid=IBULU
author_image_url: /img/userphoto.png
tags: [multimodal]
---


# Multimodal AI package

Healthcare data is special. Its complex nature is a double-edged sword, possessing great potential but also presenting many technical difficulties to overcome. For example, claims data—in contrast to the common data types (text, vision, audio) where AI has made eye-popping advances—is multi-modal (i.e., consisting of distinct data types including medical claims, pharmacy claims, and lab results), asynchronous (medication histories and diagnosis histories need not be aligned in time), and irregularly sampled (we only collect data when an individual interacts with the system). We will discuss these technical difficulties and our solution to address them in detail.

<!--truncate-->

## Healthcare data is complex

__The data is multimodal.__ For example, we have medical claims data, pharmacy claims data, lab data, imaging data. And the list goes on. To make the best use of data, we should develop methods suitable for multimodal data. All these different modalities are related to each other. A procedure performed during a visit is most certainly related to a diagnosis code in a patient's history. Similarly, a prescription filled at a pharmacy would be associated with a diagnosis code in a patient's record. In some instances, these relationships between modalities might be available in the data. But, in most cases, such information is not captured in a patient's record. The common approach in handling this issue is simply to sum the representations corresponding to different modalities as was done in [Med-BERT: pre-trained contextualized embeddings on large-scale structured electronic health records for disease prediction](https://arxiv.org/abs/2005.12833). However, mathematically, the issue with this approach is summation of token embeddings from two different representation spaces such as diagnosis codes and medications is problematic as the relationship between the two embedding spaces is not known.  Is there an approach that can learn the relationships among different modalities from the data and use them? 

__The data is asynchronous.__ Another challenging aspect of modeling healthcare data is in that the modalities are not syncronized in time. For example, a patient can (re)fill a prescription at any time after diagnosis. One common solution employed in handling this issue is binning data elements such as medical claims and pharmacy claims within a time window. This approach was used in multiple publications including [BEHRT: Transformer for Electronic Health Records](https://www.nature.com/articles/s41598-020-62922-y). However, this approach might easily result in spurious correlations between medications and diagnosis codes. 


## A deep learning approach to address the challenges of healthcare data

The Transformer architecture from [Attention Is All You Need](https://arxiv.org/abs/1706.03762) provides a potential solution to the challenges mentioned above. The key component of the Transformer architecture is the self-attention layer. Self-attention mixes the representations of a target token (query) in a sequence with the representations of the context surrounding that token (keys and values). The query vectors are multiplied with the key vectors after which softmax function is applied to calculate the attention scores. The attention scores determine how much of the context representations should be added to the query representation. In the standard Transformer encoder queries, keys and values come from the same sequence and the modality. In Multimodal Claims AI package, we use the attention mechanism to address multimodal and asynchronous data. The query vectors from one modality attend to key vectors from another modality in the calculation of attention scores. Note that before the vector multiplication, query and key vectors are linearly transformed. This transformation, when applied to multimodal data elements, can be considered as projection of representations from different modalities to the same vector space. The attention scores, in this case, inform how representations from different modalities should be combined. We call this approach as cross-attention.

The cross-attention mechanism also eliminates the need to bin data elements and naturally handles asynchronous data. The time information can be added to the representations using positional encoding. However, unlike what's done in the original Transformer implementation, instead of using the sequence order, we use the actual time information in the calculation of positional embeddings.

## Putting it all together: Multimodal AI package

In modeling healthcare data such as claims, we have adopted a hierarchical approach based on the notion of a "visit", whose definition is up to the user. For example, one can use each encounter as the definition of a visit. Each visit may consist of multiple data elements such as ICD codes. We use transform-aggregate paradigm to generate a vector representation for each visit in patient's medical history. The transform operation can be as simple as an identity operation or multiple transformer layers, both of which are available as options in Multimodal AI package. We have also multiple aggregation operations implemented from simple averaging to [structured self-attention](https://arxiv.org/abs/1703.03130). In the structured self-attention approach, the model tries to learn how to aggregate data elements within a visit from the data. The initial embeddings for the data elements, e.g. ICD codes, can be initialized randomly or be computed from their natural language, i.e., text descriptions. The package contains the necessary scripts to generate embeddings for data elements from their text descriptions for diagnosis codes, procedure codes and generic drug names.

The application of the transform-aggregate paradigm to a sequence of visits results in a sequence of vectors for each modality. These sequences of vectors can be loosely considered as the "meaning" of each visit in the context of the task, e.g. prediction, that we are trying to solve. We apply another set of transform-aggregate operations to the sequences of visit representations to generate a single vector representation for each patient. We start by adding a time embedding to each visit representation. Then, we use transformer layers with cross-attention to transform the visit vectors with contextual information. The contextual information may come within the same modality or from other available modalities. Finally, we aggregate the transformed visit vectors. These aggregated vectors are combined with static feature embeddings, e.g., gender, to form a single vector representation for each patient, which can be used in a downstream task.  

The package comes ready for predictive tasks. In addition to the architectural innovations, we have added several novel loss functions designed for noisy and imbalanced datasets. These loss functions include [bi-tempered logistic loss](https://paperswithcode.com/paper/robust-bi-tempered-logistic-loss-based-on#code), [class-balanced focal loss](https://openaccess.thecvf.com/content_CVPR_2019/papers/Cui_Class-Balanced_Loss_Based_on_Effective_Number_of_Samples_CVPR_2019_paper.pdf) and [complement cross-entropy loss](https://arxiv.org/abs/2009.02189). Furthermore, we have implemented efficient data loaders and iterators suitable for claims data using [torchtext](https://pytorch.org/text/stable/index.html).

## What is next?

One of the most exciting developments in deep learning has been the unsupervised training paradigm such as [BERT](https://arxiv.org/abs/1810.04805). This has led to the most important breakthroughs in natural language processing, vision and audio problems. We believe the architecture we developed may allow us to realize similar gains when trained on large datasets using unsupervised learning. The healthcare data is complex with a large set of features. For example, there are over 70,000 ICD10-PCS procedure codes and 69,000 ICD10-CM diagnosis codes. The [rule of ten](https://en.wikipedia.org/wiki/One_in_ten_rule) suggests that to build good predictive models such pre-training is necessary. As our next big step, we are planning to train large BERT-like models using the multimodal architecture we have developed. Furthermore, we believe the base architecture (hierarchical multimodal transformer) that we have developed will allow us to incorporate additional modalities such as clinical notes and imaging data. 

## Get involved!

We believe that we are at the beginning of an exciting journey that will lead to the development of deep learning algorithms that can take full advantage of healthcare data for addressing the needs of patients and providers. And we need your help. 

- The algorithm and the necessary training scripts are available at [github.optum.com](https://github.optum.com/ibulu/Multimodal-Health-AI). Give it a spin!
- Let us know of any issues, suggestions and feature requests.
- We have implemented a modular, bring your own architecture (BYOA) approach. If you have a favorite deep learning architecture for healthcare data, let's BYOA!

<br/>

<hr/>

Have you tried out this algorithm?  What did you think?  

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1625669104240?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1625669104240&teamName=AI%20Community&channelName=Blog&createdTime=1625669104240" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this post and topic on Teams!
      </a>
  </li>
</ul>