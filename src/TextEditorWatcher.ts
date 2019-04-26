import { TextEditor, Disposable } from 'atom';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, debounceTime, bufferTime, map, scan } from 'rxjs/operators';

import { FromAtomDisposable, CheckMouseInsideText } from './helpers';
import { PopupView } from './PopupView';

function isMouseMoveEvent(event: Event): event is MouseEvent {
  return event.type === 'mousemove';
}

export class TextEditorWatcher extends Disposable {
  private _destroyed$ = new Subject();
  private _popupView = new PopupView({ editor: this._textEditor });

  constructor (private _textEditor: TextEditor) {
    super();

    FromAtomDisposable(_textEditor.onDidDestroy.bind(_textEditor)).subscribe(() => this.dispose());

    const view = atom.views.getView(_textEditor);

    const mouseMove = fromEvent<MouseEvent>(view, 'mousemove');
    const mouseStop = mouseMove.pipe(debounceTime(500)); // TODO: take from config
    const mouseLeave = fromEvent<MouseEvent>(view, 'mouseleave');
    const keyDown = fromEvent<KeyboardEvent>(view, 'keydown');

    merge(mouseStop, mouseLeave, keyDown)
    .pipe(takeUntil(this._destroyed$))
    .subscribe(event => {
      if (event.type === 'mouseleave' || event.type === 'keydown') {
        this._popupView.Close();
        return;
      }

      if (isMouseMoveEvent(event)) {
      const component = view.getComponent();
        const screenPosition = component.screenPositionForMouseEvent(event);
        const bufferPosition = _textEditor.bufferPositionForScreenPosition(screenPosition);

        if (CheckMouseInsideText(component, screenPosition, event)) {
          this._popupView.update({ position: bufferPosition });
          }
      }
    });

    merge(mouseLeave, keyDown)
    .pipe(takeUntil(this._destroyed$))
    .subscribe(() => {
      this._popupView.Close();
    });
  }

  disposalAction() {
    this._destroyed$.complete();
  }
}
