// The configuration object for [lint-staged](https://www.npmjs.com/package/lint-staged)
module.exports = {
  // Lint source with [ESLint](https://www.npmjs.com/package/eslint)
  'index.ts': 'eslint --fix',
  // Format all files with [prettier](https://www.npmjs.com/package/prettier).
  '*.{ts,js,json,md}': 'prettier --write',
};
