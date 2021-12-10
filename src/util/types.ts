interface Headers {
	get(name: string): string | null
}

export interface RequestResult {
	ok: boolean
	headers: Headers
	json: () => Promise<any>
	status: number
}

export interface FetchOptions {
	method?: string
	headers?: Record<string, string>
	body?: any
}
