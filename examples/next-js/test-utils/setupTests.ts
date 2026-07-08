import '@testing-library/jest-dom/vitest'

import { server } from './testServer'

// vitest's jsdom exposes Node's undici fetch, which msw v1 can't intercept.
// Drop it so the XHR-based whatwg-fetch polyfill installs, matching a browser.
// @ts-expect-error deleting global fetch
delete globalThis.fetch
// @ts-expect-error Just a polyfill, no need types
await import('whatwg-fetch')

beforeAll(() =>
	server.listen({
		onUnhandledRequest: 'error',
	}),
)

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
