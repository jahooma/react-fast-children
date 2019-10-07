import { useRef } from 'react'

import * as CT from '../children-tree'

export const useChildrenTree = <T>(
	changes: {
		removes: number[]
		inserts: { index: number; elem: T }[]
	}
) => {
	const childrenTree = useRef(CT.empty<T>())

	let { removes, inserts } = changes

	childrenTree.current =
		CT.remove(childrenTree.current, removes)

	childrenTree.current =
		CT.insert(childrenTree.current, inserts)

	return childrenTree.current
}
