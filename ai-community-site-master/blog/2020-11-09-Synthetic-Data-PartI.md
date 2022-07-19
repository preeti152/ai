---
slug: synthetic-health-care-data
title: "Synthetic Health Care Data: An Introduction"
author: Jayanthi Suryanarayana
author_title: Sr. Principal Engineer, TLCP
author_url: https://hubconnect.uhg.com/groups/tlcp/blog/2019/05/22/jayanthi-suryanarayana
author_image_url: /img/userphoto.png
tags: [synthetic data, deep learning]
---

In the recently published book "[State of Healthcare Technology](https://www.optum.com/business/resources/library/oreilly-report.html)" by Optum in partnership with O'Reilly, the  experts have recognized  Deep Learning is one of the technology with the power to transform the healthcare industry. As we move forward, I'll be deep diving into the deep learning approaches in healthcare to help understand the various use cases, the industry trends and the challenges, starting off with Synthetic data for healthcare.

<!--truncate-->

Synthetic data is an emerging technology topic powered by Generative Adversarial Networks (GANs). GANs  are an exciting recent innovation in machine learning -- they are generative models, which means they create new data instances that resemble your training data.

This is part I of a three part blog series that does a deep dive on the use of GANs for tabular Synthetic health care data.

* **Part I:**  Introduction to synthetic data and its uses cases
* **Part II:** Discussion of generation and certification techniques
* **Part III:** Introduces the tools of the trade for generation and certification methods of Synthetic tabular data.

## __What is Synthetic Data?__

**Synthetic data** is "any production data applicable to a given situation that are not obtained by direct measurement" according to the McGraw-Hill Dictionary of Scientific and Technical Terms (see the full [wikipedia definition](https://en.wikipedia.org/wiki/Synthetic_data)).


### __Context and Characteristics__

While synthetic data can be applied to all types of data images, audio etc., in the context of this discussion, it is scoped to tabular data the rationale being, in healthcare, vast majority of data is tabular. Synthetic data is defined as data generated based on the orginal data set with the following characteristics

__Structural and statistical Similarity__

Two tabular data sets are structually similar when generated data has the same number of columns as the origial data set.
Statistical similarity helps to guage the utility of the generated data. It can be measured across two dimensions, row-wise and column-wise. Traditional statistical analytic techniques such as calculation of probability distribution function and use of similarity metrics such as KL divergence and cosine similarity can be used to calculate similarity across table dimensions.

__Model Compatibility__

Two data sets are said to be model compatible when model metrics are comparable across both sets.

__Non Re-Identifiable__

The generated dataset when combined with other publicly available data set, cannot re-identify any member from the original dataset.

__Safely sharable__

The generated data set does not have any PHI/PII data from the orignal data set.

### __Common Use Cases__

While there are many use cases for synthetic data, described below are three most common use cases for synthetic datasets:

**Algorithm development and Analytics**

Healthcare data in general is sparse and in more cases limited and imbalanced. Many deep learning algorithms use "Data Augumention Technique" in order to mitigate this problem. Synthetic data is one of the promising tool to prepare the training  data sets used for algorithm development.

**Data sharing with third parties and public domain**

Synthetic data uses advanced machine learning generative techniques. This changes the data sharing regulatory landscape and offers an alternative approach for the privacy community that they view synthetic data as yet another valid tool in the ever-growing privacy tool belt. Different industries including financial are making inroads and investing in synthetic data capability.

Checkout this [JPMorgan Paper on Synthetic data opportunities](https://www.jpmorgan.com/jpmpdf/1320748216372.pdf).

**Test data for software development**

Synthetic data can be used as test data in lower environments when copies of production data are incomplete, unavailable, and  cannot be used due to  data privacy policies. It is more useful in the case of analytic use cases, but can be very tricky for integrated testing where upstream/downstream data preparation requirements are complex.

References:

* [Use Cases](https://towardsdatascience.com/the-many-use-cases-for-synthetic-data-60e0b0193afe)

In the **Part II** blog post, watch for a framework overview to generate and certify synthetic data.

<br/>

<hr/>

Have thoughts or questions? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/channel/19%3abe693c0dc0eb41719f07432a5fcf6cf6%40thread.tacv2/Blog?groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>


