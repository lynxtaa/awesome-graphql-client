export type StreamLike = { pipe: (...args: unknown[]) => unknown }

/** Uploadable file */
export type FileUpload = File | Blob | Buffer | StreamLike

/**
 * Returns true if value is a file.
 * Supports File, Blob, Buffer and stream-like instances
 *
 * @param value incoming value
 */
export function isFileUpload(value: any): value is FileUpload {
	return (
		(typeof File !== 'undefined' && value instanceof File) ||
		(typeof Blob !== 'undefined' && value instanceof Blob) ||
		(typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) ||
		(typeof value === 'object' && value !== null && typeof value.pipe === 'function')
	)
}
