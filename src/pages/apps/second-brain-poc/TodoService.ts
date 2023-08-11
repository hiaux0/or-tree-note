import { ITodo, Id } from '../../../domain/dataModel';
import { TagService } from './TagService';

export class TodoService {
  constructor(private readonly todos: ITodo[]) {}

  getTodo(todoId): ITodo {
    const target = this.todos.find((todo) => todo.id === todoId);
    return target;
  }

  addTodo(todo: ITodo): void {
    this.todos.push(todo);
  }

  addTag(todoId: Id, content: string) {
    const todo = this.getTodo(todoId);

    if (!todo.tags) todo.tags = [];

    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: TodoService.ts:18 ~ todo:', todo);
    const tagService = TagService.create(todo.tags);
    const newTag = tagService.createTag(content);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: TodoService.ts:21 ~ newTag:', newTag);
    tagService.addTag(newTag);
    /* prettier-ignore */ console.log('>>>> _ >>>> ~ file: TodoService.ts:25 ~ todo.tags.length:', todo.tags.length);
  }
}
