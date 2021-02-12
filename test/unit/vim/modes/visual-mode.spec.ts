import { cloneDeep } from 'lodash';
import { Vim } from 'modules/vim/vim';
import { VimCommandManager } from 'modules/vim/vim-command-manager';
import { Cursor, VimMode } from 'modules/vim/vim.types';
import { createVimState, VIM_TEST_WHOLEINPUT } from 'test/vim-state-utils';

describe('C: Mode - Visual - Simplest setup', () => {
  let vimCommandManager: VimCommandManager;

  beforeEach(() => {
    vimCommandManager = new VimCommandManager(
      cloneDeep(VIM_TEST_WHOLEINPUT),
      cloneDeep(createVimState())
    );
    vimCommandManager.enterVisualMode();
  });

  it('Add cursor data to visual - 1 cursorRight', () => {
    const result = vimCommandManager.executeVimCommand('cursorRight');
    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 1, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 1, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor data to visual - 2 cursorRight', () => {
    vimCommandManager.executeVimCommand('cursorRight');
    const result = vimCommandManager.executeVimCommand('cursorRight');

    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 2, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 2, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor data to visual - e', () => {
    const result = vimCommandManager.executeVimCommand('cursorWordForwardEnd');

    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 2, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 2, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor data to visual - eb', () => {
    const vimState = vimCommandManager.executeVimCommand(
      'cursorWordForwardEnd'
    );
    vimCommandManager.setVimState(vimState);
    const result = vimCommandManager.executeVimCommand(
      'cursorBackwordsStartWord'
    );

    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 0, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 0, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor data to visual - b', () => {
    const input = ['foo'];
    vimCommandManager = new VimCommandManager(
      input,
      cloneDeep(createVimState(input[0], { col: 2, line: 0 }))
    );
    vimCommandManager.enterVisualMode();

    const result = vimCommandManager.executeVimCommand(
      'cursorBackwordsStartWord'
    );

    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 0, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 0, line: 0 },
      visualStartCursor: { col: 2, line: 0 },
    });
  });

  describe('#visualInnerWord', () => {
    it('Start of word', () => {
      const result = vimCommandManager.executeVimCommand('visualInnerWord');
      expect(result).toEqual({
        mode: VimMode.VISUAL,
        cursor: { col: 2, line: 0 },
        text: 'foo',
        visualEndCursor: { col: 2, line: 0 },
        visualStartCursor: { col: 0, line: 0 },
      });
    });
    it('Middle of word', () => {
      vimCommandManager.executeVimCommand('cursorRight');
      const result = vimCommandManager.executeVimCommand('visualInnerWord');
      expect(result).toEqual({
        mode: VimMode.VISUAL,
        cursor: { col: 2, line: 0 },
        text: 'foo',
        visualEndCursor: { col: 2, line: 0 },
        visualStartCursor: { col: 0, line: 0 },
      });
    });
    it('End of word', () => {
      vimCommandManager.executeVimCommand('cursorWordForwardEnd');
      const result = vimCommandManager.executeVimCommand('visualInnerWord');
      expect(result).toEqual({
        mode: VimMode.VISUAL,
        cursor: { col: 2, line: 0 },
        text: 'foo',
        visualEndCursor: { col: 2, line: 0 },
        visualStartCursor: { col: 0, line: 0 },
      });
    });
  });

  it('#visualMoveToOtherEndOfMarkedArea', () => {
    const vimState = vimCommandManager.executeVimCommand(
      'cursorWordForwardEnd'
    );
    vimCommandManager.setVimState(vimState);
    const result = vimCommandManager.executeVimCommand(
      'visualMoveToOtherEndOfMarkedArea'
    );

    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 0, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 0, line: 0 },
      visualStartCursor: { col: 2, line: 0 },
    });
  });
});

describe('C: Mode - Visual - Complexer setup', () => {
  let vimCommandManager;

  it('#visualStartLineWise', () => {
    const input = [' @foo'];
    vimCommandManager = new VimCommandManager(
      input,
      cloneDeep(createVimState(input[0]))
    );
    vimCommandManager.enterVisualMode();

    const result = vimCommandManager.executeVimCommand('visualStartLineWise');
    expect(result).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 5, line: 0 },
      text: ' @foo',
      visualStartCursor: { col: 0, line: 0 },
      visualEndCursor: { col: 5, line: 0 },
    });
  });

  it('Visual#visualInnerWord - uviw', () => {
    const input = ['foo', '012345'];
    const vim = new Vim(cloneDeep(input), createVimState(input[0]).cursor);
    const result = vim.queueInputSequence('uviw').pop();

    expect(result.vimState).toEqual({
      mode: VimMode.VISUAL,
      cursor: { col: 5, line: 1 },
      text: input[1],
      visualStartCursor: { col: 0, line: 1 },
      visualEndCursor: { col: 5, line: 1 },
    });
  });
});
