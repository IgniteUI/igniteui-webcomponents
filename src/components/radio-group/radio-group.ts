import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcRadioComponent from '../radio/radio.js';
import { styles } from './radio-group.base.css.js';
import { styles as material } from './radio-group.material.css.js';
import { styles as fluent } from './radio-group.fluent.css.js';
import { themes } from '../../theming/theming-decorator.js';

defineComponents(IgcRadioComponent);

@themes({ light: { material, fluent }, dark: { material, fluent } })
export default class IgcRadioGroupComponent extends LitElement {
  public static readonly tagName = 'igc-radio-group';

  public static override styles = styles;

  /**
   * Alignment of the radio controls inside this group.
   * @attr
   */
  @property({ reflect: true })
  public alignment: 'vertical' | 'horizontal' = 'vertical';

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-radio-group': IgcRadioGroupComponent;
  }
}
