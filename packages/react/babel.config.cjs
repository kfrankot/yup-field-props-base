module.exports = {
  presets: ['@babel/preset-react', '@babel/preset-typescript'],
  plugins: [
    '@babel/plugin-transform-runtime',
    '@babel/plugin-transform-nullish-coalescing-operator',
    '@babel/plugin-transform-optional-chaining',
    'babel-plugin-lodash',
  ],
  env: {
    test: {
      presets: ['@babel/preset-env'],
    },
  },
}
