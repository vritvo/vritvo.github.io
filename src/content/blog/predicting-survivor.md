---
title: "A Model for Winning Survivor"
description: "A machine learning model to predict outcomes for the CBS show Survivor."
pubDate: 2026-09-18
---


<figure>
  <img src="/blog/predicting-survivor/survivor_beach.jpg"/>
</figure>


The new season of *Survivor* airs next week. My favorite thing about watching *Survivor* is arguing about the strategy of the show: who should have won the season? Is it better to play under the radar? Or does making big moves set you up to win? Who is the greatest player of all time: Cirie? Tony? Boston Rob? I thought it'd be fun to build a machine learning model to help answer these questions.

On *Survivor* a bunch of real-life strangers are stranded somewhere remote. They manage camp life, compete in challenges for "immunity," hunt for advantages, and vote each other out every three days at "tribal council." Once it's down to the final two or three, the players who have been voted out (now called "the jury") vote for the winner. The winner takes home a million dollars and the title of "Sole Survivor."

Ultimately it's a social strategy game. 

It's messy and feels in some way outside the scope of what you can do with a mathematical model. But when we watch and argue about the show, we're implicitly building mental models of what it takes to win. An ML model is just a way to systematize those theories and put them to the test. And maybe, hopefully, it can give a meaningful preview of who will take the title of "Sole Survivor" (assuming, like me, you're the type to ignore the [betting market leaks](https://variety.com/2026/tv/news/survivor-jeff-probst-kalshi-polymarket-spoilers-1236757354/)). I loved using it while watching Season 50, and it identified several interesting threads early on. I'll share some of those insights with you here as well.


The model predicts, episode by episode, who's most likely to win, and who's most likely to go home next. You can play with the model's results [here](https://victoriaritvo.com/survivor-ml/).

<figure>
  <img src="/blog/predicting-survivor/dashboard_preview.png" style="max-width: 350px;"/>
  <figcaption>An overview of the Survivor ML dashboard.</figcaption>
</figure>

The website loads the most recent season by default, but you can explore previous ones too. The top row shows win and elimination probabilities across a season. Below that is a cumulative plot of who's been ranked #1 most often, which is a cleaner way to see the real contenders. A "Player Breakdown" section lets you pick a player to understand which features bump their odds up or down. More on all of this below. (And if you want all the nerdy ML details, there's a notes section at the end.)


**Caution**: Spoilers for the TV show *Survivor* ahead!

<figure>
  <img src="/blog/predicting-survivor/here-we-go-jeff-probst.gif" style="max-width: 250px;" alt="Jeff Probst saying 'Here we go!'"/>

</figure>

## Building the model

The data comes from [the survivoR GitHub repo](https://github.com/doehm/survivoR), which has a ton of nicely structured *Survivor* data like voting history, challenge results, advantages, demographics, edit metrics, etc.

I trained two separate models: one predicts who will go home next episode, and one predicts who will win the whole season. This isn't a lot of data (especially for the Win model, since there are only 50 winners across US *Survivor*'s history), so take all the results with a grain of salt.

Both models use logistic regression. I tried fancier models too, but they performed worse (details in [Methodology notes](#methodology-notes) if you want them).

I built out a bunch of candidate features and let the model pick which ones mattered. The ones that survived into the Win model are:

- **Times in danger** (number of tribal councils where this person received any votes)
- **N** (a control for how many players are left. It's the same for everyone, so it's not shown in the dashboard, but the model uses it)
- **Confessional share** (rolling share of confessionals over the last 3 episodes; this one is more about the editorial storytelling than the other features)
- **Age** (this worked best as a curve rather than a straight line, meaning the model includes both a linear and a squared term. So, you're most likely to win if you're around 30, and your chances are lower if you're much older or younger)
- **Number of previous seasons**
- **Has advantage** (yes/no)

The features for the Elimination model are slightly different: 

- **N** (again, a control for how many players remain)
- **Advantages held** (how many advantages, rather than yes/no)
- **Votes against** (last 3 episodes)
- **Individual immunity win rate**
- **Age** (also a curve, but its effect is weaker than in the Win model)

An interesting outcome here: the two models kept different features, which means winning is not the same thing as surviving vote-outs, presumably because jury appeal is key and relies on different things. This lines up with what I think is the general take here. For instance, the show *Rob Has a Podcast* did a recent [episode](https://www.youtube.com/watch?v=utz9CwNcHqo) breaking down how *Survivor* 50 was won and lost, where Rob Cesternino concludes that a low likelihood of elimination doesn't necessarily give you high odds of winning.
## How good is the model? 

Not bad, depending on your perspective. For simplicity I'll talk mostly about the Win model.

I'm not going to pretend you can use this to *know* who's going to win. But on average it picks the eventual winner roughly 2x better than chance. 

What that means: if you pick a player at random, you'll get the winner right about 10% of the time (this varies with how many people are left, but 10% is an average). My model's #1 pick is right just over 20% of the time. That 2x improvement holds for most of the game, basically after two episodes have elapsed (once the features have enough data).

Being right ~20% of the time might not sound like much. It does mean it's wrong most of the time. That's fine to me, there's a huge amount of unquantifiable strategy and luck in any season that no model like this can capture. But 2x over baseline isn't bad! 

It's also worth separating two things: how the model *ranks* players, and its exact *probabilities*. The episode-to-episode bumps are tiny, especially early, when a big cast is splitting up the win equity. And it turns out the ordering may be more informative than the numerical probability of winning — the model's #1 pick actually wins more often than the probability suggests (for instance, the #1 pick wins 40% of the time going into the finale even though that pick has an average probability of only 29%). Just being the model's favorite has value. I think that discrepancy is likely an odd quirk of how I built this. More discussion on this in the notes section.

Anecdotally, I've found it pretty compelling how often the numbers match the assessment of people watching (or at least my own). It heavily favors a lot of the best winners, moves players' odds up and down in ways that make sense given what's happening in the game, and often picks up on trajectories before they're obvious in the main narrative. I got to watch that happen live, since I ran the model alongside Season 50.

## How did Season 50 go? 

Pretty well. The model was fun to have as a companion while I watched. A few things I noticed, to show how it can be used: 

**The model flagged Jonathan (the runner-up) as a contender before I took him seriously.** He ended up making a lot of strong endgame moves and had the highest P(Win) going into the finale (the wrong choice in the end, but not an unreasonable one, given how close he came). The "Win Probability by Episode" plot shows the relative P(Win) for every player, and you can see his trajectory rising mid-game. 


<figure>
  <img src="/blog/predicting-survivor/jonathan_trajectory.png"/>
  <figcaption>The model flagged Jonathan as a strong contender early.</figcaption>
</figure>


**Aubry, the actual winner, was one of the model's main contenders all season.** By the finale it did give Jonathan a higher P(Win) than Aubry. But she had a strong early game and was the #1 pick for much of the season. This is where the second metric gives you a different perspective. The "Fraction of Episodes Ranked at #1" is a smoothed-out way to see who the real contenders are, and it only appears on the dashboard once a few episodes have aired. In S50, the only players who ever reach #1 at all are Jonathan, Aubry, Ozzy, and Christian, who are all reasonable players to take seriously.



<figure>
  <img src="/blog/predicting-survivor/fraction_cumulative_rank.png"/>
  <figcaption>The main contenders for S50. This chart shows the fraction of episodes where each player was ranked #1 for P(Win). It's a smoothed view of the main plot, and it helps identify the real contenders. Aubry was the most consistent pick earlier in the season.</figcaption>
</figure>


**The model responds to in-game events realistically.** In episode 11, Cirie sensed danger and (correctly) played her extra vote advantage to save herself. She avoided elimination, but she had now received votes (bad) and spent her advantage (also bad). The model reflected this change in her situation accurately, with her elimination probability shooting up and her relative win chances dropping. She went home the next episode. 


<figure>
  <img src="/blog/predicting-survivor/cirie_trajectory.png"/>
  <figcaption>Probability of elimination (left) and probability of winning (right) for Cirie's game. For most of the season, Cirie had a low probability of both elimination and winning. Her P(Win) rose toward the end, but her big move that saved her also left her vulnerable: her P(Elimination) shot up and her relative rank in P(Win) sank, going into episode 12 when she was eliminated.</figcaption>
</figure>


**Why was the model so down on Cirie?**
Cirie is a beloved fan favorite, and I think a lot of people were thrilled to see her play in S50. In my view, she has a mastery of the social game unlike anyone else. Her odds crept up steadily over the game, but the model never had her as high as I personally wanted. Her player breakdown shows her age was capping her *win* probability. I don't know whether Cirie's low P(Win) is a result of the model missing Cirie's idiosyncratic strengths, or a result of it capturing something real that fans would rather ignore. Probably some of both.


<figure>
  <img src="/blog/predicting-survivor/cirie_features.png"/>
  <figcaption>Player Breakdown for Cirie in episode 12 (the episode she was voted out), explaining the model's prediction. The left two plots are the Elimination model. The right two are the Win model. The top row is "Model Contributions," where the width of each bar shows that feature's contribution. The bottom row is "Compared to Field," a way to see how the player's values compare to everyone else remaining (bar width here represents the feature's coefficient). </figcaption>
</figure>


There are lots of stories like these! You can explore previous seasons on the dashboard too.

## What is important for winning?
You might be wondering which direction these features push, or what happens with the ones that got dropped. How does immunity win rate impact your odds of winning? Does steering the vote help? Rather than try to interpret these features from the main model above, I ran separate simpler models for each feature alone (controlling for stage in the game). That way I could also look at features that got dropped from the main model too. Here's a selection of the most interesting results (and remember, these are associational, not causal — the model can't differentiate between age itself making it hard to win vs the show casting older players into roles that don't win):

<figure>
  <img src="/blog/predicting-survivor/features.png" style="max-width: 500px;"/>
  <figcaption>How different features relate to winning. Confessional share is strongly associated with winning, and being in danger (more tribals receiving votes) is bad. For the ML people: I built this controlling for stage in the game, so this is the result of `won_season ~ < feature > + n`, where `n` is how many people are left. That's because the model predicts each individual's win probability, but probability naturally rises as the season goes on, and some of these features correlate with how far along a season is. The error bars come from 2,000 bootstrap resamples that resample whole seasons at a time, so they respect the fact that episodes within a season aren't independent. (I left out age here, since it's quadratic and that's confusing to include.) </figcaption>
</figure>

A lot of this tracks. People talk about a "winner's edit," or the fact that players who get shown more are more likely to win. Confessional share being so strongly associated with winning suggests that's real. To be clear, though, the edit isn't part of the game. The model is picking up the story the editors are telling after the fact. I included it as a feature since the goal is to predict a winner as a season airs, but it's probably not helpful for assessing strategy (unless you think being a good storyteller will help you win). 

Other things: being in danger often (more tribals where you receive votes, more votes against you recently) is negatively associated with winning. There might be some signal in the other features, although I'd note the confidence intervals are huge. "Being a returnee" and "having advantages," for instance, are maybe good.

Not included in a figure here, but the features that help or hurt your chances of being *eliminated* tell a different story. Holding advantages and not receiving votes are what most lower your odds of going home. Your team winning immunity in the early game is protective, while winning individual immunity later seems to maybe make you a threat and more likely to be a target for elimination. Those don't all line up with the features for winning (again, staying safe is not the same thing as winning).

## Comparing winners across seasons
Once I had the model running, I could start doing some cross-season analysis. How do different players, across different seasons, compare? 

I needed a fixed reference point to make things simpler, so I picked the finale. The rest of this section only looks at the ~5 people remaining heading into the last episode. 

The metric is the cumulative #1 count from earlier: the share of episodes a player was the model's top pick. It predicts the eventual winner about as well as the raw probabilities do (~40% at the finale vs a 20% baseline), and it's more stable across the season. For each winner, I take the margin between their share and the next-highest player's. It's not perfect (different cast sizes affect how easy it is to ever reach #1), but it gives a rough view.

In S50, for instance, Aubry was the #1 pick in 4 out of 13 episodes (31%), and Jonathan in 5 out of 13 episodes (38%). The margin is -7 points. I'm calling that Aubry's "dominance score." 

We can then rank winners by that score: 

<figure>
  <img src="/blog/predicting-survivor/expected_winners.png" style="max-width: 500px;"/>
  <figcaption>Dominance scores for every winner: the margin between the winner's share of #1 rankings and the next-highest player's, entering the finale. The result is something like a ranking of the "cleanest" wins in Survivor.</figcaption>
</figure>

This is pretty interesting! If I were to rank winners in my head by how cleanly they won their season, I think it wouldn't be too far from this. Boston Rob's unmatched S22 win is the most dominant one here. Tony's wild and strategic ride to an 8-1 victory in S28 is up there too. Some of the winners fans dismiss more are toward the bottom, like Natalie in S19 (a season dominated by the runner-up, Russell Hantz). But a low score could just mean a tough field. Parvati's famous S16 win is lowish middle of the pack here, maybe because she had to beat so many other great players.

## Biggest upsets

You can do the same thing for the non-winning players entering the final episode, which answers a different question: who were the biggest "upsets" in *Survivor*?


<figure>
  <img src="/blog/predicting-survivor/survivor_upsets.png" style="max-width: 500px;"/>
  <figcaption>Biggest upsets in Survivor. Same dominance margin, but for people entering the finale who didn't win.</figcaption>
</figure>

This generally also lines up with a lot of fan lore, which is reassuring. Russell Hantz in S19, who I mentioned above, is #1. Boston Rob in S8 is also high up, which is funny since his loss there has a bit of an asterisk; he led the game as half of a duo with Amber and proposed to her moments before she won, meaning he and the actual winner effectively took home the money as a pair. And, as we saw, Boston Rob later topped the most dominant winner analysis (above) in S22. 

## Wrapping up

There's a lot this model misses. I wish I had a measure of social chemistry, or of how much one player trusts another. Sometimes a jury votes for who they think is deserving, sometimes for who they like. There isn't much data to train on, and a lot of what feeds our sense of who will win is outside the scope of an ML model like this. 

That said, these analyses keep telling stories close to the narratives fans have been building for years. I made this for the obsessive *Survivor* fans like me who want to understand what's going on, and hopefully to give people some evidence for their intuitions so they can have more fun debating. 

Feel free to play around with it, use it when the new season airs, and let me know what you think!  

And, to give credit where it's due: thanks again to the [Recurse Center](https://www.recurse.com/) for giving me a great community to work on this with.

<details id="methodology-notes">
<summary>Methodology notes</summary>

For anyone who wants the actual ML details.

**Model building:**
Alongside logistic regression, I tested random forest, XGBoost, KNN, and a small neural net. Logistic regression performed the best. My guess is that's largely because there isn't much data and the more flexible models overfit. For feature selection I tried both forward selection and Lasso; forward selection produced better results, so I went with that (where the feature selection was done using an offline expanding-window temporal validation). I'm also using regularization to reduce overfitting. 

The model predicts each player's win probability independently and then normalizes across the remaining players in a given episode, so probabilities sum to 1 within each episode. 

**What seasons are used for training?**
For evaluating performance, I used temporal validation (I only trained on prior seasons to evaluate later ones). I went back and forth on this, since there's so little data that the results carry a lot of uncertainty, and leakage (what temporal validation protects against) probably isn't a huge deal here. Doing temporal validation shrinks my data even more. But returning players and strategy evolution made me think it was still better to do. 

However, outside of validation, I used LOSO (leave-one-season-out) to train the model. That applies to the cross-season analyses above, as well as the models behind the live app. Using LOSO for the app means you can look at what the model thinks about Season 1 with a model trained on every season after it. That feels fine to me. If you're looking at past seasons, I think you're already carrying knowledge of future strategy, so LOSO roughly mimics what you're doing in your head. If you're looking at a currently airing season, LOSO is the same as a temporal approach anyway, since every other season is already in the past.  

**Results:**
Across 521 episode predictions, the #1 pick is the winner 22.5% of the time against a 10.1% random baseline (that's the 2x I mentioned above), and the model places the eventual winner about 1.5 spots higher in the ranking than chance would. Episodes within a season aren't independent, so the confidence intervals come from a bootstrap that resamples whole seasons instead of individual episodes. The improvement over random survives that (95% CI: 0.8 to 2.3 spots).

**A note on probabilities and bias:** 
On average, calibration for the model is ok: of everyone it said had a 15% chance of winning, about 15% win, give or take a couple of points at the extremes. However, if you group players by rank instead, it looks less good. The model's #1 pick wins about 22% of the time, when they're predicted to win ~14%. Within one probability bucket, the favorites do better than predicted, but the non-favorites do worse, so the two average out.

I initially tried fixing this with temperature scaling (a single dial that stretches all the probabilities). But it didn't work here given the conditional structure of the problem. I think I could maybe calibrate the probabilities better with a different set of features that compare a player to their own cast, or a model that picks a winner from the whole cast at once instead of scoring everyone separately. Maybe that'll be the next version. For now, just know the model is maybe underconfident on its own pick.
</details>