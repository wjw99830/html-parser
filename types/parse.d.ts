export declare const parse: (template: string) => Node[];
export declare type Node = {
    tag: string;
    attrs: Attr[];
    children: Node[];
    text?: string;
};
export declare type Attr = {
    key: string;
    value: string;
};
