import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';

import { themes } from '../../theming/theming-decorator.js';
import { registerComponent } from '../common/definitions/register.js';
import IgcRadioComponent from '../radio/radio.js';
import { styles } from './radio-group.base.css.js';
import { styles as fluent } from './radio-group.fluent.css.js';
import { styles as indigo } from './radio-group.indigo.css.js';
import { styles as material } from './radio-group.material.css.js';

/**
 * The igc-radio-group component unifies one or more igc-radio buttons.
 *
 * @element igc-radio-group
 *
 * @slot - Default slot
 */
@themes({
  light: { material, fluent, indigo },
  dark: { material, fluent, indigo },
})
export default class IgcRadioGroupComponent extends LitElement {
  public static readonly tagName = 'igc-radio-group';
  public static override styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcRadioGroupComponent, IgcRadioComponent);
  }

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
