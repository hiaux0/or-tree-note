export type Id = string;

export interface IApp {
  activeEditorId?: Id;
  todos: ITodo[];
  tags: ITag[];
  notes?: INote[];
}

export interface ITag {
  id: Id;
  label: string;
}

export interface ITodo {
  id: Id;
  content: string;
  tagIds?: ITag['id'][];
}

export interface INote {
  tags: ITag;
  backlinks: ITag['id'];
  editor: IEditor;
}

export interface IEditor {
  id: Id;
}
