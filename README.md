# react-fast-children

Render children fast! Improve on React's diffing through cool data structures & algorithms.

Do you have a list with many children (50+) or a component that frequently rearranges children? This library is for you!

### Installation

```
npm install --save react-fast-children
```

### Usage

Simply wrap your children in the FastChildren component.

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

### Things to keep in mind

- Each child of FastChildren must specify a 'key' prop
- Children are only rendered once (unless you change the key!)

We hope you find it easy enough to wrap lists in your React app, and achieve performance gains!

---

### How does it work?

Read our post about the making of this package! (Link to be added once it's published!)

### Addendum
This package was built for our chat app [Throne](https://throne.live). We use it to load 500+ chats in a list, while supporting further live insertions by large crowds!

Have a comment or suggestion? Join us to chat about react-fast-children (on a site powered by it!): https://throne.live/ReactFastChildren