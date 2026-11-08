import '@testing-library/jest-dom/vitest'

import { server } from './testServer'

// Start before the test module (and thus graphQLClient) is imported, since the
// client binds globalThis.fetch on construction — msw must patch it beforehand.
server.listen({ onUnhandledFrame: 'error' })

afterEach(() => server.resetHandlers())

afterAll(() => server.close())
