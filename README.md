# react-fast-children
Render children fast! Faster diffing through cool data structures & algorithms.

Use case: Improve performance of a list with many children or a component that rearranges children.

Example:

```
npm install --save react-fast-children
```

```
import { FastChildren } from 'react-fast-children'

...

return (
	<FastChildren>
		{manyChildren}
	</FastChildren>
)
```
