import { TextEditor, Disposable, Decoration } from 'atom';
import { fromEvent, merge, Subject } from 'rxjs';
import { takeUntil, debounceTime, map } from 'rxjs/operators';

import { FromAtomDisposable, CheckMouseInsideText } from './helpers';
import { PopupView } from './PopupView';

export class TextEditorWatcher extends Disposable {
  private _destroyed$ = new Subject();
  private _popupView = new PopupView({ editor: this._textEditor });

  constructor (private _textEditor: TextEditor) {
    super();

    FromAtomDisposable(_textEditor.onDidDestroy.bind(_textEditor)).subscribe(() => this.dispose());

    const view = atom.views.getView(_textEditor);

    merge(fromEvent<MouseEvent>(view, 'mousemove'),
          fromEvent<MouseEvent>(view, 'mouseleave'))
    .pipe(
      takeUntil(this._destroyed$),
      debounceTime(500) // TODO: take from config
    )
    .subscribe(mouseEvent => {
      if (mouseEvent.type === 'mouseleave') {
        return;
      }

      const component = view.getComponent();
      const position = component.screenPositionForMouseEvent(mouseEvent);

      if (CheckMouseInsideText(component, position, mouseEvent)) {
        const point = _textEditor.bufferPositionForScreenPosition(position);

        const marker = _textEditor.markBufferPosition(point, { invalidate: 'never' });

        this._popupView.update({ marker, position: point, mouseEvent });

        const decoration = _textEditor.decorateMarker(marker, {
          type: 'overlay',
          class: 'datatip-overlay',
          position: 'tail',
          item: this._popupView.element
        });

        merge(fromEvent(this._popupView.element, 'mouseenter'),
              fromEvent(this._popupView.element, 'mouseleave'))
        .pipe(
          debounceTime(500)
        )
        .subscribe((lastEvent: Event) => {
          if (lastEvent.type === 'mouseleave') {
            decoration.destroy();
            marker.destroy();
          }
        });
      }
    });
  }

  disposalAction() {
    this._destroyed$.complete();
  }
}
