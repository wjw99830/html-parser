import { Node } from './parse';

export const generate = (ast: Node[]) => {
  const fragment = document.createDocumentFragment();
  for (const astNode of ast) {
    if (astNode.tag === 'text') {
      const textNode = document.createTextNode(astNode.text!);
      fragment.appendChild(textNode);
    } else {
      const elm = document.createElement(astNode.tag);
      for (const attr of astNode.attrs) {
        elm.setAttribute(attr.key, attr.value);
      }
      elm.appendChild(generate(astNode.children));
      fragment.appendChild(elm);
    }
  }
  return fragment;
};
