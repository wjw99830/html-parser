const tagOrAttrName = /[^><\/ ]+/;
const attrDoubleQuote = new RegExp(`${tagOrAttrName.source}="[^\"]*"`);
const attrSingleQuote = new RegExp(`${tagOrAttrName.source}='[^\']*'`);
const attrNoneQuote = new RegExp(`${tagOrAttrName.source}`);
const attr = new RegExp(`(${attrDoubleQuote.source})|(${attrSingleQuote.source})|(${attrNoneQuote.source})`);
const startTag = new RegExp(`(?<tagName>${tagOrAttrName.source})`);
const endTag = /<\/\k<tagName>>/;
const tag = new RegExp(`<${startTag.source}( +(?<attrs>${attr.source}))* *>(?<children>.*?)${endTag.source}`);
const tagGlobal = new RegExp(`${tag.source}`, 'g');
const parse = (template) => {
    template = template.replace(/[\n\r]/g, '');
    const nodes = template.match(tagGlobal);
    const ast = [];
    if (nodes) {
        for (const node of nodes) {
            const matched = node.match(tag);
            const { tagName, children } = matched.groups;
            const attrs = matched.groups.attrs || '';
            const astNode = {
                tag: tagName,
                attrs: [],
                children: [],
            };
            for (const attribute of attrs.match(new RegExp(attr, 'g')) || []) {
                let [key, value] = attribute.split('=');
                value = value ? value.replace(/["']/g, '') : '';
                astNode.attrs.push({
                    key, value,
                });
            }
            astNode.children = parse(children);
            ast.push(astNode);
        }
    }
    else {
        ast.push({
            tag: 'text',
            text: template,
            attrs: [],
            children: [],
        });
    }
    return ast;
};

const generate = (ast) => {
    const fragment = document.createDocumentFragment();
    for (const astNode of ast) {
        if (astNode.tag === 'text') {
            const textNode = document.createTextNode(astNode.text);
            fragment.appendChild(textNode);
        }
        else {
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

const transform = (template) => {
    const ast = parse(template);
    return generate(ast);
};

export { transform };
