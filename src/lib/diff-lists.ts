import * as Diff from 'diff'

/**
 * Calculates the series of removes followed by inserts to transform
 * prevList to currentList.
 */
export const diffLists = (prevList: any[], currentList: any[]) => {
	let diff = Diff.diffArrays(prevList, currentList)

	let removes: number[] = []
	let inserts: number[] = []

	let removeIndex = 0
	let currentIndex = 0
	for (let { added, removed, value } of diff) {
		let count = value.length

		if (removed) {
			for (let i = 0; i < count; i++)
				removes.push(removeIndex)
		}
		else if (added) {
			for (let i = 0; i < count; i++)
				inserts.push(currentIndex + i)

			currentIndex += count
		}
		else {
			removeIndex += count
			currentIndex += count
		}
	}

	return { removes, inserts }
}
