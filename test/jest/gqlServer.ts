import Fastify, { FastifyInstance } from 'fastify'
import { createHttpTerminator } from 'http-terminator'
import mercurius, { IResolvers, MercuriusOptions } from 'mercurius'
import upload from 'mercurius-upload'

export type TestServer = FastifyInstance & {
	endpoint: string
	destroy: () => Promise<void>
}

export async function createServer(
	schema: string,
	resolvers: IResolvers,
	options?: Omit<MercuriusOptions, 'schema' | 'resolvers'>,
): Promise<TestServer> {
	const app = Fastify()

	app.addHook('preHandler', (req, res, done) => {
		res.header('Access-Control-Allow-Origin', '*')
		done()
	})

	app.register(upload)

	app.register(mercurius, { schema, resolvers, graphiql: false, ...options })

	app.options('/graphql', (req, res) => {
		res.header('Access-Control-Allow-Headers', '*')
		res.status(204).send()
	})

	await app.listen(0)

	const address = app.server.address()

	if (!address || typeof address === 'string') {
		throw new Error("Can't get server address")
	}

	const testServer = app as unknown as TestServer

	const httpTerminator = createHttpTerminator({ server: app.server })

	testServer.destroy = () => httpTerminator.terminate()

	testServer.endpoint = `http://localhost:${address.port}/graphql`

	return testServer
}
