import { LitElement, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { igcToggle } from './toggle.directive';
import { IToggleOptions } from './utilities';

export default class PopperTestComponent extends LitElement {
  private toggleDirective: any;

  constructor(
    target: HTMLElement,
    open: boolean,
    private options?: IToggleOptions
  ) {
    super();
    this.toggleDirective = igcToggle(target, open, options);
  }

  protected override render() {
    return html` <div
      style=${styleMap({
        position: this.options?.positionStrategy ?? 'absolute',
      })}
      ${this.toggleDirective}
    >
      Toggle Content
    </div>`;
  }
}
