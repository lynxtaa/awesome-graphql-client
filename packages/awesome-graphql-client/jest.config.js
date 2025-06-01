const isCI = process.env.CI !== undefined

/** @type {import('jest').Config} */
export default {
	resetMocks: true,
	roots: ['<rootDir>/test', '<rootDir>/src'],
	coverageReporters: isCI ? ['clover', 'json', 'lcov', 'text'] : ['html', 'text-summary'],
	coveragePathIgnorePatterns: ['<rootDir>/test'],
	setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc-node/jest'],
	},
	extensionsToTreatAsEsm: ['.ts'],
}
