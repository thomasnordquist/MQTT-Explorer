const eslint = require('@eslint/js')
const hooksPlugin = require('eslint-plugin-react-hooks')

module.export = [
  // eslint.configs.recommended,
  {
    // files: ['app/src/**/*'],
    plugins: {
      'react-hooks': hooksPlugin,
    },
    ignores: ['build/**/*', 'dist/**/*', 'node_modules/**/*', 'app/build/**/*'],
    ignorePatterns: ['build/**/*', 'dist/**/*', 'node_modules/**/*', 'app/build/**/*'],
    rules: hooksPlugin.configs.recommended.rules,
  },
]
