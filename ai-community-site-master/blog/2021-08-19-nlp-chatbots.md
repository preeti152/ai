---
slug: nlp-chatbots
title: "NLP in Virtual Assistants & Chatbots"
date: 08-19-2021
author: Nand Kishor
author_title: Principal Engineer, TLCP
author_url: https://hub.uhg.com/pages/userprofile.aspx?pid=nkishor
author_image_url: /img/userphoto.png
tags: [nlp,chatbots]
---


_Bots are like new applications and Human language is the new UI layer. - Satya Nadella, Microsoft._

**Virtual assistants and chatbots are revolutionizing customer-brand interactions** by helping businesses to provide accurate information more naturally, quickly and efficiently. Intelligence is infused into all interactions by **Natural Language Processing (NLP)** to interpret and understand user questions using **Natural Language Understanding (NLU)** and provide best answers using **Natural Language Generation (NLG)**.

<!--truncate-->

## Why chatbots need NLP?
Web/Mobile apps have a fixed set of inputs on a predefined user interface to get the required information. Unlike web apps, chatbots input is free-form natural language, i.e. you can type same question in hundred different ways. This problem is further exaggerated in voice-enabled chatbots and smart speakers as a user can speak the same question in a thousand different ways. It's close to impossible to cover so much variance programmatically in chatbots and that's where NLP comes to our rescue.

NLP is a type of artificial intelligence technology that aims to interpret, recognize, and understand user requests in the form of free language. NLP helps chatbots translate the unstructured human language to its own structured data to understand inputs and perform the tasks requested by a user.

## How NLP works in chatbots?
![voice-bot-flow](https://github.optum.com/storage/user/1291/files/5c43ba80-fc5e-11eb-8ac4-8d18fdbcd261)

When a user sends a message to a chatbot, NLU extract the meaning and context in terms of intents and entities. An intent is the purpose/goal a user wants to achieve and entities are named values required to fulfill the intent as shown in the voice bot communication diagram above.

In order to extract intent and entities we need to build NLU models. The next section talks about different platforms and AI services to build NLU models.

## Cloud platforms and AI services to build NLU models
### Azure LUIS
[Language Understanding (LUIS)](https://luis.ai) is a cloud-based conversational AI service from Microsoft that applies custom machine-learning intelligence to a user's conversational, natural language text to predict overall meaning and pull out relevant intent and entities.

### Google Dialogflow
[Dialogflow](https://dialogflow.cloud.google.com/#) is a natural language understanding platform from Google that makes it easy to design and integrate a conversational flow by extracting intent and entities.

_There are many other platform and AI services for NLU models like IBM Watson Conversation Service, Facebook Wit.ai, Alexa Skill kit, etc._

## Build your own NLU model
A few of the high level steps involved in building NLU models are as follows:
* **Tokenization** – converting a text into tokens
* **Noise Removal** - removing stopwords, etc.
* **Lemmatization** - obtaining root form of words
* **Word Embedding** - representing words as vectors
* **Model Training** - using libraries like spacy, tensorflow, etc.
* **Prediction Service** - rest api to predict intent/entities using a trained model

A POC to build and train NLU models with the above steps can be found at [NLU Model Repo](https://github.optum.com/nkishor/nlu-tensorflow-spacy-poc) using the following AI/ML libraries:
* **Intent Classification : tensorflow and tflearn**
* **Entity Extraction (NER): spacy**

## Pluggable NLU
There are multiple cloud AI services to build NLU models along with building our own models. We start with some AI service to build an NLU model for initial chatbot use case and later we might need to switch to another AI service or need to build our own model to serve complex use case requirements. 

Usually, a chatbot directly connects to a specific NLU model resulting in tightly coupled design and changing the NLU model will require considerable changes in chatbot dialogs. That's where Pluggable NLU comes to our rescue to decouple NLU from a chatbot as demonstrated in the below diagram.
![pluggable-nlu](https://github.optum.com/storage/user/1291/files/c23b3c80-fc74-11eb-87c5-7d30e71bf5f3)

With the above approach, a chatbot is served by NLU provider middleware with a standard contract and we can plug any NLU model without any impact on chatbot dialogs. **Pluggable NLU capability has been demonstrated in POC at [Pluggable NLU Repo](https://github.optum.com/nkishor/chabot-pluggable-nlu/tree/master/CustomRecognizorsMidddleware)**

_Engage with [Conversational AI Platform](https://conversational-ai.optum.com/) team to build chatbots more efficiently across UHG enterprise._

<br/>

<hr/>

Are you using chatbots today or have a future use case in mind?  

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1629394193320?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1629394193320&teamName=AI%20Community&channelName=Blog&createdTime=1629394193320" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Share with the AI community on Teams!
      </a>
  </li>
</ul>