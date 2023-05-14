/**
 * Key bindings available in the whole application
 */

// Command Palett
export const COMMAND_PALETT = 'ctrl+q';
export const INPUT_DROPDOWN_DOWN = 'down, ctrl+k';
export const INPUT_DROPDOWN_UP = 'up, ctrl+i';
export const INPUT_DROPDOWN_ENTER = 'enter, ctrl+n';

// Jumpable
export const JUMPABLE = 'ctrl+m';

// Letters
export const LETTERS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
];

// Modifiers
export const ALT = 'Alt';
export const ARROW_UP = 'ArrowUp';
export const ARROW_DOWN = 'ArrowDown';
export const ARROW_LEFT = 'ArrowLeft';
export const ARROW_RIGHT = 'ArrowRight';
export const BACKSPACE = 'Backspace';
export const CONTROL = 'Control';
export const DELETE = 'Delete';
export const ENTER = 'Enter';
export const ESCAPE = 'Escape';
export const META = 'Meta';
export const SHIFT = 'Shift';
export const SHIFT_KEY_CODE = 16;
export const SPACE = 'Space';

export const MODIFIERS_WORDS = [
  'Command',
  'Control',
  'Option',
  'Alt',
  'Shift',
  'Caps Lock(Capital)',
  'Escape',
  '<Escape>',
  'Enter',
  'Backspace',
  'CapsLock',
  'Delete',
  SPACE,
] as const;
export const MODIFIERS_SYMBOLS = ['⌘', '⌃', '⌥', '⇧', '⇪', '↩︎'] as const;
export const ALL_MODIFIERS = [
  ...MODIFIERS_WORDS,
  ...MODIFIERS_SYMBOLS,
] as const;

export type ModifiersType = typeof ALL_MODIFIERS[number];

export const NAVIGATION_KEYS = [
  // Navigation
  'Tab',
  'PageUp',
  'Home',
  'End',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
];

export const SPECIAL_KEYS = [...ALL_MODIFIERS, ...NAVIGATION_KEYS];

// Cursor
export const CURSOR_LEFT = 'h';
export const CURSOR_RIGHT = 'l';
export const CURSOR_UP = 'k';
export const CURSOR_DOWN = 'u';

// MODES
export const INSERT_MODE = 'i';
export const VISUAL_MODE = 'v';
