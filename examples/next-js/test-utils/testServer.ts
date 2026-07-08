export { graphql, http, HttpResponse } from 'msw'
import { setupServer, type SetupServer } from 'msw/node'

export const server: SetupServer = setupServer()
