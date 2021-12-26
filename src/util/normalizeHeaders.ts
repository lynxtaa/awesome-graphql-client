import { Headers } from './types'

const isHeaders = (
	headers: Headers | string[][] | Record<string, string>,
): headers is Headers => !Array.isArray(headers) && typeof headers.get === 'function'

/**
 * This function will convert headers to { [key: string]: string }
 * and make header keys lowercase (as per https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)
 *
 * @param headers request headers
 */
export function normalizeHeaders(
	headers: Headers | string[][] | Record<string, string> | undefined,
): Record<string, string> {
	if (headers === undefined) {
		return {}
	}

	if (isHeaders(headers)) {
		const newHeaders: Record<string, string> = {}
		headers.forEach((val, key) => {
			newHeaders[key] = val
		})
		return newHeaders
	}

	if (Array.isArray(headers)) {
		return Object.fromEntries(
			headers.map(([key, val]) => {
				if (key === undefined || val === undefined) {
					throw new Error(`Received invalid headers: ${headers}`)
				}
				return [key.toLowerCase(), val]
			}),
		)
	}

	return Object.fromEntries(
		Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
	)
}
