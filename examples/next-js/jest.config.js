import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: './',
})

const isCI = process.env.CI !== undefined

export default createJestConfig({
	resetMocks: true,
	testEnvironment: 'jsdom',
	roots: ['<rootDir>/tests'],
	coverageReporters: isCI
		? ['html', 'text', 'text-summary', 'cobertura']
		: ['html', 'text-summary'],
	snapshotFormat: {
		escapeString: false,
		printBasicPrototype: false,
	},
	setupFiles: ['whatwg-fetch'],
	setupFilesAfterEnv: ['./jest/setupTests.ts'],
})
