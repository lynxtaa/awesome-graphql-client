/**
 * @jest-environment jsdom
 */

import { normalizeHeaders } from './normalizeHeaders'

it('supports headers as array', () => {
	expect(
		normalizeHeaders([
			['Authorization', 'abc'],
			['X-Options', '123'],
		]),
	).toEqual({
		'authorization': 'abc',
		'x-options': '123',
	})
})

it('supports headers as Headers instance', () => {
	const headers = new Headers()

	headers.set('Authorization', 'abc')
	headers.set('X-Options', '123')

	expect(normalizeHeaders(headers)).toEqual({
		'authorization': 'abc',
		'x-options': '123',
	})
})

it('supports headers as an object', () => {
	expect(normalizeHeaders({ 'Authorization': 'abc', 'X-Options': '123' })).toEqual({
		'authorization': 'abc',
		'x-options': '123',
	})
})

it('supports headers as undefined', () => {
	expect(normalizeHeaders(undefined)).toEqual({})
})
