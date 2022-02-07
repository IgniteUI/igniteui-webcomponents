import { LitElement, html } from 'lit';
import { igcToggle } from './toggle.directive';
import { IToggleOptions } from './utilities';

export default class PopperTestComponent extends LitElement {
  private toggleDirective: any;

  constructor(target: HTMLElement, open: boolean, options?: IToggleOptions) {
    super();
    this.toggleDirective = igcToggle(target, open, options);
  }

  protected override render() {
    return html`<div ${this.toggleDirective}>Toggle Content</div>`;
  }
}
