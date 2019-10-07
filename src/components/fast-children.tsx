import React, { memo } from 'react'

import { useChildrenTree } from '../hooks/use-children-tree'
import { useChanges } from '../hooks/use-changes'
import { ChildrenTree } from './children-tree'

/**
 * Render your children fast! Use an immutable, balanced children tree so
 * React's diffing algorithm can skip over most children except for what
 * changed.
 * 
 * When your children do change, use diffjs to calculate the minimal updates
 * to the tree. Instead of destroying and recreating many or most DOM nodes
 * after reordering children, this guarantees the fewest children possible will
 * be recreated!
 */
export const FastChildren = memo((props: {
	children: JSX.Element[]
}) => {
	let changes = useChanges(props.children)

	let tree = useChildrenTree(changes)

	return <ChildrenTree tree={tree} />
})