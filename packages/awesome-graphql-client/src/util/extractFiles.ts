interface FileList {
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileList/length) */
	readonly length: number
	/** [MDN Reference](https://developer.mozilla.org/docs/Web/API/FileList/item) */
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	item(index: number): File | null
	[index: number]: File

	prototype: FileList
	new (): this
}

declare global {
	const FileList: FileList | undefined
}

const isIterable = (value: unknown): value is unknown[] | FileList =>
	Array.isArray(value) || (typeof FileList !== 'undefined' && value instanceof FileList)

// https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null) {
		return false
	}

	const prototype = Object.getPrototypeOf(value)
	return (
		(prototype === null ||
			prototype === Object.prototype ||
			Object.getPrototypeOf(prototype) === null) &&
		!(Symbol.toStringTag in value) &&
		!(Symbol.iterator in value)
	)
}

/**
 * Parses object and detects files according to GraphQL Upload Spec:
 * https://github.com/jaydenseric/graphql-multipart-request-spec
 *
 * @param operation GraphQL-operation
 * @param isUpload predicate for checking if value is a file
 */
export function extractFiles<TUpload>(
	operation: Record<string, unknown>,
	isUpload: (value: any) => value is TUpload,
): {
	clone: Record<string, any>
	files: Map<TUpload, string[]>
} {
	const clone: Record<string, any> = {}
	const files = new Map<TUpload, string[]>()
	const stackSet = new Set<any>()

	function extract(paths: string[], value: unknown, target: any): void {
		const currentPath = paths.at(-1)!

		if (isUpload(value)) {
			let saved = files.get(value)
			if (!saved) {
				saved = []
				files.set(value, saved)
			}
			saved.push(paths.join('.'))
			target[currentPath] = null
		} else if (isIterable(value) || isPlainObject(value)) {
			if (stackSet.has(value)) {
				throw new Error(`Circular dependency detected in ${paths.join('.')}`)
			}
			stackSet.add(value)

			let newObj: unknown[] | Record<string, unknown>

			if (isIterable(value)) {
				newObj = []
				// eslint-disable-next-line unicorn/no-for-loop
				for (let i = 0; i < value.length; i++) {
					extract([...paths, String(i)], value[i], newObj)
				}
			} else {
				newObj = {}
				for (const [key, item] of Object.entries(value)) {
					extract([...paths, key], item, newObj)
				}
			}
			target[currentPath] = newObj
			stackSet.delete(value)
		} else {
			target[currentPath] = value
		}
	}

	for (const [key, item] of Object.entries(operation)) {
		extract([key], item, clone)
	}

	return { clone, files }
}
