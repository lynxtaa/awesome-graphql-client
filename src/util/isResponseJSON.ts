import { Headers } from './types'

const isResponseJSON = (response: { headers: Headers }): boolean =>
	(response.headers.get('Content-Type') || '').includes('application/json')

export default isResponseJSON
