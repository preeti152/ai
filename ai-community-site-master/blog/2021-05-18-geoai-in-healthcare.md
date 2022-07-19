---
slug: geoai-in-healthcare
title: GeoAI in Healthcare
date: 05-18-2021
author: Brendon Fischel
author_title: Product Manager, Platform Engineering & Practices
author_url: https://hub.uhg.com/pages/userprofile.aspx?pid=BFISCHEL
author_image_url: /img/userphoto.png
tags: [geoai, geospatial]
---

When you're thinking about the world of AI, with all the different types, technologies, and use cases, GeoAI is not the first thought that comes to mind. Especially in health care, many of you would have questions to how GeoAI affects health outcomes. According to Boulos et al, "Geospatial artificial intelligence (GeoAI) combines methods in spatial science (e.g., geographic information systems or GIS), AI, data mining, and high-performance computing to extract meaningful knowledge from spatial big data. GeoAI represents a focused domain within health intelligence that incorporates location to derive actionable information that can be used to improve human health." (2019) Within the walls of our organization, there is a huge opportunity to take advantage of the location aspect of technology and data because a large majority of our data (most reports and studies suggest ~80% of data in any enterprise has a geographic element) could be location intelligent. The use of modern geospatial technology with data that is location intelligent brings to bear the full science of geography and empowers data scientists and engineers to perform geospatial analysis, including GeoAI, in their workflows. In this way, GeoAI can transform problem identification, in office and in field workflows, operating awareness and monitoring and perhaps most importantly, transform the engines of business insights to understand trends, predict and forecast results, set priorities and make better decisions where current methodologies are lacking or simply do not exist.

<!--truncate-->

## Health Intelligence

The specific application of GeoAI is referred to as health intelligence. Specifically, it is "AI and data science methods and tools to provide accurate, efficient, and productive insights into healthcare and medicine" (Boulos et al, 2019). GeoAI aims to improve health at the population level. With GeoAI, we can capture and model our environment, connecting the places where we work, live, travel to social, environmental and other kinds of location-based exposures to understand their possible roles to influence our health (Lloyd 2020). Uses can predict disease occurrence and create disease control and prevention programs. Incorporating GIS practices and data into the development of health intelligence applications allows medical professionals to account for location-specific information such as environmental hazards, access to medical facilities, and demographics as well (LaGrone 2020). GeoAI is powered by machine learning, deep learning and data mining and offers the tools and technologies that help experts to visualize, understand and analyze real-world phenomena according to particular locations.

## GeoAI in Epidemiology

One of the first documented uses of spatial epidemiology was Dr. John Snow’s mapping of the 1854 Cholera outbreak in London. Dr. Snow mapped all of the known cholera deaths in the Soho district of New York, the 13 public wells in the area, and identified a higher number of Cholera cases around one specific well. This was the first time contaminated water was identified as the transmission method for Cholera and it is believed that Dr. Snow’s work began the study of epidemiology.

Since then, the study has advanced into GeoAI, where it can be used to analyze the spatial distribution of diseases and to study the effect of location-based factors on the outcomes of disease (Boulos et al, 2019). In studies across the world, GeoAI is helping epidemiologists find the answers they are looking for. In one example, machine learning has been used for hypothesis generation related to preterm births to determine spatiotemporal patterns of gestational age at delivery (Boulos et al, 2019). In another study in the Ivory Coast of Africa, machine learning was used to better understand determinants of HIV prevalence (Boulos et al, 2019). Epidemiologists in Latin America are also evaluating risk factors to develop algorithms that can predict dengue, Zika, and other mosquito-borne diseases using geo-tagged posts on social media (LaGrone 2020). Canada’s Global Public Health Intelligence Network monitors over 30,000 media sources worldwide to predict emerging health crises as well (LaGrone 2020). Additionally, tweets are being used to predict and track influenza and other flu-like diseases in real-time in places across the world.

Covid has changed the spotlight of epidemiology to the world, and the study continues to advance in its capabilities and insights based on the use of geospatial technology.

## IOT, Imagery, and Health Outcomes

IOT is currently being used to predict and protect from health outcomes. This is primarily performed through personal sensing, which collects data using the sensors embedded in mobile phones as well as through wearables. Using this data, data scientists are engaging in studies called spatial energetics, which is a field that focuses on collecting high spatiotemporal resolution data on location from GPS and GIS to identify spatial-based factors that may be associated with physical inactivity and obesity (Boulos et al, 2019). GeoAI could be used to analyze these location-based data to determine what types of activities, at certain times, exposures, locations for different types of people are relevant to an individual's health outcome (Boulos et al, 2019).

Imagery is also being used to fight disease transmissions and track immunizations across the world. Satellite and drone imagery can verify environmental features–identifying areas of stagnant water, which contains disease, and they can also give researchers and care-givers the tools to better understand traditionally "invisible" communities (LaGrone 2020). These include nomadic groups, remote populations, and those living in conflict zones. Additionally, in the Democratic Republic of Congo, researchers are using satellite imagery to detect potential settlements and navigation patterns to execute supplemental immunization activities (LaGrone 2020).

## ML & ArcGIS Pro

Many of techniques used in the analysis above can be done through the use of ESRI ArcGIS which is available from the Geospatial Analytics team within Optum Technology.

__Clustering tools in ArcGIS Pro__

Optum Maps offers access to ArcGIS Pro which provides users many clustering tools, such as Spatially Constrained Multivariate Clustering, Multivariate Clustering, Density-based Clustering, Image Segmentation, Hot Spot Analysis and Cluster and Outlier Analysis.

__Classification tools in ArcGIS Pro__

Classification is the process of deciding to which category an object should be assigned on a training set, for example to effectively help prepare for storm and flood events based on the latest high-resolution imagery of an area. ArcGIS tools for classification include Maximum Likelihood Classification, Random Trees, Support Vector Machine and Forest-based Classification and Regression.

__Prediction tools in ArcGIS Pro__

Prediction tools use the known to estimate the unknown, in the form of a continuous variable. Prediction tools in ArcGIS include Empirical Bayesian Kriging, Areal Interpolation, EBK Regression Prediction, Ordinary Least Squares Regression and Exploratory Regression, Geographically Weighted Regression and Generalized Linear Regression.

__Computer Vision & ArcGIS__

Computer vision is particularly useful for GIS, as satellite, aerial and drone imagery is being produced at a rapid rate. Object detection and pixel classification are among the most important computer vision tasks and are particularly useful for spatial analysis.

## Bibliography

1. https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6495523/
2. https://www.gwprime.geospatialworld.net/technology-and-innovation/transforming-healthcare-with-geospatial-and-ai/
3. https://www.azavea.com/blog/2020/01/17/geospatial-technology-and-ai-transforming-medicine/
4. https://uptodating.medium.com/geoai-a-blend-of-geospatial-technology-and-artificial-intelligence-11323950f20e
5. https://geospatialtraining.com/spatial-machine-learning-with-arcgis-pro/


<br/>

<hr/>

What do you think about GeoAI? Click the link below to discuss this post.

<ul class="contact-list">
  <li>
      <a href="https://teams.microsoft.com/l/message/19:be693c0dc0eb41719f07432a5fcf6cf6@thread.tacv2/1621369176899?tenantId=db05faca-c82a-4b9d-b9c5-0f64b6755421&groupId=a886ded2-d2cb-437c-acbf-e9d200fd8480&parentMessageId=1621369176899&teamName=AI%20Community&channelName=Blog&createdTime=1621369176899" target="_blank">
        <span class='icon-wrap'>
            <img src="/img/Microsoft_Teams.png" class="contact-icon"/>
        </span>
        Discuss this Post
      </a>
  </li>
</ul>
