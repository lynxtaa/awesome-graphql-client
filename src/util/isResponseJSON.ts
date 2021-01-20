import { RequestResult } from './types'

const isResponseJSON = (response: { headers: RequestResult['headers'] }): boolean =>
	(response.headers.get('Content-Type') || '').includes('application/json')

export default isResponseJSON
