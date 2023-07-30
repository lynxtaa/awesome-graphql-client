const isCI = process.env.CI !== undefined

/** @type {import('jest').Config} */
module.exports = {
	resetMocks: true,
	roots: ['<rootDir>/test', '<rootDir>/src'],
	coverageReporters: isCI ? ['clover', 'json', 'lcov', 'text'] : ['html', 'text-summary'],
	coveragePathIgnorePatterns: ['<rootDir>/test'],
	setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc/jest'],
	},
}
