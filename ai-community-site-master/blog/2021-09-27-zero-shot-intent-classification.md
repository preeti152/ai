---
slug: zero-shot-intent-classification
title: "Zero-Shot Intent Classification"
date: 09-27-2021
author: Sandeep Singh
author_title: Lead Data Scientist
author_url: https://uhgazure.sharepoint.com/sites/Sparq-Online/SitePages/ExtProfile.aspx?mid=sandeep.singh13@optum.com
author_image_url: /img/userphoto.png
tags: [NLP]
---

Intent classification (IC) is one of the fundamental tasks in building Natural Language Understanding (NLU) systems especially for goal oriented conversational AI dialogue systems. It is the task of classifying user utterance with a predefined label.  Classifiers train on labeled data and learns to classify the utterance belongs to which class. If an utterance that doesn’t belong to one of the positive intent classes and belongs to completely out-of-domain then the model can output a random prediction. Acquiring and annotating high quality and quantity data to train deep learning models is not scalable, as there would always be a new class or goals or out-of-domain utterances where there won’t be much of labeled data and getting manual annotation would be very costly. 

## Zero-shot learning

NLP has progressed tremendously in recent years to figure out effective methods of learning from huge amounts of unlabeled data. Transfer learning from unsupervised models has helped in achieving state-of-the-art benchmarks on downstream supervised tasks. The paper “Language Model are Few-Shot Learner” shows large language models can perform well on downstream tasks with less task specific data. Learn a classifier on one set of labels and then evaluate on a different set of labels that classifier has not seen before.  In zero-shot classification, describe an unseen class to the classifier either with the visual or with the class name. 

## Utterance and Intent Embedding

Embedding intent and utterances into the same space. By doing this zero-shot algorithm can learn the semantic relation between the intent name and utterance through the semantic group. Previously this method has been used to represent text and intent names in fixed dimensions.  By utilizing Transformers based dense representations we can achieve much more quality sentence and word representations.

 By using Sentence-BERT to encode the utterances to generate utterance vectors. Intent names are not sentences and are usually one- or two-word short expressions in these cases BERT may not work well as it is trained for full sentences. In this case, better to create embeddings for utterances by Sentence-BERT and embeddings for the intent names by word vectors such as(Glove, word2vec etc.) which would create intent vectors. In order to embed those into the same space, need to calculate a projection matrix ϕ that project utterance vectors onto intent vectors. With annotated data, can learn the projection matrix via regression.  By doing this we would have created better alignment between utterance and intent vectors.

## Siamese Networks

Explore and analyse the semantic similarity between utterances and intent names which and can be learnable. By using Siamese networks kind of architecture to learn the similarity between intent name and utterances. Classical intent classifiers takes utterance as input and predict a class label.  Zero-shot intent classifier instead learns whether a label and an utterance is semantically similar. Siamese network takes utterance and intent as input and outputs if these inputs are semantically related or not. 

## References

1. [Language Model are Few-Shot Learner](https://arxiv.org/abs/2005.14165)
2. [Are Pretrained Transformers Robust in Intent Classification? A Missing Ingredient in Evaluation of Out-of-Scope Intent Detection](https://arxiv.org/pdf/2106.04564.pdf)
3. [Siamese Neural Networks for One-shot Image Recognition](https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf)
4. [Sentence-BERT: Sentence Embeddings](https://arxiv.org/pdf/1908.10084.pdf)

