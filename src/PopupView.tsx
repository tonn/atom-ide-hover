import { DisplayMarker, TextEditor, Point, Decoration } from 'atom';
import etch from 'etch';
import { fromEvent, merge } from 'rxjs';

import { Timeout$, IsString, IsHTMLElement } from './helpers';
import { InfinityProgress } from './InfinityProgress.component';
import { HoverProvidersRegistryInstance } from './HoverProvidersRegistry';
import { EtchComponentBase } from './EtchComponentBase';
import './array.extend';
import { HtmlStringView } from './HtmlStringView';

export interface HTMLElementViewProperties {
  Element: HTMLElement;
}

export class HTMLElementView extends EtchComponentBase<HTMLElementViewProperties> {
  constructor(props: Partial<HTMLElementViewProperties>) {
    super();

    if (props.Element) {
      this.element.appendChild(props.Element);
    }
  }

  render(): JSX.Element {
    return (
      <div>
      </div>
    );
  }
}

interface PopupViewProperties {
  editor: TextEditor;
  position?: Point;
  onHover?: (hovered: boolean) => void;
}

export class PopupView extends EtchComponentBase<PopupViewProperties> {
  private _showProgress = false;
  private _popupItems: (HTMLElement | String)[] = [];

  private _marker: DisplayMarker | undefined;
  private _decoration: Decoration | undefined;

  constructor(props: Partial<PopupViewProperties> = {}, children: etch.EtchComponent<any>[] = []) {
    super(props, children);
    Object.assign(this.properties, props);

    etch.initialize(this);

    if (!this.element) throw new Error('element is not initialized');

    // Make onHover event
    merge(fromEvent(this.element, 'mouseenter'),
          fromEvent(this.element, 'mouseleave'))
    .subscribe((lastEvent: Event) => {
      let hovered = false;

      if (lastEvent.type === 'mouseleave') {
        hovered = false;
      } else if (lastEvent.type === 'mouseenter') {
        hovered = true;
      }

      if (this.properties.onHover) {
        this.properties.onHover(hovered);
      }
    });
  }

  private async showProgress$<T>(asyncAction: () => Promise<T>): Promise<T> {
    const minimumProgressVisualTime$ = Timeout$(1000);

    try {
      this._showProgress = true;

      etch.update(this);

      return await asyncAction();
    } finally {
      await minimumProgressVisualTime$;

      this._showProgress = false;

      etch.update(this);
    }
  }

  private renderProgress() {
    return this._showProgress ? <InfinityProgress key={'progress'} /> : '';
  }

  private renderItem(item: HTMLElement | String) {
    let result: JSX.Element = <div />;

    if (IsString(item)) {
      result = <HtmlStringView html={item} />;
    } else if (IsHTMLElement(item)) {
      result = <HTMLElementView Element={item} />;
    }

    return <div class='PopupView__Item'>{result}</div>;
  }

  private renderItems() {
    return this._popupItems ? this._popupItems.map(item => this.renderItem(item)) : '';
  }

  private _refreshInProcess: boolean = false;
  private _needRefreshAgain: boolean = false;

  private async refreshHoverProviders$() {
    const { position, editor } = this.properties;

    if (!position) {
      return;
    }

    if (this._refreshInProcess) {
      this._needRefreshAgain = true;
      return;
    }

    this._refreshInProcess = true;

    const result: (String | HTMLElement)[] = [];

    for (const provider of HoverProvidersRegistryInstance.Providers) {
      result.push(... await provider.Get$(editor, position));
    }

    this._popupItems = result;

    await etch.update(this);

    this._refreshInProcess = false;

    if (this._needRefreshAgain) {
      this._needRefreshAgain = false;
      await this.refreshHoverProviders$();
    }
  }

  private renderEmpty() {
    if (!this._popupItems || this._popupItems.length === 0) {
      return (
        <div className='PopupView__Empty'>
          { this._showProgress ? 'Wait... :)' : 'Nothing to show :(' }
        </div>
      );
    } else {
      return '';
    }
  }

  private onMouseWheelHandler(event: MouseEvent) {
    event.stopPropagation();
  }

  render(): JSX.Element {
    return (
      <div className='PopupView' onmousewheel={this.onMouseWheelHandler}>
        {this.renderItems()}
        {this.renderEmpty()}
        {this.renderProgress()}
      </div>
    );
  }

  updateDecoration() {
    if (this.properties.position) {
      this.Close();

      this._marker = this.properties.editor.markBufferPosition(this.properties.position, { invalidate: 'never' });
      this._decoration = this.properties.editor.decorateMarker(this._marker, {
        type: 'overlay',
        class: 'datatip-overlay',
        position: 'tail',
        item: this.element
      });
    }
  }

  update(props: Partial<PopupViewProperties> = {}, children: etch.EtchComponent<any>[] = []) {
    if (props.editor) {
      throw Error('PopupView editor changing is dissalowed');
    }

    const oldPosition = this.properties.position;

    Object.assign(this.properties, props);
    this.children = children;

    if (props.position && props.position !== oldPosition) {
      this.updateDecoration();

      this.showProgress$(async () => {
        await this.refreshHoverProviders$();
      });
    }

    etch.update(this);
  }

  Close() {
    if (this._marker) {
      this._marker.destroy();
      this._marker = undefined;
    }

    if (this._decoration) {
      this._decoration.destroy();
      this._decoration = undefined;
    }

    if (this.properties.onHover) {
      this.properties.onHover(false);
    }

    this._popupItems = [];
  }

  get IsVisible(): boolean {
    return !!this._decoration;
  }

  focus() {
    this.element.focus();
  }
}
