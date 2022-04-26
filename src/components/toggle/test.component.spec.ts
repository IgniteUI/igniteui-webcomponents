import { LitElement, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { igcToggle } from './toggle.directive';
import { IgcToggleOptions } from './types';

export default class PopperTestComponent extends LitElement {
  private toggleDirective: any;

  constructor(target: HTMLElement, private options: IgcToggleOptions) {
    super();
    this.toggleDirective = igcToggle(target, options);
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
