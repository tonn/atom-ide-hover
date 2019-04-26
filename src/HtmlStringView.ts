import purify from 'dompurify';

/**
 * An etch hack-component that can host already prepared HTML text
 */
export class HtmlStringView {
  element: HTMLElement;

  constructor(props: { html: string }) {
    this.element = document.createElement('div');

    this.element.className = 'HtmlStringView';

    this.update(props);
  }

  update(props: { html: string }) {
    this.element.innerHTML = purify.sanitize(props.html);
  }
}
