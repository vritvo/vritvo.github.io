---
title: "Solving Semantle With the Wrong Embeddings"
description: "A robust solver for the game Semantle."
pubDate: 2026-03-16
---

In my last [post](https://victoriaritvo.com/blog/semantle-solver/), I wrote about a [solver](https://github.com/EthanJantz/semantle/) for [Semantle](https://semantle.com/) (the word game where guesses are scored based on semantic similarity to a hidden target word) that [Ethan Jantz](https://jantz.website/) and I built while at the [Recurse Center](https://www.recurse.com/).

If your goal is (as ours was) to solve Semantle in as few guesses as possible, that solver works great. But it requires knowing exactly what embedding model the game itself is using, and the exact cosine similarities between every word in the vocabulary. After writing the post, a former colleague from grad school, [Daniel Vitek](https://danielv.tech/), reached out with an idea for a solver that doesn't rely on that knowledge, and instead only uses information about which guesses are better than others. 

It takes more guesses to win, but it's more robust, in that it works even with a different underlying embedding model than the game uses. To me, it also feels more aligned with what it's actually like to play Semantle. Daniel shared a [notebook](https://colab.research.google.com/drive/1zBht4wWCAsbUR5PYIQxy_8ZAWnhHoFK5?usp=sharing) showing how it works, which I adapted into [this](https://github.com/vritvo/semantle-agnostic) solver. 

## Which guess is closer? 

Let's say I'm playing Semantle and guess 1 is "biology" (which scored 26.03) and guess 2 is "philosophy" (which scored 3.09). The most important piece of information I receive from the scores the game returns is the relative ordering: "biology" (guess 1) is closer to the target word than guess 2 ("philosophy"). That would make sense if the hidden target word were "medical." For this solver, that relative rank is the core of what we need.

Here, guess 1 corresponds to embedding $g_1$, guess 2 corresponds to embedding $g_2$, and the target corresponds to embedding $t$. We can imagine a boundary in embedding space containing all points that are equally similar to both guesses (i.e. words that make the same angle with $g_1$ as with $g_2$). On one side of that boundary, $g_1$ would be more aligned with $t$; on the other, $g_2$ would be. Since Semantle told us $g_1$ was closer, the target must live on the $g_1$ side of that boundary. 

Here's what that would look like geometrically, pretending we're only dealing with three dimensions rather than 300 for simplicity:


<figure>
  <img src="/blog/robust-semantle-solver/solver_two_guesses.png" style="max-width: 500px;"/>
  <figcaption>A single ranking comparison between two guesses splits the embedding space in two. All vectors on one side of the plane are more similar to g₁ than g₂. Guess 1 is better, so only those candidates could still be the target.</figcaption>
</figure>

### In linear algebra terms:
To reframe in linear algebra terms: Assuming these are unit vectors, if $g_1$ beats $g_2$, that means 

$$
t \cdot g_1 > t \cdot g_2
$$
which rearranges to

$$
t \cdot (g_1 - g_2) > 0
$$

By definition, this means all potential candidates for $t$ must lie in the half-space pointing from $g_2$ toward $g_1$ (that is, the half-space whose normal vector is $(g_1 - g_2)$). That's what the above diagram shows. 

## Turning rankings into filters

Each ordered comparison of two guesses immediately lets us eliminate roughly half of the embedding sphere. That gives us one geometric constraint for each guess (once we have at least two guesses to compare). For every new guess after that, we then test whether it's even a possible target given the constraints we've racked up so far. 

Here's what I mean: after guess 1 and guess 2, we know that the target word *must* be on the correct side of the sphere. So, if a third guess lies on the wrong side, it would have produced different rankings for guess 1 and guess 2, and we can eliminate it without having to officially submit it to Semantle as a guess. In the figure above, any guess lying on the "dark side" of the sphere is immediately rejected. 

Note, though, that after several guesses we accumulate many of these constraints, so the number of comparisons goes up. If $g_1$ beats $g_2$, then we have one half-sphere restriction we have to check. If $g_2$ beats $g_3$, we add another constraint to the list for comparison. And so on. 

So, as we add more guesses, we accumulate more relative rankings, and in the process, more and more half-spheres, letting us slowly close in on the target. Here's how the sphere looks after two constraints: 

<figure>
  <img src="/blog/robust-semantle-solver/solver_three_guesses.png" style="max-width: 500px;"/>
  <figcaption>Each additional ranking introduces more half-space constraints. Any new guess has to satisfy all constraints simultaneously. The target must be in the region where the allowed halves overlap.</figcaption>
</figure>


With $n$ guesses, we get roughly $n(n-1)/2$ pairwise comparisons. A lot of them are redundant by transitivity, but even so, it's enough to quickly shrink the region where the target is allowed to be.

Here's the filtering step: 

```python
# Guesses sorted from best -> worst, and converted to unit vectors  
guess_vecs = np.array([vec(g) for g in ordered_guesses]) # shape: (n_guesses, d)  
  
# Build all ordered index pairs (i, j) with i < j (meaning: guess i ranked above guess j)  
better_idx, worse_idx = np.triu_indices(len(guess_vecs), k=1)  
  
# For each pair, form the constraint direction (g_i - g_j).  
# A candidate target t must satisfy (g_i - g_j) · t > 0 for every observed ordering.  
constraint_dirs = guess_vecs[better_idx] - guess_vecs[worse_idx] # (n_constraints, d)  
  
# Check every candidate against every constraint in one shot  
scores = constraint_dirs @ candidate_vecs.T # (n_constraints, n_candidates)  
still_valid = np.all(scores > 0, axis=0)
```

That's basically it. We just keep the words that agree with each of the relative rankings observed so far. 

## How well does it work? 
Even without using the exact numeric cosine similarities, this solver finds the answer in about 10-15 guesses. That's pretty good. 

The most interesting thing about this solver, however, is not its efficiency, but its robustness —namely, what happens when the embeddings used to build the constraints come from a different model than the one Semantle uses to generate its cosine similarity scores.

Many relative relationships between words are consistent across embedding models. Even when models disagree about the specific values, they tend to agree on overall semantic ordering (e.g. "medical" should generally be closer to "biology" than to "philosophy," regardless of what model we're using). Daniel’s [notebook](https://colab.research.google.com/drive/1zBht4wWCAsbUR5PYIQxy_8ZAWnhHoFK5?usp=sharing) showed this by scoring every word in a second model's vocabulary by the number of constraints it satisfies, and demonstrating that the target word ranks in the top 20 out of 155K candidates.

I tried turning this into a full solver by running a Semantle clone using the **Google News word2vec embeddings** (which is what real Semantle uses), while making the half-space constraints using **all-MiniLM-L6-v2**. 

Now, the hard-constraint approach above doesn't work here, because at some point, the two models may disagree on relative rankings, and then the solver will eliminate the target. (I tried various methods to prevent the target from being eliminated in these situations, but I wasn't able to overcome this fundamental problem). So, after a suggestion from fellow Recurser Jack Heard, I switched from a hard binary constraint to a probabilistic approach where no words are ever eliminated. 

This way, each constraint adjusts every candidate word's probability. If a candidate satisfies a constraint, then, effectively, its probability goes up. If it violates the constraint, its probability goes down, but never to zero. 

(More precisely: I replaced the step function on $candidate \cdot (g_1 - g_2) > 0$ with a sigmoid, and combined probabilities across all constraints by summing their log-sigmoid scores. All scores decrease with each constraint, but violating words decrease far more; after renormalization, the better candidates rise in relative probability.) 

The solver then samples its next guess in proportion to these probabilities. Note that the target never gets eliminated anymore, it just becomes more (or less) likely to be sampled next with each additional constraint. What we care about is how long it takes to reach the target. 

I found it takes between 100-200 guesses to find the target this way. That's slower, but given it's an entirely different embedding space, I find it pretty impressive! I don't know the stats on the average number of tries to solve Semantle, and at the risk of revealing a little about my own (in)ability to play this game — that seems not far off from how a human might play. 

I especially love how the words clearly trend toward the right semantic region. For instance, here's one run where the target word is "medical":


```python
=== run 1 (91 guesses) ===  
Round 1: 'immore' (sim=0.1472) (need 2 guesses for constraints)  
Round 2: 'rectangular' (sim=-0.0178) (target rank: 105405)  
Round 3: 'downlinks' (sim=0.0668) (target rank: 101912)  
Round 4: 'knoll' (sim=0.0248) (target rank: 91889)  
Round 5: 'rearward' (sim=-0.0028) (target rank: 95180)  
Round 6: 'canisters' (sim=0.0700) (target rank: 91097)  

...  

Round 86: 'anesthesiologists' (sim=0.3832) (target rank: 28)  
Round 87: 'anaesthesiology' (sim=0.5136) (target rank: 24)  
Round 88: 'anesthesiologist' (sim=0.4324) (target rank: 23)  
Round 89: 'surgeon' (sim=0.4510) (target rank: 23)  
Round 90: 'surgeries' (sim=0.4234) (target rank: 21)  
Round 91: 'medical' (sim=1.0000) (target rank: 18)

```

Notice the difference between the beginning and the end. The final words (e.g. "anesthesiologist," "surgeon") are much closer semantically to "medical" than the starting words (e.g. "rectangular," "canisters"). 
## A more human-like guesser? 

We obviously aren't running Google News word2vec in our heads when we play Semantle. But we seem to carry some kind of internal representation of semantic relationships (which words feel closer or farther from each other) in our minds. That's what makes Semantle playable at all. 

This solver uses nothing else besides that ranking information, despite how weak a signal it seems. And yet it still gradually moves in the right direction, from "rectangular" to "anesthesiologist" to, finally, "medical." Guided by just that hotter vs colder signal, I can see it circling the target the same way I do when I get close to solving Semantle, when I think "I know it has something to do with a hospital setting, I just can't name it yet." 

Obviously, this isn't an exact model of cognition, and I don't know the actual approach our brains take. But even still, I think it's showing something familiar. It might be a good picture of how we navigate through a semantic space we don't have access to. 
