---
slug: black-box-glass-box
title: Black Box vs. Glass Box
author: Jana Gunn
author_title: Director, Preferred Analytics
author_url: https://hub.uhg.com/pages/userprofile.aspx?pid=JGUNN101
author_image_url: /img/userphoto.png
tags: [ethical ai]
---

Should we ban the use of black box models?

I recently attended a virtual conference on explainable AI (XAI) and listened to a presentation given by Cynthia Rudin.  She is a professor at Duke University doing research on explainable AI and argued that we should be using “glass box” or interpretable models whenever possible.  

Before I dive any deeper into the discussion, I’d like to first level set on a couple of definitions.  First, what is the difference between a black box and glass box model?  Black box models, such as neural networks or gradient boosted trees, do not provide estimates of the importance of each feature on the model predictions, thus making it difficult to understand the inner workings of the model (Hulstaert, 2019).  Glass box models, such as decision trees or linear regression, offer mathematical explanations for the importance of each feature (Hulstaert, 2019).  

<!--truncate-->

Another important distinction to make is the difference between explainability and interpretability.  Interpretability can be thought of as understanding cause and effect (i.e. if I increase the coefficient of a feature, the prediction will also increase) (Gall, 2018).  Explainability is being able to explain what the model is doing in human terms (Gall, 2018).  Black box models can be explained using techniques like Shapely values.  These can be used to understand the importance of features in a black box model, however, the data scientist must still create his or her own mental model of what the values represent (Kumar et al., 2020). Glass box models provide their own explanations because they are inherently interpretable (Rudin, 2019).  

With those definitions in mind, let’s circle back to the topic at hand.  Should we be using black box models, specifically in high-stakes decision-making? Professor Rudin provides 5 key reasons why black box models should be avoided in her paper located [**here**](https://arxiv.org/pdf/1811.10154.pdf).  Below is a summary of some of her findings:

1. There is no tradeoff between accuracy and interpretability. Professor Rudin states that in situations where there is structured data with well-defined features, there is no significant difference in performance between complex black box models and interpretable models.
2. Explanations must be wrong in parts of the feature space.  If explanations were able to explain all aspects of the model, then they would be considered interpretable.  Because some aspects of the explanation must be wrong, it can lead to mistrust in the model.  In addition, explanations do not always attempt to mimic the actual calculation in the model.  Therefore, using language like explanation can be misleading since often the methodology used to understand the model is simply showing trends in how predictions are related to features.
3. Explanations often do not make sense or do not provide enough detail on what the model is doing.  Professor Rudin gives an example of a saliency graph used to help explain image processing.  She argues that they only show where the model is looking but provides no information as to why the model is classifying an object a certain way.
4. Black box models are difficult to combine with outside information that may be needed to assess risk.  For example, when trying to determine recidivism risk, a judge must also consider the seriousness of the current crime which is not a feature in the model.  If the model was transparent, the judge would know that this is not being considered whereas they might not realize this fact with a black box model.
5. Black box models can be overly complicated and prone to human error.  There may be errors in overly complicated black box models that we are not aware of because they are difficult to troubleshoot.   

In addition to Professor Rudin’s reasons for not using black box models, there are also important ethical considerations.  UHG has six [**Responsible Use Guiding Principles**](https://ai.uhg.com/docs/reference/responsible-use):  mission-driven, trust, fairness, accountability, transparency, and privacy.  Understanding how and why our models are making decisions aligns with these principles.  It helps build trust that our models are reliable and increases transparency into the decisions that are being made by the technology.  Having truthful and transparent models increase our accountability and help ensure models are producing fair results.

I would love to hear your thoughts on this topic.  Do you agree with Professor Rudin’s point of view?  How often are you using black box versus glass box models?  Should there be a requirement to try to use interpretable models whenever possible?  

You can find additional resources on this topic and many more in [**Optum IQ Studio**](https://iqstudio.optum.ai/display/OIQSE/OptumIQ+Studio).  

For tools and resources on how to build models responsibly, check out the [**Responsible Use Toolkit**](https://iqstudio.optum.ai/display/OIQSE/Toolkits+for+Responsible+use+of+Advanced+Analytics).  


<br/>

<hr/>

Do you agree with Professor Rudin’s point of view?  How often are you using black box versus glass box models?  Should there be a requirement to try to use interpretable models whenever possible?  Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1617126145822?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1617126145822&teamName=AI%20Community&channelName=Blog&createdTime=1617126145822" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>

<hr/>

## References

Gall, R. (2018, Dec). Machine Learning Explainability vs Interpretability:  Two concepts that could help restore trust in AI. KDnuggets. [Machine Learning Explainability vs Interpretability: Two concepts that could help restore trust in AI - KDnuggets](https://www.kdnuggets.com/2018/12/machine-learning-explainability-interpretability-ai.html)

Hulstaert, L. (2019, March 14).  Black-box vs. white-box models. towards data science. https://towardsdatascience.com/machine-learning-interpretability-techniques-662c723454f3

Kumar, E. & Venkatasubramanian, S. & Scheidegger, C. & Friedler, S. A. (2020, June 30).  Problems with Shapely-value-based explanations as feature importance measures. https://arxiv.org/pdf/2002.11097.pdf

Rudin, C. (2019, September 22). Stop Explaining Black Box Machine Learning Models for High Stakes Decisions and Use Interpretable Models Instead. [1811.10154.pdf (arxiv.org)](https://arxiv.org/pdf/1811.10154.pdf)
