import { ITag, ITodo, Id } from '../../../domain/dataModel';
import { TagService } from './TagService';

export class TodoService {
  private readonly allTagsIds: ITag[] = [];
  private readonly tagService: TagService;

  constructor(private readonly todos: ITodo[], allTags: ITag[]) {
    // this.allTagsIds = this.hydrateTags();
    this.tagService = TagService.create(allTags);
  }

  getTodo(todoId): ITodo {
    const target = this.todos.find((todo) => todo.id === todoId);
    return target;
  }

  getTodosByTagid(tagId: ITag['id']): ITodo[] {
    const filtered = this.todos.filter((todo) => {
      const targetTodo = todo.tagIds?.includes(tagId);
      return targetTodo;
    });

    return filtered;
  }

  addTodo(todo: ITodo): void {
    this.todos.push(todo);
  }

  getAllTagIds(): ITag[] {
    return this.allTagsIds;
  }

  getTagById(tagId: ITag['id']): ITag {
    const target = this.tagService.getTagById(tagId);
    return target;
  }

  addTag(todoId: Id, content: string) {
    const todo = this.getTodo(todoId);

    if (!todo) return;
    if (!todo.tagIds) todo.tagIds = [];

    const newTag = this.tagService.createTag(content);
    if (!newTag) return;
    this.tagService.addTag(newTag);
    const unique = new Set(todo.tagIds);
    unique.add(newTag.id);
    todo.tagIds = Array.from(unique);
    const allTags = this.tagService.getAllTag();
    return allTags;
  }

  removeTag(todoId: string, removeTagId: string): ITodo[] {
    const todo = this.getTodo(todoId);

    const withRemovedTagIds = todo.tagIds.filter(
      (tagId) => tagId !== removeTagId
    );
    todo.tagIds = withRemovedTagIds;

    return this.todos;
  }

  hydrateTags(): ITag[] {
    const rawTags = [];
    this.todos.forEach((todo) => {
      rawTags.push(...todo.tagIds);
    });
    const tags = Array.from(rawTags) as ITag[];
    return tags;
  }
}
