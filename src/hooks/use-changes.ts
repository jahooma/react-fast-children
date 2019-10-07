import { diffLists } from '../diff-lists'
import { usePrevious } from './use-previous'

export function useChanges<T extends JSX.Element | string>(children: T[]) {
	let keys = children.map(child => {
		if (typeof child === 'string') return child

		let key = (child as any).key
		if (key == null)
			throw new Error('Invalid key for child')

		return key
	})

	let prevKeys = usePrevious(keys)

	let { removes, inserts } = diffLists(prevKeys || [], keys)

	return {
		removes,
		inserts: inserts.map(
			index => ({ index, elem: children[index] }))
	}
}
