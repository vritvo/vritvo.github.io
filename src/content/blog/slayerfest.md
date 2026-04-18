---
title: "Slayerfest: An AI Simulation of Academia in the Buffyverse"
description: "A network of bots who only talk about Buffy."
pubDate: 2026-04-17
---

<figure>
  <img src="/blog/slayerfest/scoobies_computer.png"/>
</figure>


I love the 90s TV show *Buffy the Vampire Slayer*. I’ve seen it more times than I’d care to admit, and I can (if you’d let me) rant for hours about why I think it’s one of the most important TV shows ever made. After I gushed about *Buffy* to some people at the [Recurse Center](https://www.recurse.com/), [Frederic Kettelhoit](https://fredkettelhoit.com/) started watching the show, and we began DM-ing about it. 

At some point we had racked up thousands of messages about *Buffy* and the philosophical frameworks it uses. We wanted to turn it into something, so we did what any former-philosophers-turned-programmers would do: we built an automatic AI academic conference. 

There are now grad student bots, postdoc bots, research assistant bots, professor bots, researcher bots, and peer reviewer bots, each with their own distinct roles. They gather source materials, write the papers, review them, and revise them, until finally the papers are accepted into a "conference." The resulting [website](https://slayerfest.org/) is an archive of the papers, made to look like a spoof of a 1990s academic conference. 

Here's how it works. 

*(Note, since AI moves so rapidly these days: this project started in the summer of 2025. After a hiatus, the bulk of it was done in September-October of 2025, using Sonnet 4.5 as our AI academic "bots.")*

### The lab

The source material for the papers is our chat on Zulip (a messaging app), more than 5,000 messages about *Buffy the Vampire Slayer*. 

Now, you might be thinking: "ok sure, but aren't you just dumping your chats into Claude and having it write a paper?"

That would have been much simpler. 

But our continuously growing chats were soon approaching the limit of the context window at the time (we have a lot of long messages, I promise). More importantly, it would have been less fun. And this project was all about having fun. The goal was the process more than the output: we wanted to build a whole AI academic lab, a network of bots with different roles, collaborating to turn our rambling and ranty chats into something resembling a real paper.

The whole system is vibe coded. The code and the lab have a lot of redundancy, but we like to see that as reflecting the bureaucracy of academia. 

Here's how the pipeline works to generate a single paper: 

**Grad student bots** each focus on one week of our chats and produce a detailed summary. They effectively make the content more streamlined by stripping away any messages that were not related to analysis of *Buffy the Vampire Slayer*.

**Postdoc bots** are the gatekeepers for what gets sent to the professor. These bots receive the grad notes as well as a provided thesis statement for a paper. They score each week's notes on relevance to the thesis, from 0 to 100. If a note gets below 30, it’s irrelevant, and it doesn’t pass. 30-69: the grad bot's summary goes to the professor. 70+: the week is highly relevant, so the raw Zulip chat gets sent to the professor.

**Research assistant bots** receive the grad notes and the thesis statement, and identify the most relevant *Buffy* episodes. The corresponding scripts also get added to the research pile for the professor. This helped when Fred and I were hand-wavy about the actual quotes from the show.

**The professor bot** reads the full research stack (the summaries, the relevant verbatim chats, and the scripts) and writes the paper based on the thesis. 

<figure>
  <img src="/blog/slayerfest/slayerfest_lab.png"/>
  <figcaption>An AI lab. Our Zulip messages get split by week. Three sample weeks are shown. A grad student bot reads each week and produces summarized "grad notes" (not shown). Postdoc bots score each week's notes relevance to a thesis. Weeks below a minimum threshold are excluded entirely (e.g. here, Week 1, only 10/100). Mid-range weeks have grad notes sent to the professor (e.g. Week 2, 50/100). Highly relevant weeks have the verbatim chat transcripts sent to the professor (e.g. week 3, 90/100). Then, a research assistant bot uses the grad notes and a thesis to select the most relevant Buffy episodes, whose scripts are also added to the professor's stack.</figcaption>
</figure>


## Turning it into an automatic paper factory

Now we had a "lab" made up of AI bots that produced a paper. But it still required a human at various points (e.g. coming up with the paper topics, reviewing the outputs). To simulate the academic process, we'd need to automate those parts too. So we added a few more bots to take over those human moments:

**Researcher bots** read the grad notes and propose thesis statements and abstracts for potential papers. Each one kicks off a new lab that follows the academic pipeline described above. This replaces the need for a human to come up with paper topics (although in theory, the paper topics are still coming from Fred and my source Zulip chat).

**Peer reviewer bots** receive the paper, as well as the episodes that are relevant. They review each final paper and either accept or reject it (three peer reviewers per paper). If the paper is rejected, it returns to the professor bot, who revises it given the peer reviewers’ comments. The cycle continues until the reviewers accept the paper. 

And one small detail: the lab gives each pdf iteration a longer and longer name (e.g. *paper_copy_v2_FINAL.pdf*).  The peer reviewer bots are biased toward accepting papers with longer titles, so that the more rounds of review the paper has gone through, the more likely it is to be accepted. 

<figure>
  <img src="/blog/slayerfest/slayerfest_conference.png"/>
  <figcaption>A full conference. A researcher bot first reads the notes to determine paper topics. Each of these kicks off its own lab (with all the associated bots) to produce a paper. The paper gets sent to peer reviewer bots and can be either accepted or rejected. If rejected, it goes back to the professor, who rewrites it based on the reviewers' comments, with access to the original stack of research.</figcaption>
</figure>

 The whole process takes about five hours to run for eight researcher bot provided theses, outputting eight papers. It would take ten minutes, except we had to inject 60-second delays to avoid rate limits (or, as we like to say, to give the grad bots some much needed rest).

### The website
After running the conference, we made a [website](https://slayerfest.org/) as an archive. You can explore all the papers, along with the full peer review history for each one.

We wanted it to feel retro, like Buffy. It's all HTML, no JavaScript, and almost all black and white. We applied a custom SVG overlay to everything on the website to give it an old-school feel. The pipeline passes the auto-LaTeX-generated PDFs through ImageMagick to make them look like they were physically printed and manually scanned. There’s some slight random rotation, a faint wave in the page, and low DPI in the PDFs (see an example [here](https://slayerfest.org/pdfs/20251021_032610_The_Mayor_as_Theological_Figure_Faith_Belief_and_D_v2_v2.pdf)).

You can see a recorded run of a conference run on the [technical documentation page](https://slayerfest.org/technical_documentation.html).

## The papers

The goal here was never to produce great papers. These aren't being submitted anywhere. This was all a joke. 

Nonetheless, we were pretty pleased with how much of our perspectives survived in some melded, twisted way. Despite not sounding like either of our voices, despite the many layers of filtering, summarizing, scoring, and rewriting, what comes out on the other side is still recognizably our takes. The researcher bots did a decent job coming up with paper topics. The postdoc bots did a great job rating the conversations as relevant. The grad student bots did well at summarizing our conversations. Sometimes, the professor or researcher took some liberties (e.g. there's a paper about Kant, who we never mentioned in our chats. But we discussed the Nietzschean übermensch a lot in our interpretation of vampires, so I guess that comparison was not surprising). 

I don't always agree with the choices a bot makes, but usually when it gets it wrong, it gets it wrong for interesting reasons. Consider this example from the peer review process. Here's the beginning of the first submitted version of the paper "Institutional Critique and Patriarchal Authority in 4x10 'Hush': Silence as Resistance" (and, as said above, you can track these versions in the peer review history online): 

<figure>
  <img src="/blog/slayerfest/paper_abstract.png"/>
  <figcaption>The abstract for the first submission of one of the papers.</figcaption>
</figure>

That is, the original abstract argues that the monsters of the week, named the "Gentlemen," function as a patriarchal institution rendered in fairy form, whose "primary weapon is silencing — removing the capacity to speak, protest, or organize collective action." 

I think this is right. It’s what Fred and I texted about, and at this point it's a pretty well-established take on a famous episode of TV. The original lab did a good job maintaining the perspective we discussed.

However, the peer reviewers [disagreed](https://slayerfest.org/iterations/Institutional_Critique_and_Patriarchal_Authority_i_iteration_1.html). They rejected the paper. One peer reviewer said the paper "makes sweeping theoretical claims about patriarchal authority that are not adequately supported by textual evidence from the episode," and argued instead that the Gentlemen "function more as fairytale monsters with specific magical properties."

Even if the peer reviewers were wrong, the professor then had to incorporate these comments. In the final, accepted paper, "patriarchal authority" became "institutional authority." The argument got much blander. 

Reading the peer review history here, I felt genuinely annoyed. The peer reviewers forced the lab to butcher the argument! I wasn't expecting to go around telling people how these AI reviewers had missed the point of the original argument, but I did, *several times*, and here I am doing it again now. Maybe the irritation at the peer review process is the truest sign that we built an accurate simulation.