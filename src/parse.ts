const tagOrAttrName = /[^><\/ ]+/;
const attrDoubleQuote = new RegExp(`${tagOrAttrName.source}="[^\"]*"`);
const attrSingleQuote = new RegExp(`${tagOrAttrName.source}='[^\']*'`);
const attrNoneQuote = new RegExp(`${tagOrAttrName.source}`);
const attr = new RegExp(`(${attrDoubleQuote.source})|(${attrSingleQuote.source})|(${attrNoneQuote.source})`);
const startTag = new RegExp(`(?<tagName>${tagOrAttrName.source})`);
const endTag = /<\/\k<tagName>>/;
const tag = new RegExp(`<${startTag.source}( +(?<attrs>${attr.source}))* *>(?<children>.*?)${endTag.source}`);
const tagGlobal = new RegExp(`${tag.source}`, 'g');

export const parse = (template: string) => {
  template = template.replace(/[\n\r]/g, '');
  const nodes = template.match(tagGlobal);
  const ast: Node[] = [];
  if (nodes) {
    for (const node of nodes) {
      const matched = node.match(tag);
      const { tagName, children } = matched!.groups!;
      const attrs = matched!.groups!.attrs || '';
      const astNode: Node = {
        tag: tagName,
        attrs: [],
        children: [],
      };
      for (const attribute of attrs.match(new RegExp(attr, 'g')) || []) {
        let [key, value]: Array<string | boolean> = attribute.split('=');
        value = value ? value.replace(/["']/g, '') : '';
        astNode.attrs.push({
          key, value,
        });
      }
      astNode.children = parse(children);
      ast.push(astNode);
    }
  } else {
    ast.push({
      tag: 'text',
      text: template,
      attrs: [],
      children: [],
    });
  }
  return ast;
};
export type Node = {
  tag: string;
  attrs: Attr[];
  children: Node[];
  text?: string;
};
export type Attr = {
  key: string;
  value: string;
};
