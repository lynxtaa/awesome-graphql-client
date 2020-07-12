const isResponseJSON = (response: Response): boolean =>
	(response.headers.get('Content-Type') || '').includes('application/json')

export default isResponseJSON
