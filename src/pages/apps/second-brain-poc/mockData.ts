import { IApp } from '../../../domain/dataModel';
import generateId from '../../../modules/string/generateId';

export const mockData: IApp = {
  activeEditorId: '',
  todos: [
    { id: generateId(), content: '- [ ] report for what was done today' },
    { id: generateId(), content: '- [ ] connect todos' },
    { id: generateId(), content: '- [ ] add tags to todos' },
    { id: generateId(), content: '- [ ] autocomplete tags' },
    { id: generateId(), content: '- [ ] write a poc for second brain' },
    {
      id: generateId(),
      content: '- [ ] come up with way to enhance todo experience',
    },
  ],
  notes: [],
};
