# react-fast-children

Render children fast! Get faster diffing through cool data structures & algorithms.

Do you have a list with many children (50+) or a component that frequently rearranges children? This library is for you!

### Installation

```
npm install --save react-fast-children
```

### Usage

Simply wrap your children in the FastChildren component. It has no effect except for performance.

```
import { FastChildren } from 'react-fast-children'

...

return (
    <div className="list">

        <FastChildren>
            {manyChildren}
        </FastChildren>

    </div>
)
```

...and you're done!

---

## How does it work?

The idea is to render a list of children in a balanced tree of React fragments to improve performance.

When your list changes, we can apply the changes to an immutable data structure that corresponds to our fragment tree.

Then, React can skip over whole subtrees that didn't change using quick reference equality checks! Very neat.

### The tricky part...

Since our data structure mirrors the actual React render tree, there are some constraints.

In particular, **we cannot alter the parent hierarchy** because those nodes which have their parents changed will be forced to rerender. 

For example, if I move one child into a different React fragment, that will cause the corresponding DOM node to be destroyed and recreated in its new spot.

No problem, right? A child's parent cannot change, so we just need an **append-only** tree. (Setting aside the capability to remove children.)

And when the fragment tree is rendered, we have to get back our children **in order**.

And, finally, it has to be **balanced** as we add children to improve performance over a flat list. 

### Ordered, balanced, and append-only

What kind of tree satisfies our constraints?

It seems like a case of choose two out of three: A red-black tree can be ordered and balanced, but requires tree rotations that violate our append-only constraint. A simple ordered tree could become imbalanced as you keep appending nodes. And if you insert nodes in a different place to keep it balanced, you ruin the ordering.

This is where I went into data structure nerd mode. I became a shut-in for almost two weeks, muttering about child nodes under my breath.

It could happen to you.

### A solution!

The core idea is that when inserting a child, we should usually insert it directly at a slot that satisfies the ordering, but also have some chance of creating a whole new node and putting it inside that to grow the tree.

There are roughly two cases where you have a choice when inserting a child into a node:
1. When the ordering allows you to either insert in place or insert into an existing sibling node.
2. When inserting in place, you could either insert the child directly or create a new node and put it inside that.

If you vary this chance of creating a new node exponentially based on the number of direct children of the current node (decreasingly likely for 1, increasingly likely for 2), you can be confident that no node has too many direct children!

Specifically, for a list of size n, the number of direct children for a node is proportional to `O(log n)` with high probability.

I do not know of a proof that limits the depth of the tree, but in practice, I think it is also `O(log n)`. (See my balance tests!)

Thus the runtime complexity for inserts is <code>O(log<sup>2</sup> n)</code>, as you may have to iterate through `log(n)` children at each of the `log(n)` levels of the tree.

Finally, removing from the tree is very straight forward, you just find and delete the child, and optionally delete its parent node(s) if they are now empty.

## Diffing

The final piece of our puzzle is how to translate list changes into the insert and remove operations for our tree.

This is a solved problem with a fantastic implementation by https://github.com/kpdecker/jsdiff, based on [this paper (Myers, 1986)](http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.4.6927).

Because this algorithm computes the fewest possible removes and inserts, we destroy and create the fewest DOM nodes, which is a big win over React's implementation. 

The only caveat is in the worst case it can approach <code>O(n<sup>2</sup>)</code>, which would only be a problem if you have a huge list (n > 10000?) and also do a near-total shuffle. Frankly, you shouldn't be doing this in one step anyway, because it would take too long just to render that many DOM changes.

## Takeaways

#### 1. It's OK to have a lot of children

Computers have a lot of memory these days. Feel free to add hundreds or thousands of children to your lists.

The main constraint is you might not want to render them all at once because of the inital render cost.

#### 2. Randomized algorithms are 🔥🔥🔥

I'm partial to randomized algorithms because they can be so clean. 
Instead of keeping track of a bunch of state in order to make a choice, you can make a choice out of thin air! It's like giving your algorithms free will.

#### 3. You can create new stuff
Software is still a wide open frontier. If you find an interesting problem, definitely try your hand at cracking it. You might be surprised!

#### 4. Throne
Lastly, we built this library to optimize the list component that drives our app, Throne (I'm a co-founder!). If you want to work at the cutting edge of web tech, keep us in mind! Check out our site: https://throne.live