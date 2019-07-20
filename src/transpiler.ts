import Vue, { ComponentOptions } from 'vue';
const tagOrAttrName = /[^><\/ ]+/;
const attrDoubleQuote = new RegExp(`${tagOrAttrName.source}="[^\"]*"`);
const attrSingleQuote = new RegExp(`${tagOrAttrName.source}='[^\']*'`);
const attrNoneQuote = new RegExp(`${tagOrAttrName.source}`);
const attrReg = new RegExp(`(${attrDoubleQuote.source})|(${attrSingleQuote.source})|(${attrNoneQuote.source})`);
const startTag = new RegExp(`(?<tagName>${tagOrAttrName.source})`);
const endTag = /<\/\k<tagName>>/;
const tag = new RegExp(`<${startTag.source}( +(?<attr>${attrReg.source}))* *>(?<children>.*?)${endTag.source}`);
const tagGlobal = new RegExp(`${tag.source}`, 'g');

export const parse = (template: string) => {
  template = template.replace(/[\n\r]/g, '');
  const node = template.match(tag);
  if (node) {
    const { tagName, attrs, children } = node.groups!;
    const ast: Node = {
      tag: tagName,
      attrs: [],
      children: [],
    };
    for (const attr of attrs.match(attrReg) || []) {
      let [key, value]: Array<string | boolean> = attr.split('=');
      value = value ? value.replace(/["']/g, '') : true;
      ast.attrs.push({
        key, value, dynamic: !!key.match(/^:/), event: !!key.match(/^@/),
      });
    }
    const childNodes = children.match(tagGlobal) || [];
    for (const child of childNodes) {
      ast.children.push(parse(child) || {
        tag: '', attrs: [], children: [],
      });
    }
    return ast;
  }
};
export const pascalToKebab = (str: string) => {
  const letters = str.split('');
  for (const [index, letter] of letters.entries()) {
    if (letter.match(/[A-Z]/)) {
      letters[index] = letter.toLowerCase();
      if (letters[index - 1] && letters[index - 1] !== '-') {
        letters.splice(index, 0, '-');
      }
    }
  }
  return letters.join('');
};
export const isRegisteredComponent = (name: string): false | ComponentOptions<Vue> => {
  name = pascalToKebab(name);
  const registeredComponentNames = Object.keys((Vue as any).options.components).map((comp) => pascalToKebab(comp));
  const registeredComponents = Object.values<any>((Vue as any).options.components);
  return registeredComponentNames.includes(name) && registeredComponents[registeredComponentNames.indexOf(name)].options;
};
export const transpiler = (ast: Node | void) => {
  if (!ast) {
    return '';
  }
  const { tag, attrs, children } = ast;
  // start fn
  let fn = `h('${tag}', `;
  const staticAttrs = attrs.filter((attr) => !attr.dynamic);
  const dynamicAttrs = attrs.filter((attr) => attr.dynamic);
  const notEvents = attrs.filter((attr) => !attr.event);
  const events = attrs.filter((attr) => attr.event);
  const comp = isRegisteredComponent(tag);
  let attrsObj = `attrs: {`;
  let propsObj = `props: {`;
  let onObj = `on: {`;
  let nativeOnObj = `nativeOn: {`;
  if (comp) {
    let shouldBeProps: string[] = [];
    if (Array.isArray(comp.props)) {
      shouldBeProps = comp.props;
    } else if (comp.props) {
      shouldBeProps = Object.keys(comp.props);
    }
    for (const attr of notEvents) {
      if (shouldBeProps.includes(attr.key)) {
        propsObj += `${attr.key.replace(/^:/, '')}: ${attr.value}, `;
      } else {
        attrsObj += `${attr.key.replace(/^:/, '')}: ${attr.value}, `;
      }
    }
    for (const event of events) {
      if (event.key.includes('.native')) {
        nativeOnObj += `${event.key.replace(/^@/, '').split('.')[0]}: ${event.value}, `;
      } else {
        onObj += `${event.key.replace(/^@/, '').split('.')[0]}: ${event.value}, `;
      }
    }
  } else {
    for (const attr of notEvents) {
      attrsObj += `${attr.key.replace(/^:/, '')}: ${attr.value}, `;
    }
    for (const event of events) {
      onObj += `${event.key.replace(/^@/, '').split('.')[0]}: ${event.value}, `;
    }
  }
  attrsObj += `},`;
  propsObj += `},`;
  onObj += `},`;
  nativeOnObj += `},`;
  fn = fn.concat(attrsObj, propsObj, onObj, nativeOnObj, '}, ');
  fn += '[';
  for (const child of children) {
    fn += transpiler(child) + ',';
  }
  fn += '])';
  return fn;
};
export const genVNode = (template: string) => {
  const ast = parse(template);
  const fnStr = transpiler(ast);
  return eval(fnStr);
};
interface Node {
  tag: string;
  attrs: Attr[];
  children: Node[];
}
interface Attr {
  key: string;
  value: string | boolean;
  dynamic: boolean;
  event: boolean;
}
