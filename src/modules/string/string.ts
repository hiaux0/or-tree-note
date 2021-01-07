export function insert(str: string, index: number, value: string): string {
  var ind = index < 0 ? this.length + index : index;
  return str.substr(0, ind) + value + str.substr(ind);
}
