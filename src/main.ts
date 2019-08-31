import { parse } from './parse';
import { generate } from './generate';

export function toDOM(template: string) {
  const ast = parse(template);
  return generate(ast);
};
export { parse } from './parse';
export { generate } from './generate';
