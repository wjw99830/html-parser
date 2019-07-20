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
    file: pkg.module,
    format: 'es',
  }, {
    file: pkg.main,
    format: 'cjs',
  }, {
    file: pkg.umd,
    format: 'umd',
    name: 'HTMLParser',
  }]
};
