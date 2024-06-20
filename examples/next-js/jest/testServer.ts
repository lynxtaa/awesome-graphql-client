export { graphql, rest } from 'msw'
import { SetupServer, setupServer } from 'msw/node'

export const server: SetupServer = setupServer()
