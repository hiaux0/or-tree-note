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
