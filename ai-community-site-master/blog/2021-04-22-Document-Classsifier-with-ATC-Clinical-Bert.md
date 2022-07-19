---
slug: atc-clinical-transformers-on-iqs
title: ATC Clinical Transformers on OptumIQ Studio Workbench
author: Sahil Manchanda
author_title: Software Engineer, ATC
author_url: https://github.optum.com/smancha5
author_image_url: https://github.optum.com/avatars/u/14784?s=460&u=069cc9799b17d6afbd4c433df1d4851d4f6509c5
tags: [transformers, BERT, clinical, deep learning, nlp]
---


In UHG, as in other health care organizations, there is a huge need for clinical language understanding tools. Our enterprise processes millions of clinical notes every day where a lot of information is buried in the unstructured parts of the notes. Extracting information from this unstructured data will help in use cases like claim prediction, computer-assisted coding, and clinical documentation improvement. Pretrained language models have caused significant improvements in language understanding tasks in the last couple of years. BERT, a bidirectional masked language model, developed by Google has resulted in a series of other language models that have outperformed humans in most of the language understanding tasks on GLUE (General Language Understanding Evaluation) benchmark like machine translation, summarization.

The pre-training of BERT or any transformers-based large model (also called language modeling) is the most computationally expensive task and requires GPU intensive architecture. Hence, We have pre-trained a variety of Bert models on huge amounts of clinical data for anyone to fine-tune and consume via IQS. This post shows how you can fine-tune the aforementioned pre-trained Clinical Transformer models for your use case.

<!--truncate-->

## Steps to access the models
All our models are available via IQS datasets. For a list of model available, checkout the list [**here**](https://ai.uhg.com/docs/getting-started/reuse#clinical-transformers). You can follow the following steps to access them:

1. Create a private IQS Workspace
2. Have Access to a fine tuning dataset
3. Connect to the model of your choice by following the post: **https://workbench.optum.ai/training-datasets/**. For Instance, to add the model "atcclinicalbert" to your private workspace, run the command "iqs workspace add-dataset //<your workspacename//> atcclinicalbert"
4. All the models you add will be available at /mnt/datasets/
4. Initialize a vm in the workspace and follow along :)


## Classifying CPT codes from clinical notes

This Notebook will show you how to fine-tune ATC's clinical BERT for *document* classification tasks using a clinical notes with cpt code labels as an example. The data set should be pre cleaned of unwanted artifacts and encodings and stratified to ensure consitant label distribution. Our data for this example was in the form of a csv with columns 'text' containing documents in string format and column and 'type' containing 24 unique labels.

### 1: Train and test data


```python
import pandas as pd

train_df = pd.read_csv("<Your_train_csv_file>")
test_df = pd.read_csv("Your_test_csv_file")
```

#### Quick inspection of data set


```python
train_df.head()
```


```python
print(f"Number of samples in training set: {len(train_df)}.")
print(f"Number of labels in training set: {train_df['type'].nunique()}.")

```

#### Encode labels
*Note: Labels fit of just training set as set have previously been stratified*


```python
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()
le.fit(train_df['type'])

train_df['encoded_label'] = le.transform(train_df['type'])
test_df['encoded_label'] = le.transform(test_df['type'])

num_classes = len(le.classes_)
```


```python
le.classes_
```


```python
train_df.head()
```

### 2. Check Enviornment and Assign GPU if Available.

As fine tuning tasks are computationally heavy and slow on cpu, ideally training would be run on at least 1 GPU 



```python
from torch import cuda
# set device to cuda if GPU available
device = 'cuda' if cuda.is_available() else 'cpu'
## Access the clinical bert model
```

### 3. Load ATC Clinical BERT model with classification layer and tokenizer
Loads ATC's clinical bert model trained on clinical notes


```python
model_path = '/mnt/datasets/atcclinicalbert/latest'
```


```python

from transformers import BertForSequenceClassification, AdamW, BertConfig

model = BertForSequenceClassification.from_pretrained('/mnt/datasets/atcclinicalbert/latest')
model.to(device)
```

We'll be using [**BertForSequenceClassification**](https://huggingface.co/transformers/v2.2.0/model_doc/bert.html#bertforsequenceclassification). This is the normal BERT model with an added single linear layer on top for classification that we will use as a sentence classifier. As we feed input data, the entire pre-trained BERT model and the additional untrained classification layer is trained on our specific task.


```python
from transformers import BertForSequenceClassification, AdamW, BertConfig

# Load BertForSequenceClassification, the pretrained ATC clinical BERT model with a single
# linear classification layer on top.
model = BertForSequenceClassification.from_pretrained(
    model_path, 
    num_labels = 24, # The number of output labels--2 for binary classification.
                    # You can increase this for multi-class tasks.
    output_attentions = False, # Whether the model returns attentions weights.
    output_hidden_states = False, # Whether the model returns all hidden-states.
)

model.to(device)
```

In the below cell, we take take a look at some model parameters. Names and dimensions of the weights for:

1. The embedding layer.
2. The first of the twelve transformers.
3. The output layer.


```python
params = list(model.named_parameters())

print('The BERT model has {:} different named parameters.\n'.format(len(params)))

print('==== Embedding Layer ====\n')

for p in params[0:5]:
    print("{:<55} {:>12}".format(p[0], str(tuple(p[1].size()))))

print('\n==== First Transformer ====\n')

for p in params[5:21]:
    print("{:<55} {:>12}".format(p[0], str(tuple(p[1].size()))))

print('\n==== Output Layer ====\n')

for p in params[-4:]:
    print("{:<55} {:>12}".format(p[0], str(tuple(p[1].size()))))
```

### 4. Tokenization and Input Formating


To feed our text to ATC_clinical_bert, it must be split into tokens, and then these tokens must be mapped to their index in the tokenizer vocabulary.

The tokenization must be performed by the tokenizer included with ATC_clinical_bert and can be loaded via the previously defined ```model_name``` which is "ATC_clinical_bert"



```python
from transformers import BertTokenizer

tokenizer = BertTokenizer.from_pretrained(model_path)
```

We are required to:

1. Add special tokens to the start and end of each sentence. `[CLS]`, `[SEP]`.
2. Pad & truncate all sentences to a single constant length.
3. Explicitly differentiate real tokens from padding tokens with the "attention mask".

**`[CLS]`**

For classification tasks, we must prepend the special `[CLS]` token to the beginning of every sentence.

This token has special significance. BERT consists of 12 Transformer layers. Each transformer takes in a list of token embeddings, and produces the same number of embeddings on the output (but with the feature values changed, of course!).

On the output of the final (12th) transformer, *only the first embedding (corresponding to the [CLS] token) is used by the classifier*.

>  "The first token of every sequence is always a special classification token (`[CLS]`). The final hidden state
corresponding to this token is used as the aggregate sequence representation for classification
tasks." (from the [**BERT paper**](https://arxiv.org/pdf/1810.04805.pdf))

As BERT is trained to use this [CLS] token for classification, we know that the model has been motivated to encode everything it needs for the classification step into that single 768-value embedding vector.


**`[SEP]`**

At the end of every sentence, we need to append the special `[SEP]` token. 

This token is an artifact of two-sentence tasks, where BERT is given two separate sentences and asked to determine something. 


BERT has two constraints:

1. All sentences must be padded or truncated to a single, fixed length.
2. The maximum sentence length is 512 tokens.

The sentences in our dataset obviously have varying lengths, so this needs to handled before inputing to our model.

Padding is done with a special `[PAD]` token, which is at index 0 in the BERT vocabulary.

The "Attention Mask" is simply an array of 1s and 0s indicating which tokens are padding and which aren't.

The `tokenizer.encode_plus` function combines multiple steps for us:

1. Split the sentence into tokens.
2. Add the special `[CLS]` and `[SEP]` tokens.
3. Map the tokens to their IDs.
4. Pads to defined max sequence lenght
5. Truncates if longer than max sequence length



```python
import numpy as np

input_ids = []
attention_masks = []

print('Tokenizing Documents...')

for doc in train_df.text:
    if ((len(input_ids) % 20000) == 0):
        print('  Read {:,} comments.'.format(len(input_ids)))

    encoded = tokenizer.encode_plus(
                        doc,                      # Doc to encode.
                        None,
                        add_special_tokens=True,
                        max_length=512,
                        truncation=True,
                        pad_to_max_length=True,
                        return_token_type_ids=False  # Not required for doc classificaton
                   )
    
    # Add the encoded sentence to the list.
    input_ids.append(encoded['input_ids'])
    attention_masks.append(encoded['attention_mask'])


print('DONE.')
print('{:>10,} Documents'.format(len(input_ids)))
```

#### Training & Validation Split

Here we take 10% of our data to use as a validation set in training. If you have a separate validation set this part is not necessary


```python
labels = train_df.encoded_label.values
```


```python
from sklearn.model_selection import train_test_split

# Use 90% for training and 10% for validation.
train_inputs, validation_inputs, train_labels, validation_labels = train_test_split(input_ids, labels, 
                                                            random_state=2018, test_size=0.1)
# Do the same for the masks.
train_masks, validation_masks, _, _ = train_test_split(attention_masks, labels,
                                             random_state=2018, test_size=0.1)
```

#### Convert all inputs and labels into torch tensors, the required datatype 


```python
import torch
train_inputs = torch.tensor(train_inputs)
validation_inputs = torch.tensor(validation_inputs)

train_labels = torch.tensor(train_labels)
validation_labels = torch.tensor(validation_labels)

train_masks = torch.tensor(train_masks)
validation_masks = torch.tensor(validation_masks)
```

We'll also create an iterator for our dataset using the torch DataLoader class. This helps save on memory during training as with an iterator the entire dataset does not need to be loaded into memory.

Here we will specify a batch size. BERT authors reccomend a batch of 16 or 32 for fine tuning, however this can be experimented with depending on the specific task.


```python
from torch.utils.data import TensorDataset, DataLoader, RandomSampler, SequentialSampler

batch_size = 16

# Create the DataLoader for our training set.
train_data = TensorDataset(train_inputs, train_masks, train_labels)
train_sampler = RandomSampler(train_data)
train_dataloader = DataLoader(train_data, sampler=train_sampler, batch_size=batch_size)

# Create the DataLoader for our validation set.
validation_data = TensorDataset(validation_inputs, validation_masks, validation_labels)
validation_sampler = SequentialSampler(validation_data)
validation_dataloader = DataLoader(validation_data, sampler=validation_sampler, batch_size=batch_size)
```

### 5. Optimizer & Learning Rate Scheduler

Now that we have our model loaded we need to grab the training hyperparameters from within the stored model.

For the purposes of fine-tuning, the authors recommend choosing from the following values:
- Batch size: 16, 32  (We chose 32 when creating our DataLoaders).
- Learning rate (Adam): 5e-5, 3e-5, 2e-5  (We'll use 2e-5).
- Number of epochs: 2, 3, 4  (We'll use 4).

The epsilon parameter `eps = 1e-8` is "a very small number to prevent any division by zero in the implementation" (from [**here**](https://machinelearningmastery.com/adam-optimization-algorithm-for-deep-learning/)).

You can find the creation of the AdamW optimizer in `run_glue.py` [**here**](https://github.com/huggingface/transformers/blob/5bfcd0485ece086ebcbed2d008813037968a9e58/examples/run_glue.py#L109).


```python
from transformers import AdamW
optimizer = AdamW(params=model.parameters(), lr=2e-5)
```

[**Mixed precision training**](https://github.com/NVIDIA/apex) can be utilised at this point if required.


Insallation On IQS: 
```
cd /mnt/subscriptionshare/bert-training/external_packages/apex

python3.7 setup.py install 
```

Then after initalising the optimizer in the cell above

```
from apex import amp

model, optimizer = amp.initialize(model, optimizer, opt_level="O1",verbosity=0)
```

BertForSequenceClassification uses CrossEntrophyLoss if the number of labels is > 1. Learn more [**here**](https://github.com/huggingface/transformers/blob/9aeacb58bab321bc21c24bbdf7a24efdccb1d426/src/transformers/modeling_bert.py#L1353-L1360).


#### Create Warmup Scheduler


```python
from transformers import get_linear_schedule_with_warmup
epochs = 4
# Total number of training steps is number of batches * number of epochs.
total_steps = len(train_dataloader) * epochs
# Create the learning rate scheduler.
scheduler = get_linear_schedule_with_warmup(optimizer, 
                                            num_warmup_steps = 0, # Default value in run_glue.py
                                            num_training_steps = total_steps)
```

### 6. Training Loop

Below is our training loop. For each pass in our loop we have a trianing phase and a validation phase. At each pass we need to:

Training loop:
- Unpack our data inputs and labels
- Load data onto the GPU if available
- Clear out the gradients calculated in the previous pass. 
    - In pytorch the gradients accumulate by default (useful for things like RNNs) unless you explicitly clear them out.
- Forward pass (feed input data through the network)
- Backward pass (backpropagation)
- Tell the network to update parameters with optimizer.step()
- Track variables for monitoring progress

Evalution loop:
- Unpack our data inputs and labels
- Load data onto the GPU if available
- Forward pass (feed input data through the network)
- Compute loss on our validation data and track variables for monitoring progress

So please read carefully through the comments to get an understanding of what's happening. If you're unfamiliar with pytorch a quick look at some of their [**beginner tutorials**](https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html#sphx-glr-beginner-blitz-cifar10-tutorial-py) will help show you that training loops really involve only a few simple steps; the rest is usually just decoration and logging.  

#### Some helper functions for calculating accuracy and times


```python
import time
import datetime

def flat_accuracy(preds, labels):
    '''
    Takes predicted output and true labels and calculates accuracy
    '''
    pred_flat = np.argmax(preds, axis=1).flatten()
    labels_flat = labels.flatten()
    
    return np.sum(pred_flat == labels_flat) / len(labels_flat)


def format_time(elapsed):
    '''
    Takes a time in seconds and returns a string hh:mm:ss
    '''
    # Round to the nearest second.
    elapsed_rounded = int(round((elapsed)))
    
    # Format as hh:mm:ss
    return str(datetime.timedelta(seconds=elapsed_rounded))
```


```python
import random

# This training code is based on the `run_glue.py` script here:
# https://github.com/huggingface/transformers/blob/5bfcd0485ece086ebcbed2d008813037968a9e58/examples/run_glue.py#L128


# Set the seed value to make reproducible.
seed_val = 42

random.seed(seed_val)
np.random.seed(seed_val)
torch.manual_seed(seed_val)
torch.cuda.manual_seed_all(seed_val)

loss_values = []

# For each epoch...
for epoch_i in range(0, epochs):

    print("")
    print('======== Epoch {:} / {:} ========'.format(epoch_i + 1, epochs))
    print('Training...')

    # Measure how long the training epoch takes.
    t0 = time.time()

    # Reset the total loss for this epoch.
    total_loss = 0

    # Put the model into training mode.
    model.train()

    for step, batch in enumerate(train_dataloader):

        # Progress update every 100 batches.
        if step % 100 == 0 and not step == 0:
            # Calculate elapsed time in minutes.
            elapsed = format_time(time.time() - t0)
            
            # Report progress.
            print('  Batch {:>5,}  of  {:>5,}.    Elapsed: {:}.'.format(step, len(train_dataloader), elapsed))

        # Unpack this training batch from our dataloader. 
        # `batch` contains three pytorch tensors:
        #   [0]: input ids 
        #   [1]: attention masks
        #   [2]: labels 
        b_input_ids = batch[0].to(device)
        b_input_mask = batch[1].to(device)
        b_labels = batch[2].to(device)

        # clear previously calculated gradients before performing backward pass.
        model.zero_grad()        

        # Perform a forward pass, returns the loss 
        outputs = model(b_input_ids, 
                    token_type_ids=None, 
                    attention_mask=b_input_mask, 
                    labels=b_labels)
        
        # pull the loss value out of the tuple.
        loss = outputs[0]

        # Accumulate the training loss over all of the batches 
        total_loss += loss.item()

        # Perform a backward pass to calculate the gradients.
        loss.backward()

        # Clip the norm of the gradients to 1.0. This is to help prevent the "exploding gradients" problem.
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)

        # Update parameters and take a step using the computed gradient.
        optimizer.step()

        # Update the learning rate.
        scheduler.step()

    # Calculate the average loss over the training data.
    avg_train_loss = total_loss / len(train_dataloader)            
    
    # Store the loss value for plotting the learning curve.
    loss_values.append(avg_train_loss)

    print("")
    print("  Average training loss: {0:.2f}".format(avg_train_loss))
    print("  Training epcoh took: {:}".format(format_time(time.time() - t0)))
        
    # ========================================
    #               Validation
    # ========================================
    # After the completion of each training epoch, measure our performance on
    # our validation set.

    print("")
    print("Running Validation...")

    t0 = time.time()

    # Put the model in evaluation mode--the dropout layers behave differently
    # during evaluation.
    model.eval()

    # Tracking variables 
    eval_loss, eval_accuracy = 0, 0
    nb_eval_steps, nb_eval_examples = 0, 0

    # Evaluate data for one epoch
    for batch in validation_dataloader:
        
        # Add batch to GPU
        batch = tuple(t.to(device) for t in batch)
        
        # Unpack the inputs from our dataloader
        b_input_ids, b_input_mask, b_labels = batch
        
        # Telling the model not to compute or store gradients, saving memory and
        # speeding up validation
        with torch.no_grad():        

            # Forward pass, calculate logit predictions.
            # This will return the logits rather than the loss because we have
            # not provided labels.
            outputs = model(b_input_ids, 
                            token_type_ids=None, 
                            attention_mask=b_input_mask)
        
        # Get the "logits" output by the model. The "logits" are the output
        # values prior to applying an activation function like the softmax.
        logits = outputs[0]

        # Move logits and labels to CPU
        logits = logits.detach().cpu().numpy()
        label_ids = b_labels.to('cpu').numpy()
        
        # Calculate the accuracy for this batch of test sentences.
        tmp_eval_accuracy = flat_accuracy(logits, label_ids)
        
        # Accumulate the total accuracy.
        eval_accuracy += tmp_eval_accuracy

        # Track the number of batches
        nb_eval_steps += 1

    # Report the final accuracy for this validation run.
    print("  Accuracy: {0:.2f}".format(eval_accuracy/nb_eval_steps))
    print("  Validation took: {:}".format(format_time(time.time() - t0)))

print("")
print("Training complete!")
```


```python
import os
output_dir = './model_save/'

# Create output directory if needed
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

print("Saving model to %s" % output_dir)

# Save a trained model, configuration and tokenizer using `save_pretrained()`.
# They can then be reloaded using `from_pretrained()`
model_to_save = model.module if hasattr(model, 'module') else model  # Take care of distributed/parallel training
model_to_save.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
```


```python
!ls -l --block-size=K ./model_save/
```


```python
# Load a trained model and vocabulary that you have fine-tuned
reloaded_model = BertForSequenceClassification.from_pretrained(output_dir)
reloaded_tokenizer = AutoTokenizer.from_pretrained(output_dir)
 
```


### Future Work
All of these models are based on BERT model architecture. So, the maximum sequence length the models can handle is 512. Our next release will have a broader set of models including models like Reformer and Longformer that can handle longer sequences of text. We also plan on reducing the complexity of these models by creating distilled versions to make them run faster on CPUs.
We hope the NLP community in our enterprise finds these models useful for their clinical NLP usecases.

<hr/>

Have thoughts or questions? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1619444280269?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1619444280269&teamName=AI%20Community&channelName=Blog&createdTime=1619444280269" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>
