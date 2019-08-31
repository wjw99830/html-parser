const tagOrAttrName = /[^><\/ ]+/;
const attrDoubleQuote = new RegExp(`${tagOrAttrName.source}="[^\"]*"`);
const attrSingleQuote = new RegExp(`${tagOrAttrName.source}='[^\']*'`);
const attrNoneQuote = new RegExp(`${tagOrAttrName.source}`);
const attr = new RegExp(`(${attrDoubleQuote.source})|(${attrSingleQuote.source})|(${attrNoneQuote.source})`);
const startTag = `<${tagOrAttrName.source}( +(${attr.source}))* *>`;
const beginTagStart = `^\\<(${tagOrAttrName.source})`;
const endTagStart = `^</(${tagOrAttrName.source})>`;
const comment = /^(<!--(.*?)-->)/;
function parse(template) {
    template = template.replace(/[\n\r]/g, '').trim();
    const ast = [];
    const stack = [];
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
        }
        else if (startTagMatch = template.match(new RegExp(beginTagStart))) {
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
        }
        else if (endTagMatch = template.match(new RegExp(endTagStart))) {
            stack.pop();
            advance(endTagMatch[0].length);
        }
        else if (textMatch = template.match(new RegExp('^[^<]*'))) {
            const beginTagStartIndex = template.indexOf('<');
            const node = new Node('text');
            node.text = textMatch[0];
            inTree(node);
            advance(beginTagStartIndex);
        }
    }
    function advance(terminus) {
        template = template.slice(terminus);
    }
    function inTree(node) {
        if (!stack.length) {
            ast.push(node);
        }
        else {
            stack[stack.length - 1].children.push(node);
        }
    }
    return ast;
}
class Node {
    constructor(tag) {
        this.attrs = [];
        this.children = [];
        this.tag = tag;
    }
}

const generate = (ast) => {
    const fragment = document.createDocumentFragment();
    for (const astNode of ast) {
        if (astNode.tag === 'text') {
            const textNode = document.createTextNode(astNode.text);
            fragment.appendChild(textNode);
        }
        else if (astNode.tag === 'comment') {
            const commentNode = document.createComment(astNode.text);
            fragment.appendChild(commentNode);
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

function toDOM(template) {
    const ast = parse(template);
    return generate(ast);
}

export { generate, parse, toDOM };
