import { extractFiles } from './extractFiles'
import { isFile } from './isFile'

it("don't touch non-files", () => {
	const variables = {
		a: true,
		b: '',
		c: 0,
		d: [123, 456],
		e: null,
		f: undefined,
		g: {
			a: 123,
			b: 'str',
			date: new Date(),
		},
	}
	const { clone, files } = extractFiles({ query: '', variables }, isFile)
	expect(clone).toEqual({ query: '', variables })
	expect(files.size).toBe(0)
})

it('works with FileList', () => {
	const file1 = new File([''], 'a')
	const file2 = new File([''], 'b')
	const file3 = new File([''], 'c')

	const fileList = [file1, file2, file3]
	;(fileList as any).__proto__ = Object.create(FileList.prototype)

	const variables = {
		b: '',
		d: { a: fileList },
	}

	const { clone, files } = extractFiles({ query: '', variables }, isFile)
	expect(clone).toEqual({
		query: '',
		variables: {
			b: '',
			d: { a: [null, null, null] },
		},
	})

	expect(files).toEqual(
		new Map([
			[file1, ['variables.d.a.0']],
			[file2, ['variables.d.a.1']],
			[file3, ['variables.d.a.2']],
		] as any),
	)
})

it.each([
	['File', new File([''], '1.jpg'), new File([''], '2.jpg'), new File([''], '3.jpg')],
	['Blob', new Blob(), new Blob(), new Blob()],
	['Buffer', Buffer.from('a'), Buffer.from('b'), Buffer.from('c')],
	['Stream-like', { pipe: () => 'a' }, { pipe: () => 'b' }, { pipe: () => 'c' }],
])('extracts %s instances', (name, file1, file2, file3) => {
	const variables = {
		b: '',
		c: file1,
		d: { a: file1, b: file2, c: file1 },
		e: [file1, file2],
		f: file3,
		g: [{ a: file1, b: file2 }],
		h: [[file2, file3]],
	}

	const { clone, files } = extractFiles({ query: '', variables }, isFile)
	expect(clone).toEqual({
		query: '',
		variables: {
			b: '',
			c: null,
			d: { a: null, b: null, c: null },
			e: [null, null],
			f: null,
			g: [{ a: null, b: null }],
			h: [[null, null]],
		},
	})

	expect(files).toEqual(
		new Map([
			[
				file1,
				[
					'variables.c',
					'variables.d.a',
					'variables.d.c',
					'variables.e.0',
					'variables.g.0.a',
				],
			],
			[file2, ['variables.d.b', 'variables.e.1', 'variables.g.0.b', 'variables.h.0.0']],
			[file3, ['variables.f', 'variables.h.0.1']],
		] as any),
	)
})

describe('handles circular dependencies', () => {
	it('simple case', () => {
		const a: any = { foo: 'bar' }
		const b: any = { bar: 'foo' }
		a.b = b
		b.a = a

		expect(() => extractFiles({ a, b }, isFile)).toThrowError(
			'Circular dependency detected in a.b.a',
		)
	})

	it('complex case', () => {
		const b = {
			c: [{ d: '', e: {} }],
		}

		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		b.c[0]!.e = b

		expect(() => extractFiles({ b }, isFile)).toThrowError(
			'Circular dependency detected in b.c.0.e',
		)
	})

	it('no circular dependencies', () => {
		const a = {}
		const variables = {
			a,
			b: { b: a, c: a },
			c: [a, a, a],
		}

		const { clone, files } = extractFiles(variables, isFile)
		expect(files.size).toBe(0)
		expect(clone).toEqual(variables)
	})
})
