import { inject, Container } from "aurelia-dependency-injection";
import { VimEditor } from "./vim-editor/vim-editor";
import { VimEditorHtmlMode } from "./vim-editor/vim-editor-html-mode";

export const rootContainer = new Container();
rootContainer.makeGlobal();

rootContainer.registerSingleton(VimEditorHtmlMode, VimEditorHtmlMode);
rootContainer.registerSingleton(VimEditor, VimEditor);
