declare module 'etch' {
  export function dom(... args: any[]): any;
  export function render(... args: any[]): any;
  export function initialize(component: EtchComponent<any>): void;
  export function update(... args: any[]): any;
  export function updateSync(... args: any[]): Promise<void>;
  export function destroy(... args: any[]): any;
  export function destroySync(... args: any[]): any;
  export function setScheduler(... args: any[]): any;
  export function getScheduler(... args: any[]): any;

  export interface EtchComponent<Properties> {
    // element: HTMLElement;
    // properties: PropertiesType;
    // children: EtchComponent<any>[];

    render(): JSX.Element; // Etch is not supported empty

    update(props: Partial<Properties>, children: EtchComponent<any>[]): void;

    destroy(): void | Promise<any>;
  }
}

declare namespace JSX {
  interface Element { }
  interface IntrinsicElements { div: any; }
}
