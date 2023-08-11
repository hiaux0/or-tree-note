export type Id = string;

export interface IApp {
  activeEditorId: Id;
  todos: ITodo[];
  notes: INote[];
}

export interface ITag {
  id: Id;
  label: string;
}

export interface ITodo {
  id: Id;
  content: string;
  tags?: ITag[];
}

export interface INote {
  tags: ITag;
  backlinks: ITag['id'];
  editor: IEditor;
}

export interface IEditor {
  id: Id;
}
