import { VimMode } from "../vim";
import { AbstractMode } from "./modes";

export class NormalMode extends AbstractMode {
  activeMode = VimMode.NORMAL;
}
