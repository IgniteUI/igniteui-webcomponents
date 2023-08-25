import { LitElement, html } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { blazorSuppressComponent } from '../common/decorators/index.js';
import { igcToggle } from './toggle.directive';
import type { IgcToggleOptions } from './types';

@blazorSuppressComponent
export default class PopperTestComponent extends LitElement {
  private toggleDirective: any;

  constructor(
    target: HTMLElement,
    private options: IgcToggleOptions
  ) {
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
