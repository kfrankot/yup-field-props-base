module.exports = {
  presets: ['@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-optional-chaining',
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
}
