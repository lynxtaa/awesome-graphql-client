module.exports = {
	root: true,
	extends: ['@lynxtaa/eslint-config', '@lynxtaa/eslint-config/requires-typechecking'],
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
	},
}
