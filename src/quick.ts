import { tokenizeInput } from 'modules/vim/modes/abstract-mode';

/* prettier-ignore */
const tokenizedInput = [
  { string: '123'   , start: 0  , end: 2  , index: 0 } ,
  { string: 'hello' , start: 4  , end: 8  , index: 1 } ,
  { string: 'world' , start: 10 , end: 14 , index: 2 } ,
  { string: 'what'  , start: 16 , end: 19 , index: 3 } ,
  { string: 'are'   , start: 21 , end: 23 , index: 4 } ,
  { string: 'we'    , start: 25 , end: 26 , index: 5 } ,
  { string: 'doing' , start: 28 , end: 32 , index: 6 } ,
];

const curCol = 15;
let previousIndex = 0;
for (let index = 0; index < tokenizedInput.length; index++) {
  const token = tokenizedInput[index];
  const previousToken = tokenizedInput[index - 1];
  if (!previousToken) continue;

  const isPrevious = curCol <= token.start && curCol >= previousToken.end;
  if (!isPrevious) continue;

  previousIndex = index - 1;
  break;
}
tokenizedInput[previousIndex]; /*?*/
