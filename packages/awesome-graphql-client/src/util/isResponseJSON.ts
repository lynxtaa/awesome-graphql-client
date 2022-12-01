import { RequestResult } from './types'

export const isResponseJSON = (response: {
	headers: RequestResult['headers']
}): boolean => (response.headers.get('Content-Type') ?? '').includes('application/json')
