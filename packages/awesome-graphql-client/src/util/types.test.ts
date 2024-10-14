import { type DeepNullable } from './types'

type Expect<T extends true> = T
type Equal<X, Y> =
	(<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? true : false

describe('DeepNullable', () => {
	it('makes result field nullable', () => {
		type result = DeepNullable<{
			a: {
				b: number
				c: string[]
			}
		}>

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		type test = Expect<
			Equal<
				result,
				{
					a: {
						b: number | null
						c: (string | null)[] | null
					} | null
				}
			>
		>

		expect(true).toBe(true)
	})
})
