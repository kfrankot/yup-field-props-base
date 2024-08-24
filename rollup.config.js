import { babel } from '@rollup/plugin-babel'
import includePaths from 'rollup-plugin-includepaths'
import license from 'rollup-plugin-license'
import terser from '@rollup/plugin-terser'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

const banner = `
@preserve
Kevin Frankot - <%= pkg.name %> v<%= pkg.version %>
`

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.cjs.js',
        format: 'cjs',
      },
      {
        file: 'dist/index.esm.js',
        format: 'esm',
      },
    ],
    external: ['yup'],
    plugins: [
      license({
        banner,
      }),
      includePaths({
        extensions: ['.ts', '.js'],
      }),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.ts', '.js'],
      }),
      terser(),
    ],
  },
]
