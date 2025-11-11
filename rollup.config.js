/* eslint-disable @typescript-eslint/no-require-imports */
const babel = require ('@rollup/plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  plugins: [
    replace({
      preventAssignment: true,
      __BKT_SDK_VERSION__: pkg.version,
      delimiters: ['\\${', '}'],
    }),
    resolve({
      browser: true,
    }),
    commonjs(),
    babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['**/*.test.ts', '**/*.test.tsx'],
    }),
  ],
  external: ['@bucketeer/js-client-sdk', 'react', 'react-dom'],
};
