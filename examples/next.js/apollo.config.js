module.exports = {
	client: {
		service: { name: 'server', localSchemaFile: './schema.json' },
		includes: ['./{lib,pages,components}/**/*.{graphql,ts,tsx}'],
	},
}
