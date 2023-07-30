module.exports = {
	root: true,
	plugins: ['jest'],
	extends: [
		'@lynxtaa/eslint-config',
		'@lynxtaa/eslint-config/requires-typechecking',
		'plugin:jest/recommended',
	],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
}
