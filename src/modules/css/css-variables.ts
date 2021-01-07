export function getCssVar(varName: string, isPixel = true): number {
  const cssVar = getComputedStyle(document.documentElement).getPropertyValue(
    varName
  );

  if (isPixel) {
    return getValueFromPixelString(cssVar);
  }
  return Number(cssVar);
}

export function setCssVariable(varName, value): void {
  document.documentElement.style.setProperty(varName, value);
}

/**
 * '480px' --> 480
 */
export function getValueFromPixelString(pixelString: string): number {
  return Number(pixelString.replace(/px$/, ""));
}

export function getComputedValueFromPixelString(
  element: HTMLElement,
  value: string
): number {
  return getValueFromPixelString(getComputedStyle(element)[value]);
}
