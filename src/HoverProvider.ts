import { TextEditor, Point } from 'atom';

export interface HoverProvider {
  readonly Name: string;

  readonly Priority: number;

  Get$(textEditor: TextEditor, position: Point): Promise<(HTMLElement | String)[]>;
}
