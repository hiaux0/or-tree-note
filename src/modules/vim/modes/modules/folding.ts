import { StringUtil } from 'modules/string/string';
import { IndentationLevel, IndentationNode } from 'modules/vim/vim-types';

type FoldMap = Record<number, boolean>;

export function toggleFold(
  indentIndex: IndentationLevel,
  nodes: IndentationNode[],
  foldMap: FoldMap = {}
): FoldMap {
  // initIndentation
  nodes = initIndentation(nodes);

  const [backwardsIndex, forwardsIndex] = findIndecesToFold(nodes, indentIndex);

  // single child
  if (backwardsIndex === forwardsIndex) {
    const folded = foldMap[backwardsIndex];
    foldMap[backwardsIndex] = !folded;
    return foldMap;
  }

  // + 1 start with node after current
  for (let i = backwardsIndex; i <= forwardsIndex; i++) {
    const folded = foldMap[i + indentIndex];
    foldMap[i] = !folded;
  }

  return foldMap;
}

function findIndecesToFold(
  nodes: IndentationNode[],
  foldIndex: IndentationLevel
) {
  // Find if has children
  const currentIndentation = nodes[foldIndex]?.indentation;
  const nextIndex = foldIndex + 1;
  const nextIndentation = nodes[nextIndex]?.indentation;
  const hasChild = currentIndentation < nextIndentation;

  // if hasChild, then fold all children
  let backwardsIndex = foldIndex;
  let forwardsIndex = foldIndex;
  if (hasChild) {
    for (let i = nextIndex; i < nodes.length; i++) {
      const thisOne = nodes[i].indentation;
      const nextOne = nodes[i + 1].indentation;
      if (thisOne > nextOne) {
        forwardsIndex = i;
        break;
      }
    }

    return [backwardsIndex + 1, forwardsIndex]; // + 1: don't fold current one
  }

  // Go back until parent
  for (let i = foldIndex; i >= 0; i--) {
    const thisOneIndent = nodes[i].indentation;
    if (nodes[i - 1] === undefined) {
      backwardsIndex = undefined;
      foldIndex = undefined;
      break;
    }
    const previousOneIndent = nodes[i - 1].indentation;

    if (thisOneIndent > previousOneIndent) {
      forwardsIndex = i;
      backwardsIndex = i; // - 1, return the previous one
      break;
    }
  }

  // go forward until parent
  for (let i = foldIndex; i < nodes.length; i++) {
    const thisOneIndent = nodes[i].indentation;
    if (nodes[i + 1] === undefined) {
      backwardsIndex = undefined;
      foldIndex = undefined;
      break;
    }
    const nextOneIndent = nodes[i + 1].indentation;

    if (thisOneIndent > nextOneIndent) {
      forwardsIndex = i;
      break;
    }
  }

  return [backwardsIndex, forwardsIndex];
}

function initIndentation(nodes: IndentationNode[]): IndentationNode[] {
  nodes.forEach((node) => {
    if (node.indentation) return;

    const result = StringUtil.getLeadingWhitespaceNum(node.text);
    node.indentation = result;

    // init
  });

  /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: folding.ts ~ line 106 ~ nodes', nodes);
  return nodes;
}
