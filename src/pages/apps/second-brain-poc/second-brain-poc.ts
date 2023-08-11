import { bindable } from 'aurelia-framework';
import './second-brain-poc.scss';
import hotkeys from 'hotkeys-js';

import { INote, ITag, ITodo, Id } from '../../../domain/dataModel';
import { COLORS } from '../../../ui/colors';
import { mockData } from './mockData';
import { TodoService } from './TodoService';

type InputValueMap<T extends Id = string> = Record<T, string>;

export class SecondBrainPoc {
  @bindable value = 'SecondBrainPoc';

  todos: ITodo[];
  notes: INote[];
  COLORS = COLORS;

  private todoService: TodoService;
  private readonly tagValueMap: InputValueMap<ITag['id']> = {};

  attached() {
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 't') console.log(this.tagValueMap);
    });

    this.notes = mockData.notes;
    this.todos = mockData.todos;

    this.todoService = new TodoService(this.todos);

    this.initHotkeys();
  }

  initHotkeys() {
    hotkeys('ctrl+s', (event) => {
      event.preventDefault();
    });
  }

  addTag(event: KeyboardEvent, todoId: string): void {
    if (event.key !== 'Enter') return;

    const content = this.tagValueMap[todoId];
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: second-brain-poc.ts:36 ~ content:', content);
    this.todoService.addTag(todoId, content);
  }
}
