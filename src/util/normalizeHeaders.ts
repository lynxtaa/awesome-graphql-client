import { Headers } from './types'

type HeadersInit =
	| Iterable<[string, string]>
	| Headers
	| string[][]
	| Record<string, string>

const isHeaders = (headers: HeadersInit): headers is Headers =>
	typeof (headers as any).get === 'function'

const isIterableHeaders = (
	headers: HeadersInit,
): headers is Iterable<[string, string]> | string[][] =>
	typeof (headers as any)[Symbol.iterator] === 'function'

/**
 * This function will convert headers to { [key: string]: string }
 * and make header keys lowercase (as per https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2)
 *
 * @param headers request headers
 */
export function normalizeHeaders(
	headers: HeadersInit | undefined,
): Record<string, string> {
	if (headers === undefined) {
		return {}
	}

	if (isHeaders(headers)) {
		const newHeaders: Record<string, string> = {}

		// eslint-disable-next-line unicorn/no-array-for-each
		headers.forEach((value, key) => {
			newHeaders[key] = value
		})
		return newHeaders
	}

	if (isIterableHeaders(headers)) {
		const newHeaders: Record<string, string> = {}

		for (const [key, value] of headers) {
			newHeaders[key.toLowerCase()] = value
		}

		return newHeaders
	}

	return Object.fromEntries(
		Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]),
	)
}
