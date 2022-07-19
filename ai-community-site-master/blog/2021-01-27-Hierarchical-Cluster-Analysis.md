---
slug: hierarchal-cluster-Analysis
title: "Hierarchical Cluster Analysis for Claims Remediation"
author: Ryan Allen
author_title: Principal Data Scientist, Advanced Research and Analytics
author_image_url: /img/userphoto.png
tags: [unsupervised, machine learning, claims, hierarchical clustering, metrics, patent]
---

At UnitedHealthcare there are teams of claims analysts who's job it is to
identify defective claims and try to determine the root cause error that's creating the
issue. The lack of systematic discovery, along with the sheer volume of claims
that are reworked every month, means that the remediation process is both reactive
and time consuming. That's where the ***Hierarchical Cluster Analysis (HCA)*** methodology comes
into play. As a part of the Claims Analytics for Remediation project in Advanced Research
and Analytics, HCA has created a near turn-key solution that efficiently and transparently
utilizes unsupervised machine learning to not only identify similar erroneous claims but is
also able to tell the analysts how the claims are similar, all in an easy reporting package.
Because of this, anyone having to do remediation can look at groups of similar claims,
determine why there are similar (and yet different from the other clusters of claims) and start
their deep dive analysis from a more informed place.

<!--truncate-->

## The Model

The first problem we came across in trying to cluster the claims was that non-hierarchical models
like KMeans were splitting mainly on low cardinality variables. Features like facility versus
provider claims, auto or manually adjudicated, and claim status. This really didn't
get to the granularity the analyst teams needed in order to create actionable insights.
Different hierarchical methods like BIRCH, DBSCAN, and Agglomerative Clustering would help
get to the level of detail needed but were too computationally inefficient for the large amount of
claims being analyzed month after month. That's where the central core of HCA comes in. What
if we could make the computationally efficient KMeans algorithm hierarchal? By creating a pipeline
of KMeans algorithms, each feeding into the next, we were able to get the best of both worlds. The
runtime for clustering went from hours (or the dreaded OOM error) to minutes.
And because we created the pipeline ourselves, we had full control over each "tier"
of the model. If the business wants to only consider three variables for clustering at the highest
level we can do that. Are they really only interested in place of service and provider type at the
most granular tier? We can do that. It's fully customizable to fit what the claims analysts
need at each step of the process based on their subject matter expertise. And while this created
efficiency for the remediators, it also showed a glaring usability issue. Why were the clusters
created the way they were?

## The Metrics

### Intra-Cluster Variable Importance
Because HCA was going to be used by the business, they needed to know why each of the clusters
exists and what is in them. So the first thing we did is create a metric called ***intra-cluster variable
importance***. Initially random forests were trained using the claims data as the X values and
the cluster numbers as the y, and then calculated a class-based impurity importance (Gini) as a means to
show what the key variables are in determining which claims ended up in which segment. This ran into
two issues. First, Gini impurity doesn't mean much to a claims analyst. And second, the model
was on occasion saying a particular value was important but it didn't occur as frequently as
the analysts would have assumed given the importance the model was giving it. So to help solve
the problem we created the intra-cluster variable importance which is the Gini impurity score
multiplied by the volume of claims with that specific value in the cluster. It not only shows the business
how "mathematically" important a value is to the model's decision but also how often it occurs.
So now the business could determine which variables are used to create each cluster, and give
them a way to start deciding which clusters to analyze based on which segment
seems the most interesting. But along with this came another issue, some variables were showing
up as being important in the majority of clusters. And, paraphrasing Dash from The Incredibles,
if every variable is special then none of them are.

### Incremental Representation
And that's where ***incremental representation*** comes in. Using the NLP technique Term Frequency
-Inverse Document Frequency as inspiration, we came up with a metric that's able to give a
uniqueness score and help create more transparency and usability in the model. Incremental
representation is calculated in three steps:

1. Cluster Weight = (Count of claims in cluster) / (count of all claims in the tier)
2. Expected Variable Count = (Count of specific variable in cluster) * (Cluster Weight)
3. Incremental Representation = ((Actual variable count in cluster) - (Expected Variable Count))
/ (Total count of claims in cluster)

By showing both the intra-cluster variable importance and the incremental representation, the
analysts tasked with identifying root cause errors and remediating claims are given two
numbers to identify not only which variables a cluster was created around, but also which
variables in that cluster are highly unique. There was only one more question for the HCA
methodology, can we turn two metrics into one?

### Overall Variable importance
In order to be as usable as possible it would be ideal if we could combine the incremental
representation and intra-cluster variable importance into one value. That way we can have
an easy one-value color scale on a dashboard to show which features to really focus on. Our first
attempt was to just use the average of the two values, but found that when one value was high
it "artificially" inflated the value even if the other value was much lower. We finally found
the following formula worked the best:

***Overall Variable Importance = (2 * intra-cluster importance * incremental importance)/
(intra-cluster importance + incremental representation)***

This calculation gives an analogy to the arithmetic mean but doesn't allow one extremely high
value or extremely low value to have too large of an effect on the metric. At this point there
was nothing left to do but figure out the best way to update the HCA model for each line of
business each month and create an interactive report to put all of the information at the
analysts' fingertips

## The Means
Updating the HCA every month not only means running the data pull, preprocessing, and model
fitting, but also the ETL job upstream from the model. In order to make this as easy as possible
a frontend was developed using Streamlit. This simple GUI allows us to run the ETL Job,
update the HCA models, push the model outputs into HIVE, and clean up any unnecessary artifacts
with just two field, a few buttons, and a date selector. The model outputs are then joined with
other curated claims data and put behind a Tableau dashboard. From there the analysts can slice
and dice the data they usually use for remediation, but with the ability to filter by HCA segments
and see which variables in each cluster had a high overall importance score. And because the report is developed in
Tableau the analysts have access to all of the data available on the backend for further in depth
analysis.

## The End
Currently the HCA, through the CAR project, has been developed for all lines of business
and is actively being used by NICE and Community & State. The ability to not only have
all of the claims data at their fingertips, but to be able to curate which group of
claims to remediate has lead to improved efficiency as well as identifying new opportunities.
Along with that the HCA methodology has already been filed with the US Patent and Trademark
Office *and is currently Patent Pending*.

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