import { copyFile } from 'node:fs/promises'

import { defineConfig, Options } from 'tsup'

export default defineConfig(options => {
	const commonOptions: Partial<Options> = {
		entry: {
			'awesome-graphql-client': 'src/index.ts',
		},
		...options,
	}

	return [
		{
			...commonOptions,
			format: ['esm'],
			minify: false,
			outExtension: () => ({ js: '.mjs' }),
			dts: true,
			clean: true,
			async onSuccess() {
				// Support Webpack 4 by pointing `"module"` to a file with a `.js` extension
				await copyFile(
					'dist/awesome-graphql-client.mjs',
					'dist/awesome-graphql-client.legacy-esm.js',
				)
			},
		},
		{
			...commonOptions,
			format: 'cjs',
			minify: false,
			dts: true,
			outDir: './dist/cjs/',
			outExtension: () => ({ js: '.cjs' }),
		},
	]
})
