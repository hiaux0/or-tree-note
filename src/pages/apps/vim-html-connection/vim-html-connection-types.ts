export interface CommandHandledReturn {
  currentElement?: HTMLElement;
  nextElement?: HTMLElement;
  activeIndex?: number;
}

type Selector = string;

export interface HorizontalOptions {
  widthDelta?: number;
  highestParent?: HTMLElement | Selector;
  lowestChild?: HTMLElement | Selector;
}

export const defaulthorizontalOptions: HorizontalOptions = {
  widthDelta: 0,
  highestParent: document.body,
};
