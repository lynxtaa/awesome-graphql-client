export interface Headers {
	// eslint-disable-next-line @typescript-eslint/method-signature-style
	get(name: string): string | null
	// eslint-disable-next-line @typescript-eslint/method-signature-style
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
	headers?: any
	body?: any
	allowPartialResponse?: boolean
}
