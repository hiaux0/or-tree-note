export const nodes = [
  { text: 'Section 1', indentation: 0 },
  { text: '  Subsection 1.1', indentation: 2 },
  { text: '  Subsection 1.2', indentation: 2 },
  { text: '    Sub-subsection 1.2.1', indentation: 4 },
  { text: 'Section 2', indentation: 0 },
];

function toggleFold(indentIndex: number) {
  const currentLevel = nodes[indentIndex].indentation;
  currentLevel; /* ? */

  //
  const nextSameLevel = findSameIndentationLevel(currentLevel);
  nextSameLevel; /* ? */

  const foldedNodes = nodes.slice(currentLevel + 1, nextSameLevel + 1);
  foldedNodes; /* ? */
  return foldedNodes;

  //
}

function findSameIndentationLevel(currentLevel: number) {
  return nodes.slice(indentIndex + 1).findIndex((node) => {
    const same = node.indentation === currentLevel;
    same; /* ? */
    return same;
  });
}

const indentIndex = 0;
toggleFold(indentIndex);
