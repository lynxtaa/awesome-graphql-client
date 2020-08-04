import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer()

export { server, graphql, rest }
