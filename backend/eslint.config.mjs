import tseslint from 'typescript-eslint';

/**
 * Flat ESLint config: recommended TypeScript rules with a few
 * pragmatic adjustments for an Express codebase.
 */
export default tseslint.config(...tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-module-boundary-types': 'off',
  },
  ignores: ['dist/**', 'node_modules/**'],
});
