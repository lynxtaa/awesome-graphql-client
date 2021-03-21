export type StreamLike = { pipe: () => any }

/** Uploadable file */
export type Upload = File | Blob | Buffer | StreamLike

/**
 * Returns true if value should be considered as file.
 * Supports File, Blob, Buffer and stream-like instances
 *
 * @param value incoming value
 */
export function isFile(value: any): value is Upload {
	return (
		(typeof File !== 'undefined' && value instanceof File) ||
		(typeof Blob !== 'undefined' && value instanceof Blob) ||
		(typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) ||
		(typeof value === 'object' && value !== null && typeof value.pipe === 'function')
	)
}
