import _ from 'lodash'

import * as CT from '../children-tree'

type children_tree<T> = {
	children: (T | children_tree<T>)[]
	isChildNode: boolean[]
	count: number
}

function isNode(node: any) {
	return _.isObject(node)
		&& 'count' in node
		&& 'children' in node
		&& 'isChildNode' in node
}

function traverse<T>(
	root: children_tree<T>,
	f: (node: children_tree<T>, depth: number) => void,
	depth = 0,
) {
	let { children, isChildNode } = root
	f(root, depth)
	return children.forEach((child, i) => {
		if (isChildNode[i]) {
			traverse(child as children_tree<T>, f, depth + 1)
		}
	})
}

function toArray<T>(root: children_tree<T>): T[] {
	let { children, isChildNode } = root
	return _.flatMap(
		children,
		(child, i) => isChildNode[i]
			? toArray<T>(child as children_tree<T>)
			: child as T
	)
}

function checkSum<T>(root: children_tree<T>) {
	traverse(root, node => {
		let { children, isChildNode } = node
		let sum = 0
		for (let i = 0; i < children.length; i++) {
			if (isChildNode[i])
				sum += (children[i] as children_tree<T>).count
			else sum++
		}
		expect(sum).toBe(node.count)
	})
}

function checkIsChildNode<T>(root: children_tree<T>) {
	traverse(root, node => {
		let { children, isChildNode } = node
		for (let i = 0; i < children.length; i++) {
			expect(isChildNode[i])
				.toBe(isNode(children[i]))
		}
		expect(children.length).toBe(isChildNode.length)
	})
}

function checkInvariants<T>(root: children_tree<T>, expectedChildren?: T[]) {
	if (expectedChildren)
		expect(toArray(root)).toEqual(expectedChildren)

	checkIsChildNode(root)

	checkSum(root)
}

function getStats<T>(tree: children_tree<T>) {
	let elemCounts: number[] = []
	let nodeCounts: number[] = []
	let depths: number[] = []
	let maxChildren = 0

	traverse(tree, (node, depth) => {
		let elemCount = _.sum(node.isChildNode.map(isNode => isNode ? 0 : 1))
		let childrenCount = node.children.length

		elemCounts.push(elemCount)
		nodeCounts.push(childrenCount - elemCount)

		if (childrenCount > maxChildren) maxChildren = childrenCount

		_.range(elemCount).forEach(() => depths.push(depth + 1))
	})

	let averageDepth = _.sum(depths) / depths.length
	let averageElemChildren = _.sum(elemCounts) / elemCounts.length
	let averageNodeChildren = _.sum(nodeCounts) / nodeCounts.length
	let maxDepth = _.max(depths)

	return {
		averageDepth,
		averageElemChildren,
		averageNodeChildren,
		maxChildren,
		maxDepth,
		elemCount: tree.count,
		nodesCount: nodeCounts.length,
	}
}

describe('Children tree', () => {
	describe('insert', () => {
		it('should insert elem', () => {
			const single = CT.insert(
				CT.empty<string>(),
				[{ index: 0, elem: 'A' }]
			)
			let { key, ...withoutKey } = single
			expect(withoutKey).toEqual({
				count: 1,
				children: ['A'],
				isChildNode: [false],
			})
		})

		it('should insert multiple elems', () => {
			const empty = CT.empty<number>()
			const indices = [0, 1, 2]
			const insertions = indices.map(index => ({ index, elem: index }))

			const tree = CT.insert(empty, insertions)

			checkInvariants(tree, indices)
		})

		it('should insert elems at same index', () => {
			const empty = CT.empty<number>()
			const indices = [0, 1, 2]
			const insertions = indices.map(index => ({ index: 0, elem: index }))

			const tree = CT.insert(empty, insertions)

			checkInvariants(tree, [2, 1, 0])
		})

		it('should insert once in the middle', () => {
			const empty = CT.empty<number>()
			const indices = _.range(4)
			const insertions = indices.map(index => ({ index, elem: index }))

			const tree = CT.insert(empty, insertions)
			const tree2 = CT.insert(tree, [{ index: 2, elem: 1.5 }])

			checkInvariants(tree2, [0, 1, 1.5, 2, 3])
		})

		it('should insert multiple at same middle index', () => {
			const empty = CT.empty<number>()
			const elems = _.range(10)
			const insertions = elems.map(index => ({ index, elem: index }))
			const tree = CT.insert(empty, insertions)

			let middleRange = _.range(5).map(index => ({
				index: 6,
				elem: 5 + (index + 0.5) / 5,
			}))

			const tree2 = CT.insert(tree, middleRange.concat().reverse())

			checkInvariants(tree2, [
				..._.range(6),
				...middleRange.map(({ elem }) => elem),
				..._.range(6, 10),
			])
		})

		it('should insert multiple at same middle index bigly', () => {
			const empty = CT.empty<number>()
			const indices = _.range(100)
			const insertions = indices.map(index => ({ index, elem: index }))
			const tree = CT.insert(empty, insertions)

			let middleRange = _.range(25).map(index => ({
				index: 51,
				elem: 50 + (index + 0.5) / 25,
			}))

			const tree2 = CT.insert(tree, middleRange.concat().reverse())

			checkInvariants(tree2, [
				..._.range(51),
				...middleRange.map(({ elem }) => elem),
				..._.range(51, 100),
			])
		})

		it('should insert in the middle bigly', () => {
			const empty = CT.empty<number>()
			const indices = _.range(100)
			const insertions = indices.map(index => ({ index, elem: index }))
			const tree = CT.insert(empty, insertions)

			let middleRange = _.range(25).map(index => ({
				index: 51 + index,
				elem: 50 + (index + 0.5) / 25,
			}))

			const tree2 = CT.insert(tree, middleRange)

			checkInvariants(tree2, [
				..._.range(51),
				...middleRange.map(({ elem }) => elem),
				..._.range(51, 100),
			])
		})

		it('should handle randomized small insertions', () => {
			_.range(200).forEach(() => {
				let indices = _.range(5)
					.map(i => Math.floor(Math.random() * (i + 1)))
					.sort()

				let insertions = indices.map(index =>
					({
						index,
						elem: index
					})
				)

				let tree = CT.empty<number>()
				tree = CT.insert(tree, insertions)

				try {
					checkInvariants(tree)
					expect(toArray(tree).sort()).toEqual(indices)
				}
				catch (e) {
					console.log('expected', insertions.map(({ elem }) => elem))
					console.log('actual  ', toArray(tree).sort())
					console.log(tree)
					console.log(tree.children[0])
					console.log(getStats(tree))
					throw e
				}
			})
		})

		it('should handle random insertions', () => {
			const elems = _.range(20)
			const insertions = elems.map(index => ({ index, elem: index.toString() }))

			let tree = CT.empty<string>()
			tree = CT.insert(tree, insertions)

			let insertionsList =
				_.range(100).map(i =>
					_.sortBy(
						_.range(Math.ceil(Math.random() * 10)).map(j =>
							({
								index: Math.floor(Math.random() * (elems.length + i + j + 1)),
								elem: `${i}.${j}`
							})), ({ index }) => index)
				)

			insertionsList.forEach(insertions => {
				tree = CT.insert(tree, insertions)
			})

			checkInvariants(tree)

			let elemSet = new Set(toArray<string>(tree))
			let count = 0
			for (let i = 0; i < insertionsList.length; i++) {
				for (let j = 0; j < insertionsList[i].length; j++) {
					expect(elemSet.has(`${i}.${j}`))
					count++
				}
			}
			expect(tree.count).toBe(count + insertions.length)
		})
	})

	describe('remove', () => {
		it('should remove elem', () => {
			let single = CT.singleton('A')
			let result = CT.remove(single, [0])

			let { key, ...resultWithoutKey } = result
			expect(resultWithoutKey).toEqual({
				count: 0,
				children: [],
				isChildNode: [],
			})
		})

		it('should remove multiple elems', () => {
			let elems = [0, 1, 2]
			let insertions = elems.map(index => ({ index, elem: index }))
			let tree = CT.empty<number>()
			tree = CT.insert(tree, insertions)

			tree = CT.remove(tree, [0, 1])

			checkInvariants(tree, [1])
		})

		it('should remove multiple from same index', () => {
			let elems = _.range(10)
			let insertions = elems.map(index => ({ index, elem: index }))
			let tree = CT.empty<number>()
			tree = CT.insert(tree, insertions)

			tree = CT.remove(tree, [3, 3, 3, 3, 3])

			checkInvariants(tree, [0, 1, 2, 8, 9])
		})

		it('should remove random indices', () => {
			let elems = _.range(20)
			let insertions = elems.map(index => ({ index, elem: index }))
			let tree = CT.empty<number>()
			tree = CT.insert(tree, insertions)

			let i = 0
			while (tree.count > 0) {
				let randIndex = Math.floor(Math.random() * tree.count)
				tree = CT.remove(tree, [randIndex])

				checkInvariants(tree)

				i++
				if (i > elems.length) throw 'fail'
			}

			expect(i).toBe(elems.length)
		})
	})

	describe('balance', () => {
		it('should be balanced when inserting in order', () => {
			let tree = CT.empty<number>()

			let insertions =
				_.range(1000).map(i => {
					return ({
						index: i,
						elem: i
					})
				})

			tree = CT.insert(tree, insertions)

			checkInvariants(tree, insertions.map(({ elem }) => elem))

			let { averageDepth } = getStats(tree)
			expect(averageDepth).toBeLessThan(10)
		})

		it('should be balanced when inserting at beginning', () => {
			let tree = CT.empty<number>()

			let insertions =
				_.range(1000).map(i => {
					return ({
						index: 0,
						elem: i
					})
				})

			tree = CT.insert(tree, insertions)

			checkInvariants(tree, insertions.map(({ elem }) => elem).reverse())

			let { averageDepth } = getStats(tree)
			expect(averageDepth).toBeLessThan(10)
		})

		it('should be balanced after random singleton insertions', () => {
			let indices =
				_.range(1000)
					.map(i => Math.floor(Math.random() * (i + 1)))

			let insertions = indices.map(index =>
				({
					index,
					elem: index
				})
			)

			let tree = CT.empty<number>()
			for (let insertion of insertions)
				tree = CT.insert(tree, [insertion])

			checkInvariants(tree)
			expect(_.sortBy(toArray(tree), i => i)).toEqual(_.sortBy(indices, i => i))

			let { averageDepth } = getStats(tree)
			expect(averageDepth).toBeLessThan(10)
		})

		it('should be balanced after random insertions of random length', () => {
			const elems = _.range(20)
			const insertions = elems.map(index => ({ index, elem: index }))

			let tree = CT.empty<number>()
			tree = CT.insert(tree, insertions)

			let insertionsList =
				_.range(100).map(i =>
					_.sortBy(
						_.range(Math.ceil(Math.random() * 10)).map(j => {
							let index = Math.floor(Math.random() * (elems.length + i + j + 1))
							return ({
								index,
								elem: index
							})
						}), ({ index }) => index)
				)

			insertionsList.forEach(insertions => {
				tree = CT.insert(tree, insertions)
			})

			checkInvariants(tree)

			let { averageDepth } = getStats(tree)
			expect(averageDepth).toBeLessThan(10)
		})

		it('should be balanced after repeated removing and inserting', () => {
			let indices = _.range(100)
			let insertions = indices.map(index =>
				({
					index,
					elem: index
				})
			)

			let tree = CT.empty<number>()
			tree = CT.insert(tree, insertions)

			let randIndex = () => Math.floor(Math.random() * indices.length)

			_.range(1000).forEach(() => {
				tree = CT.remove(tree, [randIndex()])
				tree = CT.insert(tree, [{ index: randIndex(), elem: 0 }])
			})

			checkInvariants(tree)
			expect(tree.count).toBe(indices.length)

			let { averageDepth } = getStats(tree)
			expect(averageDepth).toBeLessThan(10)
		})
	})
})
