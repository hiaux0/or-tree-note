import { ObjectService } from '../../../../../src/modules/object/ObjectService';
import { AbstractMode } from '../../../../../src/modules/vim/modes/abstract-mode';
import { VIM_COMMAND } from '../../../../../src/modules/vim/vim-commands-repository';
import { VimStateClass } from '../../../../../src/modules/vim/vim-state';
import { VimMode } from '../../../../../src/modules/vim/vim-types';

const input = '012';
const cursor = { col: 1, line: 0 };

class TestingAbstractMode extends AbstractMode {}

describe('AbstractMode - paste', () => {
  const lines = input.split('\n').map((line) => ({ text: line }));
  let testingAbstractMode: AbstractMode;
  beforeEach(() => {
    const initialVimState = new VimStateClass({
      cursor,
      lines,
    });
    testingAbstractMode = new TestingAbstractMode(initialVimState);
  });

  it('1 line', async () => {
    const result = await testingAbstractMode.executeCommand(
      VIM_COMMAND['paste'],
      ['test'],
      VimMode.NORMAL
    );
    const expected = ObjectService.pick(result, ['lines', 'cursor']);
    expect(expected).toMatchSnapshot();
  });
  it('2 lines', async () => {
    const result = await testingAbstractMode.executeCommand(
      VIM_COMMAND['paste'],
      ['rs', 'st'],
      VimMode.NORMAL
    );
    const expected = ObjectService.pick(result, ['lines', 'cursor']);
    expect(expected).toMatchSnapshot();
  });
  it('3 lines', async () => {
    const result = await testingAbstractMode.executeCommand(
      VIM_COMMAND['paste'],
      ['rs', 'st', 'tu'],
      VimMode.NORMAL
    );
    const expected = ObjectService.pick(result, ['lines', 'cursor']);
    expect(expected).toMatchSnapshot();
  });
});
