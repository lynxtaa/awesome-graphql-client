export interface Headers {
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	get(name: string): string | null
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	forEach(callbackfn: (value: string, key: string) => void): void
}

export interface RequestResult {
	ok: boolean
	headers: Headers
	json: () => Promise<unknown>
	status: number
}

export interface FetchOptions {
	method?: string
	headers?: any
	body?: any
}

export type GraphQLFieldError = {
	message: string
	locations: { line: number; column: number }[]
	path?: (string | number)[]
	extensions?: Record<string, unknown>
}

export type DeepNullable<T> = T extends (infer R)[]
	? (DeepNullable<R> | null)[]
	: T extends Record<string, any>
		? { [P in keyof T]: DeepNullable<T[P]> | null } | null
		: T | null
