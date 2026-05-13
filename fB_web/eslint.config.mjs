import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
	...nextVitals,
	{
		rules: {
			'react-hooks/set-state-in-effect': 'off',
			'react-hooks/immutability': 'off',
			'react-hooks/purity': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'react-hooks/preserve-manual-memoization': 'off',
			'react/no-unescaped-entities': 'off',
		},
	},
]

export default eslintConfig
