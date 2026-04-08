---
title: "Survivor ML"
description: "Predicting eliminations and win probabilities in Survivor using machine learning."
featured: true
coverImage: "/Survivor-ml.png"
githubUrl: "https://github.com/vritvo/survivor-ml/"
websiteUrl: "https://victoriaritvo.com/survivor-ml/"
order: 3
---

## About this project

An episode-by-episode prediction model for the TV show Survivor. That is, who gets eliminated next, and who wins the whole season? This lets you explore as the current season unfolds, or look at what the model thought for previous seasons.

## How it works

- Built a modeling table from historical Survivor data, engineering features from vote history, confessional screen time, challenge results, advantage/idol possession, and demographics.
- Trained two stacked models: an elimination risk model whose output becomes a feature for the win model. Used out-of-fold predictions to prevent data leakage.
- Validated using expanding-window cross-validation (train on seasons 1-S, test on S+1). Logistic Regression roughly doubled random baseline accuracy. 

## The website

Browse any season, and drill into any player to see which features are helping or hurting their chances. 
