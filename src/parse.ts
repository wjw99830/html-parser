const tagOrAttrName = /[^><\/ ]+/;
const attrDoubleQuote = new RegExp(`${tagOrAttrName.source}="[^\"]*"`);
const attrSingleQuote = new RegExp(`${tagOrAttrName.source}='[^\']*'`);
const attrNoneQuote = new RegExp(`${tagOrAttrName.source}`);
const attr = new RegExp(`(${attrDoubleQuote.source})|(${attrSingleQuote.source})|(${attrNoneQuote.source})`);
const startTag = `<${tagOrAttrName.source}( +(${attr.source}))* *>`;



const beginTagStart = `^\\<(${tagOrAttrName.source})`;
const endTagStart = `^</(${tagOrAttrName.source})>`;
const comment = /^(<!--(.*?)-->)/;

export function parse(template: string) {
  template = template.replace(/[\n\r]/g, '').trim();
  const ast: Node[] = [];
  const stack: Node[] = [];
  while (template) {
    let textMatch;
    let endTagMatch;
    let startTagMatch;
    let commentMatch;
    if (commentMatch = template.match(comment)) {
      const node = new Node('comment');
      node.text = commentMatch[2];
      inTree(node);
      advance(commentMatch[0].length);
    } else if (startTagMatch = template.match(new RegExp(beginTagStart))) {
      const tag = startTagMatch[1];
      let endTagStartIndex = template.match(new RegExp(startTag))[0].length;
      const attrsMatch = template.slice(0, endTagStartIndex).replace(tag, '').match(new RegExp(attr.source, 'g'));
      const node = new Node(tag);
      if (attrsMatch) {
        node.attrs = attrsMatch.map(attr => {
          let equalIndex = attr.indexOf('=');
          equalIndex = equalIndex < 0 ? attr.length : equalIndex;
          const key = attr.slice(0, equalIndex).replace(/[:@]/, '');
          const value = attr.slice(equalIndex + 1).replace(/[\"\'"]/g, '');
          return { key, value };
        });
      }
      inTree(node);
      stack.push(node);
      advance(endTagStartIndex);
    } else if (endTagMatch = template.match(new RegExp(endTagStart))) {
      stack.pop();
      advance(endTagMatch[0].length);
    } else if (textMatch = template.match(new RegExp('^[^<]*'))) {
      const beginTagStartIndex = template.indexOf('<');
      const node = new Node('text');
      node.text = textMatch[0];
      inTree(node);
      advance(beginTagStartIndex);
    }
  }
  function advance(terminus: number) {
    template = template.slice(terminus);
  }
  function inTree(node: Node) {
    if (!stack.length) {
      ast.push(node);
    } else {
      stack[stack.length - 1].children.push(node);
    }
  }
  return ast;
};
export type Attr = {
  key: string;
  value: string;
};
export class Node {
  tag: string;
  attrs: Attr[] = [];
  children: Node[] = [];
  text?: string;
  constructor(tag?: string) {
    this.tag = tag;
  }
}
