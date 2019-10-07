export type children_tree<T> = {
	children: (T | children_tree<T>)[]
	isChildNode: boolean[]
	count: number
	key: string
}

let counter = 0
const genKey = () => `children_tree_${counter++}`

type insertion<T> = { elem: T; index: number }

export function empty<T>(): children_tree<T> {
	return { children: [], isChildNode: [], count: 0, key: genKey() }
}

export function singleton<T>(elem: T): children_tree<T> {
	return { children: [elem], isChildNode: [false], count: 1, key: genKey() }
}

const chanceToAdd = 0.7

const shouldInsertFromParent = (listLength: number) =>
	Math.random() < chanceToAdd ** listLength

const shouldAddElem = (listLength: number) =>
	Math.random() < chanceToAdd ** listLength

function getInsertEndIndex<T>(
	insertions: insertion<T>[],
	numChildren: number,
	index: number,
	end: number,
	toChildIndex: number,
	offset: number,
) {
	while (index < end) {
		let insertIndex = insertions[index].index + offset
		if (insertIndex > 0) break

		// Quit if the next insertion should be added as a child of the parent.
		if (shouldInsertFromParent(numChildren))
			return index

		index++
		toChildIndex++
	}

	while (index < end) {
		let insertIndex = insertions[index].index + offset
		if (insertIndex > toChildIndex
			|| (insertIndex === toChildIndex
				// Quit if the next insertion should be added as a child of the parent.
				&& shouldInsertFromParent(numChildren))) break

		index++
		toChildIndex++
	}

	return index
}

function insertChild<T>(
	children: (T | children_tree<T>)[],
	isChildNode: boolean[],
	i: number,
	elem: T,
) {
	if (shouldAddElem(children.length)) {
		children.splice(i, 0, elem)
		isChildNode.splice(i, 0, false)
	}
	else {
		let newChildNode = singleton(elem)
		children.splice(i, 0, newChildNode)
		isChildNode.splice(i, 0, true)
	}
}

function insertHelper<T>(
	node: children_tree<T>,
	insertions: insertion<T>[],
	start: number,
	end: number,
	offset: number,
) {
	let { children, isChildNode, count, key } = node

	children = children.concat()
	isChildNode = isChildNode.concat()
	count += end - start

	let i = 0
	let childIndex = 0

	let index = start
	let insertIndex = insertions[index].index + offset
	while (index < end) {
		if (isChildNode[i]) {
			let childNode = children[i] as children_tree<T>
			if (insertIndex > childIndex + childNode.count) {
				childIndex += childNode.count
				i++
			}
			else {
				let newIndex = getInsertEndIndex(
					insertions,
					children.length,
					index,
					end,
					childNode.count,
					offset - childIndex,
				)

				if (newIndex > index) {
					let newChildNode = insertHelper(
						childNode,
						insertions,
						index,
						newIndex,
						offset - childIndex,
					)

					children[i] = newChildNode

					index = newIndex

					insertIndex = index < end
						? insertions[index].index + offset
						: Infinity
				}

				if (insertIndex === childIndex) {
					let insertion = insertions[index]
					insertChild(children, isChildNode, i, insertion.elem)

					index++

					insertIndex = index < end
						? insertions[index].index + offset
						: Infinity
				}
				else {
					childNode = children[i] as children_tree<T>
					if (insertIndex === childIndex + childNode.count) {
						childIndex += childNode.count
						i++
					}
				}
			}
		}
		else {
			if (insertIndex > childIndex) {
				childIndex++
				i++
			}
			else {
				let insertion = insertions[index]
				insertChild(children, isChildNode, i, insertion.elem)

				index++
				
				insertIndex = index < end
					? insertions[index].index + offset
					: Infinity
			}
		}
	}

	return {
		children,
		isChildNode,
		count,
		key,
	}
}

/**
 * Applies a list of insertions in order to a children tree. Returns the result
 * as a new tree.
 * 
 * Pre-condition: insertions sorted by index, in increasing order.
 * 
 * @param tree A children tree.
 * @param insertions A list of insertions, which each include an element and
 * the index to insert it at. Must be sorted in increasing order by index.
 * 
 * @returns A new children tree. Reference equality only perserved
 * for nodes that did not change.
 */
export function insert<T>(
	tree: children_tree<T>,
	insertions: { index: number; elem: T }[],
) {
	if (insertions.length === 0) return tree

	return insertHelper(
		tree,
		insertions,
		0,
		insertions.length,
		0,
	)
}

function removeChild<T>(
	children: (T | children_tree<T>)[],
	isChildNode: boolean[],
	i: number,
) {
	children.splice(i, 1)
	isChildNode.splice(i, 1)
}

function removeHelper<T>(
	node: children_tree<T>,
	indices: number[],
	start: number,
	offset: number,
) {
	let { children, isChildNode, key } = node

	let index = start
	let removeIndex = indices[index] + offset

	children = children.concat()
	isChildNode = isChildNode.concat()

	let i = 0
	let childIndex = 0
	while (i < children.length) {
		if (isChildNode[i]) {
			let childNode = children[i] as children_tree<T>
			if (removeIndex < childIndex + childNode.count) {
				let newChildNode = removeHelper(
					childNode,
					indices,
					index,
					offset - childIndex,
				)

				index += childNode.count - newChildNode.count

				if (newChildNode.count === 0)
					removeChild(children, isChildNode, i)
				else
					children[i] = newChildNode

				removeIndex = indices[index] + offset
			}
			else {
				childIndex += childNode.count
				i++
			}
		}
		else {
			if (removeIndex === childIndex) {
				removeChild(children, isChildNode, i)

				index++

				removeIndex = indices[index] + offset
			}
			else {
				childIndex++
				i++
			}
		}
	}

	return {
		children,
		isChildNode,
		count: childIndex,
		key,
	}
}

/**
 * Removes elements from each index in indices from the children tree, in order.
 * Returns the result as a new tree.
 *
 * Pre-condition: indices sorted in increasing order.
 * 
 * @param tree A children tree.
 * @param indices The list of each index of an element to remove from the tree.
 * Must be sorted in increasing order.
 * 
 * @returns A new children tree. Reference equality only perserved
 * for nodes that did not change.
 */
export function remove<T>(tree: children_tree<T>, indices: number[]) {
	if (indices.length === 0) return tree

	return removeHelper(
		tree,
		indices,
		0,
		0,
	)
}
