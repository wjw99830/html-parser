import { parse } from './parse';
import { generate } from './generate';

export const transform = (template: string) => {
  const ast = parse(template);
  return generate(ast);
};
