import { StringUtil } from 'modules/string/string';
import { IndentationLevel, IndentationNode } from 'modules/vim/vim-types';

type FoldMap = Record<number, boolean>;

export function toggleFold(
  indentIndex: IndentationLevel,
  nodes: IndentationNode[],
  foldMap: FoldMap = {}
): { foldMap: FoldMap; parentIndex: number } {
  // initIndentation
  nodes = initIndentation(nodes);

  const [backwardsIndex, forwardsIndex] = findIndecesToFold(nodes, indentIndex);

  let parentIndex = NaN;
  // single child
  if (backwardsIndex === forwardsIndex) {
    if (backwardsIndex === undefined) {
      parentIndex = indentIndex;
    } else {
      const folded = foldMap[backwardsIndex];
      foldMap[backwardsIndex] = !folded;
      parentIndex = Math.max(backwardsIndex - 1, 0);
    }
  } else {
    // + 1 start with node after current
    for (let i = backwardsIndex; i <= forwardsIndex; i++) {
      const folded = foldMap[i];
      foldMap[i] = !folded;
    }
    parentIndex = Math.max(backwardsIndex - 1, 0);
  }

  return {
    foldMap,
    parentIndex,
  };
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

  /** * Go back until last possible fold */
  let backwardsIndex = foldIndex;
  /** * Go forward until last possible fold */
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
      forwardsIndex = undefined;
      break;
    }
    const previousOneIndent = nodes[i - 1].indentation;

    if (thisOneIndent < previousOneIndent) {
      backwardsIndex = undefined;
      break;
    } else if (thisOneIndent > previousOneIndent) {
      backwardsIndex = i;
      break;
    }
  }

  // go forward until parent
  const backwardsIndent = nodes[backwardsIndex - 1]?.indentation;
  for (let i = foldIndex; i < nodes.length; i++) {
    const thisOneIndent = nodes[i].indentation;
    if (nodes[i + 1] === undefined) {
      backwardsIndex = undefined;
      forwardsIndex = undefined;
      break;
    }
    if (thisOneIndent <= backwardsIndent) {
      forwardsIndex = i - 1;
      break;
    }
  }

  return [backwardsIndex, forwardsIndex];
}

function initIndentation(nodes: IndentationNode[]): IndentationNode[] {
  nodes.forEach((node) => {
    if (node.indentation) return;
    if (!node.text) {
      // node.indentation = -Infinity;
      return;
    }

    const result = StringUtil.getLeadingWhitespaceNum(node.text);
    node.indentation = result;

    // init
  });

  return nodes;
}
