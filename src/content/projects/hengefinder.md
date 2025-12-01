---
title: "Hengefinder"
description: "Find when the sun lines up with the streets around you."
featured: true
coverImage: "/hengefinder.png"
githubUrl: "https://github.com/vritvo/henge_finder"
websiteUrl: "https://hengefinder.rcdis.co/"
order: 3 
---

## About This Project

**HengeFinder** is a tool for finding sunset alignments anywhere in the world.

It's based on the concept of ["Manhattanhenge"](https://en.wikipedia.org/wiki/Manhattanhenge), an event in Manhattan twice a year, when the sun aligns perfectly with the street and crowds gather to take photos. The goal was to generalize the concept to any city, block, or vantage point (what if you want to ride down a canal in Amsterdam and have the sun set ahead of you while you do it?)

The app let's you pick a place on earth and it will tell you when the next henge will be. 

There's also an educational page to explain how henges work, and why they happen at most twice a year--even when streets do not run perfectly east/west. 

## How It Works
- It grabs street geometry from OpenStreetMap and figures out the street’s compass bearing.
- It computes the sun’s position throughout the year and looks for moments when the sun’s azimuth matches that bearing.
