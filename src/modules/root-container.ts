import { inject, Container } from "aurelia-dependency-injection";
import { VimEditor } from "./vim-editor/vim-editor";
import { VimEditorTextMode } from "./vim-editor/vim-editor-text-mode";

export const rootContainer = new Container();
rootContainer.makeGlobal();
