import { includes } from 'lodash';

const first = {
  hi: '1',
  bye: '2',
};
const second = {
  hi: '1',
  bye: '2',
};

const collection = [first];
includes(collection, second); /* ? */
