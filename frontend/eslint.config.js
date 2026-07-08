import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

const compatibleRecommendedRules = { ...js.configs.recommended.rules }
delete compatibleRecommendedRules['no-unassigned-vars']
delete compatibleRecommendedRules['preserve-caught-error']

const jsRecommended = {
  ...js.configs.recommended,
  rules: compatibleRecommendedRules,
}

export default tseslint.config(
  { ignores: ['dist'] },
  jsRecommended,
  ...tseslint.configs.recommended,
  reactRefresh.configs.vite,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    languageOptions: {
      globals: globals.browser,
    },
  },
)
