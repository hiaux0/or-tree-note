import { bindable } from 'aurelia-framework';
import './second-brain-poc.scss';
import hotkeys from 'hotkeys-js';
import rangy from 'rangy';

import { Logger } from '../../../common/logging/logging';
import { IApp, INote, ITag, ITodo, Id } from '../../../domain/dataModel';
import { findParentElement } from '../../../modules/dom/dom';
import generateId from '../../../modules/string/generateId';
import { StorageService } from '../../../storage/StorageService';
import { COLORS } from '../../../ui/colors';
import { mockData } from './mockData';
import { TodoService } from './TodoService';

type InputValueMap<T extends Id = string> = Record<T, string>;

const appState: IApp = {
  todos: mockData.todos,
  tags: mockData.tags,
};
const storage = StorageService.create<IApp>('secondBrainPoc', appState);

const logger = new Logger('second-brain-poc');

interface State {
  selectionContent: string | undefined;
  selectedTagIds: Id[];
  activeTodoId: Id | undefined;
  newTodo: string | undefined;
}

export class SecondBrainPoc {
  @bindable value = 'SecondBrainPoc';

  COLORS = COLORS;

  private todoService: TodoService;
  private readonly tagValueMap: InputValueMap<ITag['id']> = {};
  private appState = appState;
  private filteredTodos: ITodo[] = [];

  private readonly componentState: State = {
    selectionContent: undefined,
    selectedTagIds: [],
    activeTodoId: undefined,
    newTodo: undefined,
  };

  async attached() {
    const existing = await storage.get();
    this.appState = existing;
    this.filteredTodos = this.filterTodosByTags(this.appState.todos);

    this.todoService = new TodoService(this.appState.todos, this.appState.tags);

    this.initKeyboard();
    this.initMouse();
  }

  hydrateTags(todos: ITodo[]): ITag[] {
    const rawTags = [];
    todos.forEach((todo) => {
      rawTags.push(...todo.tagIds);
    });
    const tags = Array.from(rawTags) as ITag[];
    return tags;
  }

  initMouse() {
    document.addEventListener('mousedown', (ev) => {
      this.setTodoContainer(ev);
    });
  }

  setTodoContainer(ev: MouseEvent) {
    const target = ev.target as HTMLElement;
    const $todoContainer = findParentElement(target, (element) => {
      const id = element.dataset.todoId;
      return !!id;
    });

    if (!$todoContainer) return;

    this.componentState.activeTodoId = $todoContainer.dataset.todoId;
  }

  initKeyboard() {
    hotkeys('ctrl+s', (event) => {
      event.preventDefault();

      void storage.save(this.appState);
      this.log('saved');
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'a') this.addTagFromSelection();
      if (ev.key === 'c') console.clear();
      if (ev.key === 't') console.log(this.tagValueMap);
    });

    document.addEventListener('selectionchange', () => {
      try {
        const selections = rangy.getSelection();
        const range = selections.getRangeAt(0);
        this.componentState.selectionContent = range.toString();
      } catch (error) {
        //
      }
    });
  }

  filterTodosByTags(todos: ITodo[]): ITodo[] {
    if (this.componentState.selectedTagIds.length === 0) {
      return this.appState.todos;
    }

    const filtered = todos.filter((todo) => {
      const result = todo.tagIds?.find((todoTagId) => {
        const okay = this.componentState.selectedTagIds.includes(todoTagId);
        return okay;
      });
      return result;
    });
    return filtered;
  }

  addTodo(newTodoContent: string, event?: KeyboardEvent): void {
    if (event?.key !== 'Enter') return;

    const newTodo: ITodo = {
      content: newTodoContent,
      id: generateId(),
    };
    this.appState.todos.splice(0, 0, newTodo);

    this.componentState.newTodo = undefined;
  }

  addTag(todoId: string, event?: KeyboardEvent): void {
    if (event?.key !== 'Enter') return;

    const content = this.tagValueMap[todoId];
    this.todoService.addTag(todoId, content);
  }

  addTagFromSelection() {
    const todoId = this.componentState.activeTodoId;

    const allTags = this.todoService.addTag(
      todoId,
      this.componentState.selectionContent
    );
    this.appState.tags = allTags;
  }

  removeTag(todoId: string, tagId: Id): void {
    const todosWithTagId = this.todoService.getTodosByTagid(tagId);
    if (todosWithTagId.length < 2) {
      const updateGlobalTags = this.appState.tags.filter(
        (tag) => tag.id !== tagId
      );
      this.appState.tags = updateGlobalTags;
    }

    const updatedTodos = this.todoService.removeTag(todoId, tagId);
    this.appState.todos = [...updatedTodos];
  }

  toggleTag(tagId: ITag['id']): void {
    if (this.componentState.selectedTagIds.includes(tagId)) {
      this.componentState.selectedTagIds =
        this.componentState.selectedTagIds.filter(
          (selectedTagId) => selectedTagId !== tagId
        );

      this.filteredTodos = this.filterTodosByTags(this.appState.todos);
      return;
    }

    const tempSelected = new Set(this.componentState.selectedTagIds);
    tempSelected.add(tagId);
    this.componentState.selectedTagIds = Array.from(tempSelected);

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: second-brain-poc.ts:165 ~ this.appState.todos:', this.appState.todos);
    this.filteredTodos = this.filterTodosByTags(this.appState.todos);
  }

  private log(message: string) {
    logger.culogger.debug([message], { logLevel: 'DEBUG', log: true });
  }

  private clearStorage(): void {
    void storage.clear();
    window.location.reload();
  }
}

/**
 * Don't duplicate tags
 */
