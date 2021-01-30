export function insert(str: string, index: number, value: string): string {
  var ind = index < 0 ? this.length + index : index;
  return str.substr(0, ind) + value + str.substr(ind);
}

export function replaceAt(str: string, index: number, char: string) {
  if (char == "") {
    return str.slice(0, index) + str.substring(index + 1 + char.length);
  } else {
    return (
      str.substring(0, index) + char + str.substring(index + 1, str.length)
    );
  }
}

/**
 * @param {string} input
 *
 * @example
 * input // what i t
 * padWithRegexWildCard(input) // w.*h.*a.*t.* .*i.* .*t.*
 */
function padWithRegexWildCard(input: string) {
  /** TODO SUPPORT FOR ? */
  // const edgeCaseList = ['?'];

  const splitByChar = input.split("");
  const withWildCard = splitByChar.join(".*");
  return withWildCard + ".*";
}

/**
 * @example
 * inputList ['foo', 'faz', 'flo']
 * value 'fo'
 * --> ['foo', 'flo']
 */
function fuzzySearch(inputList: string[], value: string) {
  const wildCardValue = padWithRegexWildCard(value);
  const fileredList = inputList.filter((input) => {
    const ignoreCase = input.toLowerCase();
    const searchRegex = new RegExp(`${wildCardValue}`);
    return searchRegex.exec(ignoreCase);
  });
  return fileredList;
}

/**
 * @example
 * inputList = ['foo', 'for', 'faz', 'flo', 'z']
 *
 * ## Example 1
 * value = 'fo'
 * --> ['foo', 'for']
 *
 * ## Example 2
 * value = 'z'
 * --> ['z']
 */
export function filterListByCharSequence(inputList: string[], value: string) {
  const result = inputList.filter((input) => {
    return filterStringByCharSequence(input, value);
  });

  return result;
}

/**
 * @example
 *
 * ## Example 1
 * input = 'foo'
 * value = 'fo'
 * --> false
 *
 * ## Example 2
 * input = 'z'
 * value = 'z'
 * --> true
 */
export function filterStringByCharSequence(input: string, value: string) {
  const regex = new RegExp(`^${escapeRegex(value)}`);
  const execedRegex = regex.exec(input);

  if (Array.isArray(execedRegex)) {
    const hasMatch = !!execedRegex[0];
    return hasMatch;
  }

  return execedRegex !== null;
}

function escapeRegex(string) {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
