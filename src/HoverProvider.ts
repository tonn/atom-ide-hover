import { TextEditor, Point } from 'atom';

export interface HoverProvider {
  Get$(textEditor: TextEditor, position: Point): Promise<(HTMLElement | String)[]>;
}
