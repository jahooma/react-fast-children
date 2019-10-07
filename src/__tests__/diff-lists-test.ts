import { diffLists } from '../lib/diff-lists'

describe('diffLists', () => {
	it('should diff', () => {
		let { removes, inserts } = diffLists(
			['A', 'B', 'C', 'D', 'E'],
			['B', 'A', 'C', 'D', 'E', 'F']
		)

		expect(removes).toEqual([1])
		expect(inserts).toEqual([0, 5])
	})
})
