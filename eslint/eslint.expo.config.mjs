import expoConfig from 'npm:eslint-config-expo/flat.js'

export default [
  ...expoConfig,
  {
    ignores: ['dist/*'],
  },
]
