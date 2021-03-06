module.exports = {
	root: true,
	// https://github.com/vuejs/eslint-config-vue
	extends: 'vue',
	// required to lint *.vue files
	plugins: ['html'],
	// add your custom rules here
	rules: {
		'no-mixed-spaces-and-tabs': 0,
		'no-throw-literal': 0,
		'no-sequences': [0],
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
	},
	globals: {
		it: true,
		describe: true
	},
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module',
		allowImportExportEverywhere: false,
		ecmaVersion: 2017
	}
};
