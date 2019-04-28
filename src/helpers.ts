import { DisposableLike, TextEditorComponent, Point } from 'atom';
import { Observable } from 'rxjs';

export function FromAtomDisposable(subscribeCallbackFn: (callback: (...args: any[]) => void) => DisposableLike): Observable<any[]> {
  return new Observable(observer => {
    const disposable = subscribeCallbackFn((...args) => observer.next(args));

    return () => disposable.dispose();
  });
}

export function CheckMouseInsideText(component: TextEditorComponent, screenPosition: Point, event: MouseEvent): boolean {
  // the screen position returned here is always capped to the max width of the text in this row
  // the coordinates below represent X and Y positions on the screen of where the mouse event
  // occured and where the capped screenPosition is located
  const coordinates = {
    mouse: component.pixelPositionForMouseEvent(event),
    screen: component.pixelPositionForScreenPosition(screenPosition),
  };

  const distance = Math.abs(coordinates.mouse.left - coordinates.screen.left);

  // If the distance between the coordinates is greater than the default character width, it
  // means the mouse event occured quite far away from where the text ends on that row.
  return distance <= 10;
}

export function Timeout$(duration: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}

export function IsString(x: any): x is string {
  return typeof x === 'string';
}

export function IsHTMLElement(x: any): x is HTMLElement {
  return 'addEventListener' in x;
}
