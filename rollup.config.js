import ts from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: 'src/main.ts',
  plugins: [
    ts({
      useTsconfigDeclarationDir: true,
    }),
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
    name: 'Utils',
  }]
};
