export interface Headers {
	get(name: string): string | null
	forEach(callbackfn: (value: string, key: string) => void): void
}

export interface RequestResult {
	ok: boolean
	headers: Headers
	json: () => Promise<any>
	status: number
}

export interface FetchOptions {
	method?: string
	headers?: string[][] | Record<string, string> | Headers
	body?: any
}
