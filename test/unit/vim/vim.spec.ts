// import { cloneDeep } from 'lodash';
// import { Vim } from 'modules/vim/vim';
// import { Cursor, VimPlugin } from 'modules/vim/vim.types';

// const input = ['foo'];
// const cursor: Cursor = { line: 0, col: 0 };
// let vim: Vim;

// /** ***********/
// /** Methods   */
// /** ***********/

// describe('Methods', () => {
//   beforeEach(() => {
//     vim = new Vim(cloneDeep(input), cloneDeep(cursor));
//   });

//   describe('#queueInput', () => {
//     it('F: Single Input', () => {
//       vim.enterInsertMode();
//       const result = vim.queueInputSequence('@');
//       expect(result).toEqual([
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'type',
//           lines: ['@foo'],
//         },
//       ]);
//     });
//   });

//   describe('#queueInputSequence', () => {
//     it('F: Input sequence - string', () => {
//       vim.enterInsertMode();
//       const result = vim.queueInputSequence('@<esc>l');
//       expect(result).toEqual([
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'type',
//           lines: ['@foo'],
//         },
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'enterNormalMode',
//           lines: ['@foo'],
//         },
//         {
//           vimState: { cursor: { col: 2, line: 0 }, text: '@foo' },
//           targetCommand: 'cursorRight',
//           lines: ['@foo'],
//         },
//       ]);
//     });
//     it('F: Input sequence - string - multiple typing', () => {
//       vim.enterInsertMode();
//       const result = vim.queueInputSequence('@#<esc>l');
//       expect(result).toEqual([
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'type',
//           lines: ['@foo'],
//         },
//         {
//           vimState: { cursor: { col: 2, line: 0 }, text: '@#foo' },
//           targetCommand: 'type',
//           lines: ['@#foo'],
//         },
//         {
//           vimState: { cursor: { col: 2, line: 0 }, text: '@#foo' },
//           targetCommand: 'enterNormalMode',
//           lines: ['@#foo'],
//         },
//         {
//           vimState: { cursor: { col: 3, line: 0 }, text: '@#foo' },
//           targetCommand: 'cursorRight',
//           lines: ['@#foo'],
//         },
//       ]);
//     });

//     it('F: Input sequence - string[]', () => {
//       vim.enterInsertMode();
//       const result = vim.queueInputSequence(['@', '<esc>', 'l']);
//       expect(result).toEqual([
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'type',
//           lines: ['@foo'],
//         },
//         {
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           targetCommand: 'enterNormalMode',
//           lines: ['@foo'],
//         },
//         {
//           vimState: { cursor: { col: 2, line: 0 }, text: '@foo' },
//           targetCommand: 'cursorRight',
//           lines: ['@foo'],
//         },
//       ]);
//     });

//     //
//     const input = 'i@#<esc>e';
//     it(`Sequence: ${input}`, () => {
//       const result = vim.queueInputSequence(input);
//       expect(result).toEqual([
//         {
//           targetCommand: 'enterInsertMode',
//           vimState: { cursor: { col: 0, line: 0 }, text: 'foo' },
//           lines: ['foo'],
//         },
//         {
//           targetCommand: 'type',
//           vimState: { cursor: { col: 1, line: 0 }, text: '@foo' },
//           lines: ['@foo'],
//         },
//         {
//           targetCommand: 'type',
//           vimState: { cursor: { col: 2, line: 0 }, text: '@#foo' },
//           lines: ['@#foo'],
//         },
//         {
//           targetCommand: 'enterNormalMode',
//           vimState: { cursor: { col: 2, line: 0 }, text: '@#foo' },
//           lines: ['@#foo'],
//         },
//         {
//           targetCommand: 'cursorWordForwardEnd',
//           vimState: { cursor: { col: 4, line: 0 }, text: '@#foo' },
//           lines: ['@#foo'],
//         },
//       ]);
//     });
//   });
// });

// /** ************/
// /** Vim Plugin */
// /** ************/

// describe('C: Vim Plugin', () => {
//   it('F: Execute plugin', () => {
//     const plugin: VimPlugin = {
//       commandName: 'toggleCheckbox',
//       execute: () => {},
//     };
//     vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
//       vimPlugins: [plugin],
//     });
//     spyOn(plugin, 'execute');
//     const result = vim.queueInput('<Space>tc');
//     expect(result.targetCommand).toBe('toggleCheckbox');
//     expect(plugin.execute).toHaveBeenCalled();
//   });
//   it('F: Execute plugin - modify vimState', () => {
//     const plugin: VimPlugin = {
//       commandName: 'toggleCheckbox',
//       execute: (vimState, commandInput) => {
//         vimState.text = commandInput;
//         return vimState;
//       },
//     };
//     vim = new Vim(cloneDeep(input), cloneDeep(cursor), {
//       vimPlugins: [plugin],
//     });
//     //
//     const inputValue = '<Space>tc';
//     const result = vim.queueInput(inputValue);
//     expect(result.vimState.text).toBe(inputValue); // Because in the test we set the `text` to be the command
//   });
// });
