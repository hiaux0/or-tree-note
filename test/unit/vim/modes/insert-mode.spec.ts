// import { cloneDeep } from 'lodash';
// import { Vim } from '../../../../src/modules/vim/vim';
// import { VimCommandManager } from '../../../../src/modules/vim/vim-command-manager';
// import { Cursor } from '../../../../src/modules/vim/vim-types';
// import { createVimState } from '../../../../src/test/vim-state-utils';

// const input = ['foo'];

// describe('C: Mode - Insert', () => {
//   let vimCommandManager: VimCommandManager;

//   beforeEach(() => {
//     vimCommandManager = new VimCommandManager(cloneDeep(createVimState()));
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
//       expect(result.text).toEqual('oo');
//       expect(result.cursor).toEqual({ col: 0, line: 0 });
//     });
//     it('F: delete all', () => {
//       vimCommandManager.enterInsertMode();
//       vimCommandManager.executeVimCommand('delete');
//       vimCommandManager.executeVimCommand('delete');
//       const result = vimCommandManager.executeVimCommand('delete');
//       expect(result.text).toEqual('');
//       expect(result.cursor).toEqual({ col: 0, line: 0 });
//     });
//     //
//     it('F: backspace', () => {
//       vimCommandManager.vimState.cursor = { col: 1, line: 0 };
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('backspace');
//       expect(result.text).toEqual('oo');
//       expect(result.cursor).toEqual({ col: 0, line: 0 });
//     });

//     it('F: backspace - start of line, should join with previous', () => {
//       vimCommandManager = new VimCommandManager(
//         cloneDeep(createVimState('123\n456'))
//       );
//       vimCommandManager.vimState.cursor = { col: 0, line: 1 };
//       vimCommandManager.enterInsertMode();
//       const result = vimCommandManager.executeVimCommand('backspace');
//       expect(result.text).toEqual('123456');
//       expect(result.cursor).toEqual({ col: 3, line: 0 });
//     });
//   });
// });
