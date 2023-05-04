export function findParentElement(
  startingElement: HTMLElement,
  selectorOrPredicate: string | ((parent: HTMLElement) => boolean)
): HTMLElement | null {
  let parent = startingElement.parentElement;

  while (parent != null) {
    let condition: boolean;
    if (typeof selectorOrPredicate === 'string') {
      condition = parent.matches(selectorOrPredicate);
    } else if (typeof selectorOrPredicate === 'function') {
      condition = selectorOrPredicate(parent);
    }
    if (condition) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null; // no matching parent found
}
