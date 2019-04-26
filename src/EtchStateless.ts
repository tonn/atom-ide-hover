import etch from 'etch';

export function EtchStateless<Properties>(renderFunc: (props: Partial<Properties>, children: etch.EtchComponent<any>[]) => JSX.Element): ( new() => etch.EtchComponent<Properties> ) {
  class Stateless<Properties> implements etch.EtchComponent<Properties> {
    element: HTMLElement = undefined as any;
    properties: Properties = {} as Properties;

    constructor(props: Partial<Properties> = {}, public children: etch.EtchComponent<any>[] = []) {
      Object.assign(this.properties, props);

      etch.initialize(this);

      if (!this.element) throw new Error('element is not initialized');
    }

    render(): JSX.Element {
      return renderFunc(this.properties, this.children);
    }

    update(props: Partial<Properties>, children: etch.EtchComponent<any>[] = []): void {
      Object.assign(this.properties, props);
      this.children = children;

      etch.update(this);
    }

    destroy(): void {
      etch.destroy(this);
    }
  }

  return Stateless;
}
