export interface Headers {
	get(name: string): string | null
}

export interface RequestResult {
	ok: boolean
	headers: Headers
	json: () => Promise<any>
	status: number
}
