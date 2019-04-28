import { HoverProvider } from './HoverProvider';

export class HoverProvidersRegistry {
  private _providers: HoverProvider[] = [];

  AddProvider(provider: HoverProvider): void {
    this._providers.push(provider);

    this._providers.sort((p1, p2) => (p2.Priority || 0) - (p1.Priority || 0));
  }

  get Providers(): ReadonlyArray<HoverProvider> {
    return this._providers;
  }
}

export const HoverProvidersRegistryInstance = new HoverProvidersRegistry();
