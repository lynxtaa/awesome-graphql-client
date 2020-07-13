import { rest, graphql } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer()

export { server, rest, graphql }
