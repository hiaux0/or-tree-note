import { cloneDeep } from 'lodash';
import { Vim } from 'modules/vim/vim';
import { VimCommandManager } from 'modules/vim/vim-command-manager';
import { Cursor } from 'modules/vim/vim.types';
import { createVimState, VIM_TEST_WHOLEINPUT } from 'test/vim-state-utils';

describe('C: Mode - Visual', () => {
  let vimCommandManager: VimCommandManager;

  beforeEach(() => {
    vimCommandManager = new VimCommandManager(
      cloneDeep(VIM_TEST_WHOLEINPUT),
      cloneDeep(createVimState())
    );
    vimCommandManager.enterVisualTextMode();
  });

  it('Add cursor to visual data - 1 cursorRight', () => {
    const result = vimCommandManager.executeVimCommand('cursorRight');
    expect(result).toEqual({
      cursor: { col: 1, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 1, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor to visual data - 2 cursorRight', () => {
    vimCommandManager.executeVimCommand('cursorRight');
    const result = vimCommandManager.executeVimCommand('cursorRight');

    expect(result).toEqual({
      cursor: { col: 2, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 2, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor to visual data - e', () => {
    const result = vimCommandManager.executeVimCommand('cursorWordForwardEnd');

    expect(result).toEqual({
      cursor: { col: 2, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 2, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  it('Add cursor to visual data - eb', () => {
    vimCommandManager.executeVimCommand('cursorWordForwardEnd');
    const result = vimCommandManager.executeVimCommand(
      'cursorBackwordsStartWord'
    );

    expect(result).toEqual({
      cursor: { col: 0, line: 0 },
      text: 'foo',
      visualEndCursor: { col: 0, line: 0 },
      visualStartCursor: { col: 0, line: 0 },
    });
  });
  describe('#visualInnerWord', () => {
    it('Start of word', () => {
      const result = vimCommandManager.executeVimCommand('visualInnerWord');
      expect(result).toEqual({
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
        cursor: { col: 2, line: 0 },
        text: 'foo',
        visualEndCursor: { col: 2, line: 0 },
        visualStartCursor: { col: 0, line: 0 },
      });
    });
  });

  it('#visualStartLineWise', () => {
    const input = [' @foo'];
    vimCommandManager = new VimCommandManager(
      input,
      cloneDeep(createVimState(input[0]))
    );
    vimCommandManager.enterVisualTextMode();

    const result = vimCommandManager.executeVimCommand('visualStartLineWise');
    expect(result).toEqual({
      cursor: { col: 5, line: 0 },
      text: ' @foo',
      visualStartCursor: { col: 0, line: 0 },
      visualEndCursor: { col: 5, line: 0 },
    });
  });
});
