import ts from 'rollup-plugin-typescript2';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.ts',
  plugins: [
    ts({
      useTsconfigDeclarationDir: true,
    }),
    terser(),
  ],
  output: [{
    file: pkg.module.replace('.js', '.min.js'),
    format: 'es',
  }, {
    file: pkg.main.replace('.js', '.min.js'),
    format: 'cjs',
  }, {
    file: pkg.umd.replace('.js', '.min.js'),
    format: 'umd',
    name: 'HTMLParser',
  }]
};
