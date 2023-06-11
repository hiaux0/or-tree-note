---
export class VimStateUtils {
  private readonly vimState: VimStateV2;
  id: string;
  cursor: Cursor;
  foldMap: FoldMap;
  lines: VimLine[];
  mode: VimMode;
  visualStartCursor: Cursor;
  visualEndCursor: Cursor;
  deletedLinesIndeces: number[];
  commandName: VimCommandNames;
  snippet: ISnippet;

  constructor(vimState: VimStateV2) {
    this.vimState = cloneDeep(vimState);
  }

  public updateVimState(vimState: VimStateV2) {
    this.id = vimState.id;
    this.cursor = vimState.cursor;
    this.foldMap = vimState.foldMap;
    this.lines = vimState.lines;
    this.mode = vimState.mode ?? VimMode.NORMAL;
    this.visualStartCursor = vimState.visualStartCursor;
    this.visualEndCursor = vimState.visualEndCursor;
    this.deletedLinesIndeces = vimState.deletedLinesIndeces;
    this.commandName = vimState.commandName;
    this.snippet = vimState.snippet;
  }
}

---

// const isAwaitingCommand = commandsThatWaitForNextInput.find(
// (commandThatWaits) => {
// const is = commandThatWaits.command === isInputForAwaitingCommand.command;
// return is;
// }
// );
// if (isAwaitingCommand && input === SHIFT) {
// return {
// targetCommand: undefined,
// potentialCommands: [finalAwaitingCommand],
// };
// }

---

// vimState = new VimStateClass({
// ...this.vimCommandManager.getCurrentMode().cursorLeft().serialize(),
// ...this.vimCommandManager.enterNormalMode().serialize(),
// });
