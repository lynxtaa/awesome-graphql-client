import { isExtractableFile, ExtractableFile } from 'extract-files'

// Support streams for NodeJS compatibility
const isExtractableFileEnhanced = (
	value: any,
): value is ExtractableFile | Buffer | { pipe: (...args: any[]) => void } =>
	isExtractableFile(value) ||
	// Check if buffer
	(typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) ||
	// Check if stream
	// https://github.com/sindresorhus/is-stream/blob/3750505b0727f6df54324784fe369365ef78841e/index.js#L3
	(typeof value === 'object' && value !== null && typeof value.pipe === 'function')

export default isExtractableFileEnhanced
