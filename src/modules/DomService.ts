export enum NodeType {
  TextNode = 3,
}
export class DomService {
  static isTextNode(node: ChildNode) {
    const is = node.nodeType === NodeType.TextNode;
    return is;
  }
}
