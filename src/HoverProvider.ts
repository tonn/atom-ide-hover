import { TextEditor, Point } from 'atom';

export interface HoverProvider {
  Get$(textEditor: TextEditor, position: Point, mouseEvent: MouseEvent): Promise<(HTMLElement | String)[]>;
}
