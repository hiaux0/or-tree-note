import {
  filterListByCharSequence,
  getFirstNonWhiteSpaceCharIndex,
  inputContainsSequence,
  replaceAt,
} from '../../../src/modules/string/string';

describe('replaceAt', () => {
  it('replace at 1', () => {
    // replaceAt();
  });
});

describe('filterListByCharSequence', () => {
  const inputList = ['foo', 'for', 'faz', 'flo', 'z', 'ga'];

  it('Should return multiple items', () => {
    expect(filterListByCharSequence(inputList, 'fo')).toEqual(['foo', 'for']);
  });
  it('Should return one result - 1', () => {
    expect(filterListByCharSequence(inputList, 'z')).toEqual(['z']);
  });
  it('Should return one result - 2', () => {
    expect(filterListByCharSequence(inputList, 'ga')).toEqual(['ga']);
  });
});

describe('filterStringByCharSequence', () => {
  it('Should return one result - 1', () => {
    const input = 'z';
    expect(inputContainsSequence(input, 'z')).toBeTrue();
  });
  it('Should return one result - 2', () => {
    const input = 'foo';
    expect(inputContainsSequence(input, 'fo')).toBeTrue();
  });
  it('Should not return when no match', () => {
    const input = 'bar';
    expect(inputContainsSequence(input, 'br')).toBeFalse();
  });
});

describe('getFirstNonWhiteSpaceCharIndex', () => {
  it('Should return 0, if input is empty', () => {
    const input = '';
    const result = getFirstNonWhiteSpaceCharIndex(input);
    expect(result).toBe(0);
  });
  it('Should return 0, if string does not start with whitespace', () => {
    const input = 'foo';
    const result = getFirstNonWhiteSpaceCharIndex(input);
    expect(result).toBe(0);
  });

  it('Should return index of first non-whitespace char, if string starts with whitespace', () => {
    const input = `${' '.repeat(1)}foo`;
    const result = getFirstNonWhiteSpaceCharIndex(input);
    expect(result).toBe(1);

    const input1 = '    foo';
    const result1 = getFirstNonWhiteSpaceCharIndex(input1);
    expect(result1).toBe(4);
  });
});
