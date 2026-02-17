---
title: "A Solver for Semantle"
description: "A solver for the game Semantle."
pubDate: 2026-02-17
---


[Semantle](https://semantle.com/) is a Wordle game variant. But instead of scoring guesses based on lexical similarity like its predecessor, it scores them based on *semantic* similarity.

Here's a screenshot from a game I played recently, ordered by similarity to the correct answer.

<figure>
  <img src="/blog/semantle-solver/semantle_game.png" alt="Screenshot of a Semantle game" style="max-width: 300px;"/>
  <figcaption>Screenshot of a Semantle game</figcaption>
</figure>

I initially guessed "philosophy," which was very far from the correct answer (similarity score of 6.02). After several more guesses I got lucky with "biology" (27.55) as my 8th guess, which pointed me toward more science-y words. Eventually I realized the answer had something to do with a hospital setting (yes, yes, I could have gotten there faster after "biology"). I landed on the right word "medical" as my 52nd guess. 

To be honest, that's a pretty good round for me. I've had games last more than twice that before giving up. If you've played before, you know Semantle is *hard*. But it is solvable, generally by gradually honing in on words that give higher similarity scores, and moving away from words that give lower scores.

[Ethan Jantz](https://jantz.website/) and I wondered whether we could do better algorithmically. This post describes a simple [solver](https://github.com/EthanJantz/semantle/) we made while at the [Recurse Center](https://www.recurse.com/) that reliably finds the answer in around 3 guesses. 

## What information does the game give you? 
Semantle uses word embeddings — numerical vector representations of word meanings — to represent words. It uses [Google News word2vec](https://drive.google.com/file/d/0B7XkCwpI5KDYNlNUTTlSS21pQmM/view?resourcekey=0-wjGZdNAUop6WykTtMip30g), which represents each word as a 300-dimensional vector. It then measures how close your guess is to the target word using the cosine similarity between the guess word embedding ($g$) and the target word embedding ($t$). That similarity score is the feedback you get with each guess. 

The difficulty of playing Semantle comes from how little information a single cosine similarity provides. It effectively tells you whether your guess is "hot" or "cold," but not which direction you should move. As a result, you have to combine feedback from multiple guesses, mentally "triangulating" where the answer might be in semantic space. 

## Can we solve for the embedding of the target word? 

If you want to skip ahead to how we implemented the solver, you can jump to the next section. But first, I'm going to digress briefly to discuss why solving for the target word directly isn't practical. 

A natural first idea might be to treat each guess as a clue to the hidden vector and try to combine those clues to recover it directly. In embedding space, that translates to solving for the target vector using a system of linear equations. 

The similarity score the game returns with each guess is: 

$$
\text{similarity} = \cos(\theta) = \frac{g \cdot t}{\lVert g\rVert \,\lVert t\rVert}
$$

If we assume embeddings are normalized, this means similarity is equivalent to the dot product, $g \cdot t$. For each guess, that gives you one linear equation involving all 300 unknown components of $t$.

In general, you need at least as many independent equations as unknowns to pin down a unique solution to a system of linear equations. Which means we need at least 300 independent guesses before we could recover $t$ and look up the nearest word in the vocabulary to find the target. 

Semantle is a hard game, but 300 guesses isn't good enough to beat playing it as a human (or at least, I'd like to think so). So instead of trying to solve for the target embedding directly, we took advantage of the geometry of the cosine similarity and used a filtering approach that turned out to be surprisingly effective.

## How we built the solver

Geometrically, when we guess a word and get back a similarity score, that means the target word must lie somewhere on a surface of constant cosine similarity to the guess. On the unit sphere of embeddings, this surface corresponds to a ring of points that make the same angle with $g$. 

<figure>
  <img src="/blog/semantle-solver/embedding_sphere.png"/>
  <figcaption>A cosine similarity score defines a ring on the unit sphere of embeddings. The true target must lie somewhere on this ring.</figcaption>
</figure>

That makes each guess a very strong filter. Only words whose similarity to our guess is equal to the returned similarity score could still be the target. We can make use of that fact to build a solver.

### The elimination approach

The solver works like this: 

It keeps a list of all possible target words. Initially, this list contains every word in the embedding vocabulary for **GoogleNews-vectors-negative300** *(In theory, this could be restricted further since Semantle says it chooses its target from a list of the 5,000 most popular words in English. But even starting with several million candidates, this solver works just fine.)* 

To run this solver, we also built a clone of Semantle using their same embeddings so we could get immediate similarity scores.

For each round, the solver: 

1) Picks a random candidate word as a guess
2) Asks Semantle for the similarity score between $g$ and $t$
3) Computes the similarity score between $g$ and **every remaining candidate word**
4) Reduces the candidate list to only those that have the reported cosine similarity (within some small tolerance)
5) Repeats 1-4 until only one candidate word is left

*Note 1: For those who are familiar with this topic, we actually implemented this using cosine distance rather than cosine similarity, but the logic is effectively the same.*

*Note 2: We chose guesses at random for simplicity, but in principle, you could probably do better than random.*


In a visual diagram, that can be represented like this: 
<figure>
  <img src="/blog/semantle-solver/embedding_sphere_two_guesses.png"/>
  <figcaption>Each guess constrains the possible candidates on the unit embedding sphere. After one guess (blue), few candidate words remain. After a second guess (purple), the intersection leaves even fewer viable candidates.</figcaption>
</figure>

In code, that filtering step looks something like this: 

```python
while len(potential_words) > 1:
	
	# step 1: make a guess
	g = random.choice(potential_words)

	# step 2: ask Semantle for score
	s_target = get_similarity_from_game(g) 

	# step 3: similarity from g to every remaining candidate
	distances = word_vectors.distances(g, other_words=potential_words)
	similarities = 1.0 - distances # cosine similarity = 1 - cosine_distance

	# step 4: keep only words w such that sim(g,w) matches s_target
	temp_potential_words = []

	for i in range(len(potential_words)):
		w = potential_words[i]
		s = similarities[i]
		if abs(s - s_target) < tolerance:
			temp_potential_words.append(w)
	potential_words = temp_potential_words

# one word left
answer = potential_words[0]

```

## Why does this work so quickly?

Although word embedding space is 300-dimensional, the vocabulary itself is sparse within that space. As a result, each cosine similarity constraint is highly restrictive. After just one or two guesses, the set of words that lie at the right distance shrinks dramatically. That makes the filtering strategy super effective.

For example, here's a sample run: 
(*We filter within a tolerance of 0.0001, which corresponds to the four-decimal-place precision of real Semantle's cosine similarity scores.*)


```python
── Guess 1: countryside ──
  cosine similarity: 0.023168  (±0.0001)
  candidates searched: 3,000,000  ->  remaining: 3,296

── Guess 2: levelization ──
  cosine similarity: 0.097055  (±0.0001)
  candidates searched: 3,296  ->  remaining: 3

── Guess 3: Skrzynski ──
  cosine similarity: 0.005881  (±0.0001)
  candidates searched: 3  ->  remaining: 1
  
Answer: medical 
```


It’s worth noting that the guesses don’t need to “trend” toward the correct answer the way a human player’s guesses would. “Countryside,” “levelization,” and “Skrzynski” have nothing to do with “medical.” The solver isn’t walking a recognizable path.

And yet, in a sense, humans and this solver are both "honing in" on the answer, just very differently. In a way, we as humans are doing something gradient-descent-like: every time we make a guess we are nudged towards the target, and we take small and meaningful steps toward it through semantic space. The process is local, intuitive, and guided by meaning. 

The solver is also honing in, but it's doing it globally rather than locally. Instead of taking tiny steps toward the target, it takes huge jumps that it knows are exactly right, while slicing away vast swaths of impossible words with each guess. It's not actually moving in any kind of meaningful way closer to "medical," it's just shrinking the universe of possible answers until "medical" is the only possible choice remaining. 

I find that pretty cool: that the same embedding space can be something you navigate by meaning, or something you carve up by geometry. But either way, you get to the same place. 