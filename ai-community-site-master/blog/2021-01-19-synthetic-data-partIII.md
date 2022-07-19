---
slug: synthetic-health-care-data-III
title: "Synthetic Health Care Data: Applying the Generation and Certification Frameworks"
author: Jayanthi Suryanarayana
author_title: Sr. Principal Engineer, TLCP
author_url: https://hubconnect.uhg.com/groups/tlcp/blog/2019/05/22/jayanthi-suryanarayana
author_image_url: https://hub.uhg.com/_layouts/15/EPI/Img/avatar.aspx?useCaching=false&h=144&w=144&auri=people/129883/avatar?a=268146
tags: [synthetic data, deep learning]
---


In this third and final post in the [**blog series on synthetic health care data**](https://ai.uhg.com/blog/tags/synthetic-data), you will see a walkthrough of code samples on how to implement the framework described in the [**part II blog**](https://ai.uhg.com/blog/synthetic-health-care-data-partII).

The focus of this post will be on tools and libraries and a review of working code to understand the potential of this capability.

<!--truncate-->

**Objectives :**

1. Learn to generate a synthetic data set from a publicly available data set
2. Learn techniques for certification for statistical similarity and model similarity

**Data Set :**

The Cleveland Clinic Foundation diabetes has a publicly available data asset which is used as the actual dataset for which an equivalent synthetic dataset will be generated. You can download or learn more on this data set by visiting the website [**here**](http://archive.ics.uci.edu/ml/datasets/heart+Disease).

In a nutshell, this data asset has the following 14 attributes: 

1. age 
2. sex
3. cp
4. trestbps
5. chol
6. fbs
7. restecg
8. thalach
9. exang
10. oldpeak
11. slope
12. ca
13. thal
14. num - the predicted attribute.

:::note 

All of these attributes are either `float` or `int`. Minimal preprocessing has been done and a csv file is made available in the data directory.

:::

## Environment Set Up

### Libraries

SDGan is the library used for synthesis. In addition to this, a number of scipy and scikit libraries will be used for statistiscal and module similarity. Keras library will be used for creating an auto encoder. 

Follow the instructions [**here**](https://sdv.dev/SDV/index.html) for GAN library set up. You can use your choice of python package management. 

For example, if using pip use to install sdgan use:

```python
pip install sdgan
```


### Downloading the Python Notebook

The python notebook available at **https://github.optum.com/SyntheticData/BlogCode** demonstrates the three components:

1. Necessary pacakge imports and data preparation of the diabetes data described above
2. Synthesize new data from original data
3. Implement methods that explains the concepts of certification

*Download the notebook and follow along!*

## Code Walkthrough 

### Import the Necessary Libraries

For general data processing, I recomment using pandas and numpy libraries. For statistical similarity measures use the scipy spatial distance module. The essence of the process is in SDV packages used for synthesis. For model related tasks use sklearn libraries. 

This is all shown in the code below.

```python
# Import the libraries
import pandas as pd
from scipy.spatial.distance import cityblock
from sdv.tabular import CTGAN
import numpy as np
import time
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
from sklearn.linear_model import LogisticRegression
```

### Function Implementation for Data Synthesis

SDV is a synthetic data generation ecosystem of open source libraries. For this blog, a tabular generator is taken as a way of illustration. The CTGAN model follows the general interfaces and has familiar methods suchs as fit, save etc.

```python

# Synthesis
def synthesize():
    org = pd.read_csv('data/heartCleaveClean.csv')
    model = CTGAN()
    model.fit(org)
    model.save('data/clevemodel.pkl')
    syncleave = model.sample(org.shape[0])
    syncleave.to_csv('data/synheartCleave.csv')
    return

```

### Function Implementaion for Column-wise Certification Using Distance Similarity

Spatial modules of scipy has method implementations of all the math behind distance metrics such as cityblock, euclidean, cosine etc. A number applications use these concepts as the foundational techniques for similarity measurement. A number of unsupervised learning techniques employ this distance measure techniques under the hood.

```python

# Certification using cityblock distance. A number of techniques can be explored here with the
# statistical and spatial modules of scipy
def certifyCleave():
    org = pd.read_csv('data/heartCleaveClean.csv')
    syn = pd.read_csv('data/synheartCleave.csv')
   #TODO do reflection to get to columns and compare
    ageSimilarity = cityblock(org.age,syn.age)
    cholSimilarity = cityblock(org.chol,syn.chol)

    print("ageSimilarity "+ str(ageSimilarity))
    print("cholSimilarity " + str(cholSimilarity))

```
### Function Implementaion for Model Similarity Certification 

The idea of model similarity gives a measure of how good the generated data can be used as a starting point for a number of data science projects where data acquisition is a cumbersome process. Here, a model trained on the original data is applied on the synthetic data set and the evaluation metric is compared.


```python

# For demo purpose, a simplistic approach is taken with a basic LogisticRegression as the model 
# and accuracy as a comparision metric
def certifyModelCleave():
    org = pd.read_csv('data/heartCleaveClean.csv')
    X=org.iloc[:,:org.shape[1]-1]
    y=org.num
    X_train, X_test, y_train, y_test = train_test_split(
     X, y, test_size=0.33, random_state=42,stratify=y)
    logreg = LogisticRegression(max_iter=1000)
    logreg.fit(X_train,y_train)
    preds = logreg.predict(X_test)
    accuracyOrg = accuracy_score(y_test,preds)

    syn = pd.read_csv('data/synheartCleave.csv')
    Xsyn=syn.iloc[:,:org.shape[1]-1]
    ysyn=syn.num
    preds = logreg.predict(Xsyn)
    accuracySyn = accuracy_score(ysyn,preds)

    print("accuracyOrg = " + str(accuracyOrg) + "accuracySyn = "+ str(accuracySyn))    
    
#certifyModelCleave()
    
```

### Pulling It All Together

Here, a simple end-to-end driver code ties all of the above steps together.

```python
# Driver code
tic = time.time()
synthesize()
certifyCleave()
certifyModelCleave()
toc = time.time()
print("elapsed time = " + str((1000*(toc-tic)))+" ms")
```

### Advanced Concept: Dimensionality Reduction Using Auto-Encoder

One of the curses in data science is dimensionality. When the dataset has large number columns, a number of preprocessing techniques are employed to abstract the essence for optimization. Autocoder is a technique that helps to reduce the dimenstionality but preserves the data properties. This can be used for preprocessing to develop row-wise similarity metrics.

```python
pip install keras
```

```python
# row_wise comparision technique with auto encoder
# Create auto encoder for oringal data and synthetic data
# A simple one layer encoder to demonstrate the dimension reduction function

from keras.layers import Input, Dense
from keras.models import Model
def modeling_autoencoder(latent_dim, x_train):
    original_dim= x_train.shape[1]

    # this is our input placeholder
    input_data = Input(shape=(original_dim,))
    # "encoded" is the encoded representation of the input
    encoded = Dense(latent_dim, activation='relu')(input_data)
    # "decoded" is the lossy reconstruction of the input
    decoded = Dense(original_dim, activation='sigmoid')(encoded)

    # this model maps an input to its reconstruction (Define a model that would turn input_data into decoded output)
    autoencoder = Model(input_data, decoded)
    
    #### Create a separate encoder model ####
    # this model maps an input to its encoded representation
    encoder = Model(input_data, encoded)
    
    #### as well as the decoder model ####
    # create a placeholder for an encoded (assigned # of dimensions) input
    encoded_input = Input(shape=(latent_dim,))
    # retrieve the last layer of the autoencoder model
    decoder_layer = autoencoder.layers[-1]
    # create the decoder model
    decoder = Model(encoded_input, decoder_layer(encoded_input)) 
    
    #### Autoencoder model training ####
    autoencoder.compile(optimizer='adadelta', loss='binary_crossentropy')
    
    autoencoder.fit(x_train, x_train,
                epochs=50,
                batch_size=256,
                shuffle=True,
                validation_split = 0.2)
    
    return encoder, decoder

```

Note that simplifications, such as the choice of model and metric, have been made to keep the focus on demonstrating an end-to-end approach. A word of caution, the autoenoder is given more as an approach and might take a longer time to run on your local machine.

## What's Next?

Our team is building an enterprise capability for generating synthetic data. We would like to get your feedback and requirements for what kind of synthetic data assets would be valuable for you and your teams. 

If you have ideas or feedback, please [submit an issue to this repo](https://github.optum.com/SyntheticData/MVPProgramMgt/issues) with your comments to help shape up and prioritize the roadmap.

You can also reach out to me directly at jayanthi_suryanarayana@optum.com or through Microsoft Teams.


<br/>

<hr/>

What are your thoughts? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1611073350569?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1611073350569&teamName=AI%20Community&channelName=Blog&createdTime=1611073350569" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>




