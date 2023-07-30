module.exports = {
	root: true,
	plugins: ['jest'],
	extends: [
		'next/core-web-vitals',
		'@lynxtaa/eslint-config',
		'@lynxtaa/eslint-config/requires-typechecking',
		'plugin:jest/recommended',
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
}
