export declare function parse(template: string): Node[];
export declare type Attr = {
    key: string;
    value: string;
};
export declare class Node {
    tag: string;
    attrs: Attr[];
    children: Node[];
    text?: string;
    constructor(tag?: string);
}
