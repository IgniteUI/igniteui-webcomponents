import { html, LitElement, TemplateResult } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/combo.base.css.js';
import { styles as bootstrap } from './themes/light/combo.bootstrap.css.js';
import { styles as material } from './themes/light/combo.material.css.js';
import { styles as fluent } from './themes/light/combo.fluent.css.js';
import { styles as indigo } from './themes/light/combo.indigo.css.js';
import { property, state } from 'lit/decorators.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcComboItemComponent from './combo-item.js';

defineComponents(IgcComboItemComponent);

/**
 * @element igc-combo
 *
 * @slot prefix - Renders content before the input.
 * @slot suffix - Renders content after input.
 * @slot header - Renders a container before the list of options.
 * @slot footer - Renders a container after the list of options.
 * @slot helper-text - Renders content below the input.
 * @slot toggle-icon - Renders content inside the suffix container.
 * @slot clear-icon - Renders content inside the suffix container.
 *
 * @fires igcFocus - Emitted when the select gains focus.
 * @fires igcBlur - Emitted when the select loses focus.
 * @fires igcChange - Emitted when the control's checked state changes.
 * @fires igcOpening - Emitted just before the list of options is opened.
 * @fires igcOpened - Emitted after the list of options is opened.
 * @fires igcClosing - Emitter just before the list of options is closed.
 * @fires igcClosed - Emitted after the list of options is closed.
 *
 * @csspart list - The list of options wrapper.
 * @csspart input - The encapsulated igc-input.
 * @csspart label - The encapsulated text label.
 * @csspart prefix - The prefix wrapper.
 * @csspart suffix - The suffix wrapper.
 * @csspart toggle-icon - The toggle icon wrapper.
 * @csspart helper-text - The helper text wrapper.
 */
@themes({ material, bootstrap, fluent, indigo })
export default class IgcComboComponent<T extends object> extends LitElement {
  public static readonly tagName = 'igc-combo';
  public static override styles = styles;

  @property({ attribute: 'value-key' })
  public valueKey?: keyof T;

  @property({ attribute: 'display-key' })
  public displayKey?: keyof T = this.valueKey;

  /** The value attribute of the control. */
  @property({ reflect: false, type: String })
  public value?: string | undefined;

  /** The name attribute of the control. */
  @property()
  public name!: string;

  /** The data source used to build the list of options. */
  @property({ attribute: false })
  public data: Array<T> = [];

  @state()
  protected dataState: Array<object> = [];

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data);
  }

  @watch('valueKey')
  protected updateDisplayKey() {
    this.displayKey = this.displayKey ?? this.valueKey;
  }

  @property({ attribute: false })
  public itemTemplate: <T>(item: T) => TemplateResult = (item) => {
    if (this.displayKey) {
      return html`${(item as any)[this.displayKey]}`;
    }

    return html`${item}`;
  };

  protected itemRenderer = <T>(item: T): TemplateResult => {
    return html`<igc-combo-item>${this.itemTemplate(item)}</igc-combo-item>`;
  };

  public override render() {
    return html`
      <div part="list">
        ${virtualize({
          scroller: true,
          items: this.dataState,
          renderItem: this.itemRenderer,
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
