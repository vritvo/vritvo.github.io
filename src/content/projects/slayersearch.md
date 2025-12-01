---
title: "Slayer Search"
description: "An AI-powered Buffy the Vampire Slayer semantic search engine."
featured: true
coverImage: "/slayer_search.png"
githubUrl: "https://github.com/vritvo/slayer_search"
websiteUrl: "https://slayersearch.com/"
order: 1
---

## About This Project

Slayer Search is a semantic search tool built on the transcripts of *Buffy the Vampire Slayer*. It lets you look up moments from the show by typing in a vague-but-specific memory of what happened.

Why make this? *Buffy* is one of my favorite shows, and I refer back to individual scenes constantly when I’m talking about it. Instead of scanning scripts or scrubbing through episodes, I can now ask in natural language and jump straight to the text I’m thinking of.

## How It Works
- Splits each episode into scenes, then into smaller overlapping text windows
- Creates embeddings that capture the semantic meaning of each chunk of text
- Enriches each chunk with NLP-extracted metadata (e.g., location, episode info)
- Ranks episode results by how closely they match a search query
