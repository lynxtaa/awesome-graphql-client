export { http, HttpResponse } from 'msw'
export { graphql } from 'msw/graphql'
import { setupServer, type SetupServer } from 'msw/node'

export const server: SetupServer = setupServer()
