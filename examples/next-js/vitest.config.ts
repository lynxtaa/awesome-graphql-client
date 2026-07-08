import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const isCI = process.env.CI !== undefined

export default defineConfig({
	plugins: [react()],
	test: {
		globals: true,
		environment: 'jsdom',
		mockReset: true,
		setupFiles: ['./test-utils/setupTests.ts'],
		snapshotFormat: {
			escapeString: false,
			printBasicPrototype: false,
		},
		coverage: {
			reporter: isCI
				? ['html', 'text', 'text-summary', 'cobertura']
				: ['html', 'text-summary'],
		},
	},
})
