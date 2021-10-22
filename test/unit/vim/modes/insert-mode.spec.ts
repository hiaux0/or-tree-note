// import { cloneDeep } from 'lodash';
// import { Vim } from 'modules/vim/vim';
// import { VimCommandManager } from 'modules/vim/vim-command-manager';
// import { Cursor } from 'modules/vim/vim.types';
// import { createVimState } from 'test/vim-state-utils';

// const input = ['foo'];

// describe('C: Mode - Insert', () => {
//   let vimCommandManager: VimCommandManager;

//   beforeEach(() => {
//     vimCommandManager = new VimCommandManager(
//       cloneDeep(input),
//       cloneDeep(createVimState())
//     );
//   });

//   describe('C: Typing characters', () => {
//     it('F: Update input with typed character', () => {
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('type', '!');
//       expect(result.text).toBe(`!${input[0]}`); // !foo
//     });
//     it('F: Cursor updated after character input', () => {
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('type', '!');
//       expect(result.cursor).toEqual({ col: 1, line: 0 }); // !foo
//     });
//   });

//   describe('C: Deleting characetrs', () => {
//     it('F: delete', () => {
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('delete');
//       expect(result).toEqual({ cursor: { col: 0, line: 0 }, text: 'oo' });
//     });
//     it('F: delete all', () => {
//       vimCommandManager.enterInsertMode();
//       vimCommandManager.executeVimCommand('delete');
//       vimCommandManager.executeVimCommand('delete');
//       const result = vimCommandManager.executeVimCommand('delete');
//       expect(result).toEqual({ cursor: { col: 0, line: 0 }, text: '' });
//     });
//     //
//     it('F: backspace', () => {
//       vimCommandManager.vimState.cursor = { col: 1, line: 0 };
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('backspace');
//       expect(result).toEqual({ cursor: { col: 0, line: 0 }, text: 'oo' });
//     });
//   });
// });
