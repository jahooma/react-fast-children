import React, { memo } from 'react'

import { children_tree } from '../lib/children-tree'

export const ChildrenTree = memo((props: {
	tree: children_tree<JSX.Element>
}) => {
	let { children, isChildNode } = props.tree

	return <>
		{children.map((child, i) => {
			if (isChildNode[i]) {
				let node = child as children_tree<JSX.Element>
				return <ChildrenTree key={node.key} tree={node} />
			}
			return child
		})}
	</>
})

ChildrenTree.displayName = 'ChildrenTree'