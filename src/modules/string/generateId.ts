// let lastId = '';
let counter = 0;
export default function generateId(): string {
  let newId = Date.now().toString(25);
  // if (lastId === newId) {
  newId += counter++;
  // }
  // lastId = newId;

  return newId;
}
