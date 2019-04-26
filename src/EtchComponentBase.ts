import etch from 'etch';

export abstract class EtchComponentBase<Properties> implements etch.EtchComponent<Properties> {
  element: HTMLElement = undefined as any;
  properties: Properties = {} as Properties;
  children: etch.EtchComponent<any>[] = [];

  constructor(props: Partial<Properties> = {}, children: etch.EtchComponent<any>[] = []) {
    Object.assign(this.properties, props);
    this.children = children;

    etch.initialize(this);

    if (!this.element) throw new Error('element is not initialized');
  }

  abstract render(): JSX.Element;

  update(props: Partial<Properties>, children: etch.EtchComponent<any>[] = []): void {
    Object.assign(this.properties, props);
    this.children = children;

    etch.update(this);
  }

  destroy(): void {
    etch.destroy(this);
  }
}
