import { Logger } from '../../../../common/logging/logging';
import { isMac } from '../../../../common/platform/platform-check';
import { KeyBindingModes } from '../../../../modules/vim/vim-types';
import {
  ALL_MODIFIERS,
  ModifiersType,
  SPACE,
  SPECIAL_KEYS,
} from '../../../../resources/keybindings/app-keys';
import { Modifier } from '../../../../resources/keybindings/key-bindings';

const logger = new Logger('ShortcutService');

export class ShortcutService {
  public static isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return ALL_MODIFIERS.includes(modifierInput);
  }

  public static ensureVimModifier(input: string) {
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      /* prettier-ignore */ logger.culogger.debug(['Converted to vim modifier key: %s', asVimModifier], { onlyVerbose: true, }, (...r) => console.log(...r));
      return asVimModifier;
    }
    return input;
  }

  public static getSynonymModifier(
    keyBindings: KeyBindingModes,
    input: string
  ): string {
    const synonymInput = keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      logger.culogger.debug(
        ['Found synonym: %s for %s', synonymInput, input],
        {},
        (...r) => console.log(...r)
      );
      return synonymInput;
    } else {
      return input;
    }
  }

  public static getPressedKey(ev: KeyboardEvent) {
    let pressedKey: string;
    if (ev.code === SPACE) {
      pressedKey = ev.code;
    } else {
      pressedKey = ev.key;
    }
    return pressedKey;
  }

  public static checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
    const mainModifier = isMac ? ev.metaKey : ev.ctrlKey;
    const reload = ev.key === 'r' && mainModifier;
    const hardReload = ev.key === 'R' && mainModifier && ev.shiftKey;
    if (reload || hardReload) {
      return true;
    } else if (ev.key === 'l' && mainModifier) {
      return true;
    } else if (ev.key === 'C' && mainModifier && ev.shiftKey) {
      return true;
    } else if (ev.key === '=' && mainModifier) {
      return true;
    } else if (ev.key === '-' && mainModifier) {
      return true;
    }

    return false;
  }

  public static assembleModifiers(ev: KeyboardEvent) {
    let modifiers = '';
    const collectedModifiers = [];
    if (ev.ctrlKey) {
      modifiers += 'Ctrl+';
      collectedModifiers.push(Modifier['<Control>']);
    }
    if (ev.shiftKey) {
      modifiers += 'Shift+';
      collectedModifiers.push(Modifier['<Shift>']);
    }
    if (ev.altKey) {
      modifiers += 'Alt+';
      collectedModifiers.push(Modifier['<Alt>']);
    }
    if (ev.metaKey) {
      modifiers += 'Meta+';
      collectedModifiers.push(Modifier['<Meta>']);
    }
    return { collectedModifiers, modifiers };
  }

  public static splitInputSequence(inputSequence: string) {
    /**
     * 1st part: match char after > (positive lookbehind)
     * 2nd part: match < with char following (positive lookahead)
     *
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
     */
    const regex = /(?<=>).|<(?=.)/g;
    const splitByModifier = inputSequence
      .replace(regex, (match) => {
        return `,${match}`;
      })
      .split(',');

    const result: string[] = [];
    splitByModifier.forEach((splitCommands) => {
      if (splitCommands.includes('<')) {
        result.push(splitCommands);
      } else {
        splitCommands.split('').forEach((command) => {
          result.push(command);
        });
      }
    });

    return result;
  }
}
