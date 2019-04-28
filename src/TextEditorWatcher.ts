import { TextEditor, Disposable } from 'atom';
import { fromEvent, merge, Subject, bindCallback, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, map, scan, filter, startWith } from 'rxjs/operators';

import { FromAtomDisposable, CheckMouseInsideText } from './helpers';
import { PopupView } from './PopupView';

function isMouseMoveEvent(event: Event): event is MouseEvent {
  return event.type === 'mousemove';
}

function fromPopupViewHoverEvent(popup: PopupView) {
  const result = new Subject<boolean>();

  popup.properties.onHover = (hovered) => {
    result.next(hovered);
  };

  return result.asObservable();
}

export class TextEditorWatcher extends Disposable {
  private _destroyed$ = new Subject();
  private _popupView = new PopupView({ editor: this._textEditor });

  constructor (private _textEditor: TextEditor) {
    super();

    FromAtomDisposable(_textEditor.onDidDestroy.bind(_textEditor)).subscribe(() => this.dispose());

    const view = atom.views.getView(_textEditor);

    const mouseMove = fromEvent<MouseEvent>(view, 'mousemove');
    const mouseEnter = fromEvent<MouseEvent>(view, 'mouseenter');
    const mouseLeave = fromEvent<MouseEvent>(view, 'mouseleave');
    const keyDown = fromEvent<KeyboardEvent>(view, 'keydown');
    const popupHover = fromPopupViewHoverEvent(this._popupView).pipe(startWith(false));

    const mouseMoveNotInPopup = combineLatest(mouseMove, popupHover)
    .pipe(
      filter(([_, popupHovered]) => !popupHovered),
      map(([mouseMove]) => mouseMove)
    );

    const editorHover = merge(mouseEnter, mouseLeave)
    .pipe(
      map(event => event.type === 'mouseenter'),
      startWith(true)
    );

    let hidePopupTimeout: NodeJS.Timeout | undefined;
    const startHidePopupTimeout = () => {
      if (this._popupView.IsVisible && !hidePopupTimeout) {
        hidePopupTimeout = setTimeout(() => {
          this._popupView.Close();
          hidePopupTimeout = undefined;
        }, 250);
      }
    };

    const stopHidePopupTimeout = () => {
      if (hidePopupTimeout) {
        clearTimeout(hidePopupTimeout);
        hidePopupTimeout = undefined;
      }
    };

    const mouseStopInEditor = combineLatest(mouseMoveNotInPopup, editorHover, popupHover)
    .pipe(
      debounceTime(500), // TODO: take from config
      filter(([_, editorHover, popupHover]) => {
        console.log(editorHover, popupHover);
        return editorHover && !popupHover;
      }),
      map(([mouseMove]) => mouseMove)
    );

    // Showpopup
    mouseStopInEditor
    .pipe(takeUntil(this._destroyed$))
    .subscribe(event => {
      const component = view.getComponent();
      const screenPosition = component.screenPositionForMouseEvent(event);
      const bufferPosition = _textEditor.bufferPositionForScreenPosition(screenPosition);

      if (CheckMouseInsideText(component, screenPosition, event)) {
        this._popupView.update({ position: bufferPosition });
        stopHidePopupTimeout();
      }
    });

    // Hide popup
    merge(mouseLeave, keyDown)
    .pipe(takeUntil(this._destroyed$))
    .subscribe(() => {
      this._popupView.Close();
      stopHidePopupTimeout();
    });

    mouseMoveNotInPopup
    .pipe(takeUntil(this._destroyed$))
    .subscribe(() => startHidePopupTimeout());

    popupHover
    .pipe(takeUntil(this._destroyed$))
    .subscribe((hovered) => {
      if (hovered) {
        stopHidePopupTimeout();
      }
    });
  }

  disposalAction() {
    this._destroyed$.complete();
  }
}
