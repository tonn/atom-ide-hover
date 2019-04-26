import { CompositeDisposable, TextEditor } from 'atom';
import { Subject } from 'rxjs';
import etch from 'etch';

import { TextEditorWatcher } from './TextEditorWatcher';
import { HoverProvidersRegistryInstance, HoverProvidersRegistry } from './HoverProvidersRegistry';

class Main {
  private readonly _destroyed$ = new Subject();
  private readonly _subscriptions = new CompositeDisposable();

  activate(): void {
    etch.setScheduler(atom.views);

    this._subscriptions.add(
      atom.commands.add('atom-workspace', {
        // 'ide-hover:hello-world': () => this.helloWorld()
      }),

      atom.workspace.observeTextEditors(editor => this.watchEditor(editor))
    );
  }

  deactivate(): void {
    this._destroyed$.complete();

    this._subscriptions.dispose();
  }

  private watchEditor(editor: TextEditor): void {
    this._subscriptions.add(new TextEditorWatcher(editor));
  }

  ProvideHoverProvidersRegistry(): HoverProvidersRegistry {
    console.log('ProvideHoverProvidersRegistry');

    return HoverProvidersRegistryInstance;
  }
}

module.exports = new Main();
