export type StreamLike = { pipe: (...args: unknown[]) => unknown }

/** Uploadable file */
export type FileUpload = File | Blob | Buffer | StreamLike | Promise<unknown>

/**
 * Duck-typing if value is a stream
 * https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
 *
 * @param value incoming value
 */
const isStreamLike = (value: any): value is StreamLike =>
	typeof value === 'object' && value !== null && typeof value.pipe === 'function'

/**
 * Duck-typing if value is a promise
 *
 * @param value incoming value
 */
const isPromiseLike = (value: any): value is Promise<unknown> =>
	typeof value === 'object' && value !== null && typeof value.then === 'function'

/**
 * Returns true if value is a file.
 * Supports File, Blob, Buffer and stream-like instances
 *
 * @param value incoming value
 */
export const isFileUpload = (value: unknown): value is FileUpload =>
	(typeof File !== 'undefined' && value instanceof File) ||
	(typeof Blob !== 'undefined' && value instanceof Blob) ||
	(typeof Buffer !== 'undefined' && value instanceof Buffer) ||
	isStreamLike(value) ||
	isPromiseLike(value)
