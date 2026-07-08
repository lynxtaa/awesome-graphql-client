import { defineConfig } from 'vitest/config'

const isCI = process.env.CI !== undefined

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		mockReset: true,
		setupFiles: ['./test/setupTests.ts'],
		coverage: {
			provider: 'v8',
			include: ['src/**'],
			reporter: isCI ? ['clover', 'json', 'lcov', 'text'] : ['html', 'text-summary'],
		},
	},
})
