const isCI = process.env.CI !== undefined

module.exports = {
	resetMocks: true,
	roots: ['<rootDir>/test', '<rootDir>/src'],
	coverageReporters: isCI
		? ['clover', 'json', 'lcov', 'text']
		: ['clover', 'text-summary'],
	coveragePathIgnorePatterns: ['<rootDir>/test'],
	transform: {
		'^.+\\.(t|j)sx?$': ['@swc/jest'],
	},
}
