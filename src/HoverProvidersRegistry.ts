import { HoverProvider } from './HoverProvider';

export class HoverProvidersRegistry {
  private _providers: HoverProvider[] = [];

  AddProvider(provider: HoverProvider): void {
    this._providers.push(provider);
  }

  get Providers(): ReadonlyArray<HoverProvider> {
    return this._providers;
  }
}

export const HoverProvidersRegistryInstance = new HoverProvidersRegistry();
