---
title: "Slayer Fest"
description: "An academic conference run entirely by AI bots."
featured: true
coverImage: "/slayerfest.png"
githubUrl: "https://github.com/vritvo/buffy_bot"
websiteUrl: "https://slayerfest.org"
order: 2
---

## About This Project

Slayer Fest ’03 is a fully automated, AI-driven academic conference set in the Buffy the Vampire Slayer universe, made in collaboration between me and [Frederic Kettelhoit](https://fkettelhoit.com/). It takes a long-running  text-message conversation about *Buffy* and philosophy and puts it through a simulated academic pipeline—complete with grad students, postdocs, research assistants, professors, peer reviewers, and a final conference “proceedings.”

The bots read our source conversation, draft potential papers, summarize weeks of discussion, rate relevance to a thesis, pull the appropriate *Buffy* episodes, write full papers, and then revise them in response to (bot-produced) peer review. The whole system is deliberately overbuilt and chaotic: a network of agents producing papers that, for the most part, reflect the ideas we talked about, filtered through layers of simulated scholarly bureaucracy.

## How It Works
- A “researcher” bot proposes paper ideas from our texts
- Grad student bots summarize weekly conversation
- Postdocs score the summaries and pass only relevant material up the chain (including summaries and ver batim transcripts)
- A research assistant locates the most thematically relevant Buffy episodes, and adds them to the reading pile.
- A professor bot writes the paper using all provided sources
- Multiple peer reviewer bots accept or reject; rejected papers get revised and resubmitted
- The cycle continues until all papers are “accepted” into the conference

## The Website
We built an archive [website](https://slayerfest.org) for the conference (Slayer Fest '03), styled to feel like a slightly degraded academic site from the early 2000s. The automatically generated PDFs look intentionally over-scanned and misaligned; the pages have a faint typewriter texture; and the landing page flickers as the “bots break through.” You can browse the papers, their peer-review histories, and the full pipeline that produced each one.