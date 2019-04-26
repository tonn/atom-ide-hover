import { DisplayMarker, TextEditor, Point } from 'atom';
import etch from 'etch';

import { Timeout$, IsString } from './helpers';
import { InfinityProgress } from './InfinityProgress.component';
import { HoverProvidersRegistryInstance } from './HoverProvidersRegistry';
import { EtchStateless } from './EtchStateless';
import { EtchComponentBase } from './EtchComponentBase';
import './array.extend';
import { HtmlStringView } from './HtmlStringView';

interface PopupViewProperties {
  marker?: DisplayMarker;
  editor: TextEditor;
  position?: Point;
  mouseEvent?: MouseEvent;
}

export class PopupView extends EtchComponentBase<PopupViewProperties> {
  private _showProgress = false;
  private _popupItems: (HTMLElement | String)[] = [];

  constructor(props: Partial<PopupViewProperties> = {}, children: etch.EtchComponent<any>[] = []) {
    super(props, children);
    Object.assign(this.properties, props);

    etch.initialize(this);

    if (!this.element) throw new Error('element is not initialized');
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
    if (IsString(item)) {
      return <HtmlStringView html={item} />;
    }

    return '';
  }

  private renderItems() {
    return this._popupItems ? this._popupItems.map(item => this.renderItem(item)) : '';
  }

  private _refreshes$: Promise<(HTMLElement | String)[]>[] = [];

  private async refreshHoverProviders$() {
    if (!this.properties.position || !this.properties.mouseEvent) {
      return;
    }

    const position = this.properties.position;
    const mouseEvent = this.properties.mouseEvent;

    const otherRefreshRunning = this._refreshes$.length > 0;

    await this.showProgress$(async () => {
      this._refreshes$.push(
        Promise.all(
          HoverProvidersRegistryInstance.Providers.map(provider => provider.Get$(this.properties.editor, position, mouseEvent))
        )
        .then(result => result.flatMap(v => v))
      );

      if (!otherRefreshRunning) {
        let result: (HTMLElement | String)[] = [];

        for (let promise of this._refreshes$) {
          result = await promise;
        }

        this._popupItems = result;

        this._refreshes$ = [];

        await etch.update(this);
      }

    });
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

  update(props: Partial<PopupViewProperties> = {}, children: etch.EtchComponent<any>[] = []) {
    Object.assign(this.properties, props);
    this.children = children;

    this._showProgress = true;

    this.refreshHoverProviders$();

    etch.update(this);
  }
}
