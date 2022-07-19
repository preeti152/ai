---
slug: synthetic-health-care-data-partII
title: "Synthetic Health Care Data: Generation Frameworks"
author: Jayanthi Suryanarayana
author_title: Sr. Principal Engineer, TLCP
author_url: https://hubconnect.uhg.com/groups/tlcp/blog/2019/05/22/jayanthi-suryanarayana
author_image_url: https://hub.uhg.com/_layouts/15/EPI/Img/avatar.aspx?useCaching=false&h=144&w=144&auri=people/129883/avatar?a=268146
tags: [synthetic data, deep learning]
---

Following up my [initial blog post on Synthetic Healthcare Data](https://ai.uhg.com/blog/synthetic-health-care-data), in part II of this blog series I will describe frameworks to be leveraged for the generation of tabular data based on deep learning and for synthetic data certification based on similarity measures.

<!--truncate-->

## __Generation Framework__ ##

For synthetic data in the deep learning context, GAN (Generative Adversarial Network) based models are the primary mechanism for generation. As the name suggests, GANs are generative models that means they create new data which does not have traces of the original data set they are based off.

### What is GAN? ###

In short, GANs are a type of deep learning network comprising of two individual neural networks. One is called a generator and another discriminator.  The discriminator has two inputs , one the original data and the other the output of  the generator. The generator takes random noise as the input and learns how to generate data similar to original data guided by the discriminator. 

While this technique has been widely used in synthetic data for images, the potential of this technique in the generation of any type of data is great. In the case of tabular data, it is also very promising to address data privacy risks. A number of libraries are being developed in the area of tabular data generation.

Get an understanding of GAN and play with them here [GAN PlayGround](https://poloclub.github.io/ganlab/).  Ian Goodfellow is considered father of GAN and read his original paper at https://arxiv.org/abs/1406.2661. For a tutorial on this, go here. [Generative Adversarial Network](https://developers.google.com/machine-learning/gan)

## __Certification Framework__ ##

Certification framework in this context is about measuring similarity or dissimilarity between two tables, one the original and the second one generated. Distance measures in data mining literature gives various approaches and mathematical background that quantifies similarity. The idea of this framework is to define metrics that quantify column-wise and row-wise comparison between two tables to assess the utility of the generated data.

### __Column-wise Distribution Metric__ ###

Here are most commonly used measures:

**Kullback-Leibler Divergence** 

KL Divergence is used to quantify dissimilarity between two distributions (how different vs. how similar they are).

**Cosine-Similairty** 

This is a similarity measure between two vectors as the inner product. This concept is used in number of applications specially in graph context. 


### __Row-wise Reduction Metric__ ###

The healthcare tabular data must deal with the curse of high dimensionality. When developing row-wise metric for similarity, dimensionality poses challenge for healthcare tabular data.  If this challenge is addressed, the above column-wise measures can be applied to develop the row-wise metric. Dimensionality reduction addresses this challenge which is a transformation that is applied to high dimensional data sets so they can be represented in low dimension. This not only makes it easier for analysis but intrinsically maintains the meaningful properties of the original data. Two commonly used techniques are described here:

**Principal Component Analysis**
PCA is most commonly used technique for dimensionality reduction. Principal components are new variables that are constructed as linear combinations of the initial variables. While mathematical treatment of PCA is beyond the scope of this blog, it uses linear algebra under the covers and there are libraries available in popular languages which implement it.

**Auto Encoders**
Auto encoders is a neural network that is used to learn data coding in unsupervised manner. It is a compression algorithm that learns a representation usually for reducing the dimension. Remember neural network can approximate any function reasonably well, auto encoders approximate a mapping function that maps higher dimension data to lower dimension.

In this blog, we introduced concepts for synthetic data generation using GAN and concepts that help us develop a framework for certifying the generated data against the original using commonly used statistical techniques.

In the next blog last in the series, the toolset and code examples will be discussed.


<br/>

<hr/>

Have thoughts or questions? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1606836593760?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1606836593760&teamName=AI%20Community&channelName=Blog&createdTime=1606836593760" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>
