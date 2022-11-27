import { html, LitElement, TemplateResult } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/combo.base.css.js';
import { styles as bootstrap } from './themes/light/combo.bootstrap.css.js';
import { styles as material } from './themes/light/combo.material.css.js';
import { styles as fluent } from './themes/light/combo.fluent.css.js';
import { styles as indigo } from './themes/light/combo.indigo.css.js';
import { property, query, queryAll, state } from 'lit/decorators.js';
import { virtualize } from '@lit-labs/virtualizer/virtualize.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcComboItemComponent from './combo-item.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcInputComponent from '../input/input.js';
import { NavigationController } from './controllers/navigation.js';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import { IgcToggleComponent } from '../toggle/types.js';
import { Keys, ComboRecord } from './types.js';
import { DataController } from './controllers/data.js';
import { ifDefined } from 'lit/directives/if-defined.js';

defineComponents(
  IgcComboItemComponent,
  IgcComboHeaderComponent,
  IgcInputComponent
);

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
export default class IgcComboComponent<T extends object>
  extends LitElement
  implements IgcToggleComponent
{
  public static readonly tagName = 'igc-combo';
  public static override styles = styles;

  protected navigationController = new NavigationController<T>(this);
  protected dataController = new DataController<T>(this);
  protected toggleController!: IgcToggleController;

  private scrollIndex = 0;
  private scrollPosition = 'center';

  @query('[part="target"]')
  private target!: HTMLElement;

  @queryAll('igc-combo-item')
  public items!: NodeListOf<IgcComboItemComponent>;

  /** Sets the open state of the component. */
  @property({ type: Boolean })
  public open = false;

  @property({ attribute: 'value-key' })
  public valueKey?: Keys<T>;

  @property({ attribute: 'display-key' })
  public displayKey?: Keys<T> = this.valueKey;

  @property({ attribute: 'group-key' })
  public groupKey?: Keys<T> = this.displayKey;

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
  public dataState: Array<ComboRecord<T>> = [];

  @state()
  protected selected: Set<T> = new Set();

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data);
  }

  @watch('valueKey')
  protected updateDisplayKey() {
    this.displayKey = this.displayKey ?? this.valueKey;
  }

  @watch('groupKey')
  protected groupItems() {
    if (!this.groupKey) return;
    this.dataState = this.dataController.group(this.dataState);
  }

  @watch('selected', { waitUntilFirstUpdate: true })
  protected updateValue() {
    const values = Array.from(this.selected.values());

    this.value = values
      .map((value) => {
        if (typeof value === 'object') {
          return value[this.valueKey!];
        } else {
          return value;
        }
      })
      .join(', ');
  }

  @property({ attribute: false })
  public itemTemplate: (item: T) => TemplateResult = (item) => {
    if (this.displayKey) {
      return html`${item[this.displayKey]}`;
    }

    return html`${item}`;
  };

  @property({ attribute: false })
  public headerItemTemplate: (item: ComboRecord<T>) => TemplateResult = (
    item
  ) => {
    return html`${item[this.groupKey!]}`;
  };

  constructor() {
    super();

    this.toggleController = new IgcToggleController(this, {
      target: this.target,
      closeCallback: () => {},
    });
  }

  public select(items?: T[]) {
    if (!items || items.length === 0) {
      this.dataState
        .filter((i) => !i.header)
        .forEach((item) => {
          this.selected.add(item);
        });
    }

    items?.forEach((item) => {
      this.selected.add(item);
    });

    this.requestUpdate('selected');
  }

  public deselect(items?: T[]) {
    if (!items || items.length === 0) {
      this.selected.clear();
    }

    items?.forEach((item) => {
      this.selected.delete(item);
    });

    this.requestUpdate('selected');
  }

  public show() {
    if (this.open) return;
    this.open = true;
  }

  public hide() {
    if (!this.open) return;
    this.open = false;
  }

  public toggle() {
    this.open ? this.hide() : this.show();
  }

  protected itemRenderer = (
    item: ComboRecord<T>,
    index: number
  ): TemplateResult => {
    const headerTemplate = html`<igc-combo-header
      >${this.headerItemTemplate(item)}</igc-combo-header
    >`;

    const itemTemplate = html`<igc-combo-item
      @click=${this.itemClickHandler}
      .index=${index}
      .activeNode=${this.navigationController.active}
      .selected=${this.selected.has(item)}
      >${this.itemTemplate(item)}</igc-combo-item
    >`;

    return html`${item?.header ? headerTemplate : itemTemplate}`;
  };

  public scrollToIndex(index: number, position?: string) {
    this.scrollIndex = index;
    if (position) this.scrollPosition = position;
  }

  protected keydownHandler(event: KeyboardEvent) {
    this.navigationController.navigate(event);
  }

  protected itemClickHandler(event: MouseEvent) {
    const target = event.target as IgcComboItemComponent;
    this.toggleItem(target.index);
  }

  public toggleItem(index: number) {
    const target = Array.from(this.items).find((i) => i.index === index);
    const item = this.dataState[index];
    target!.selected = !target!.selected;
    target!.selected ? this.select([item]) : this.deselect([item]);
    this.navigationController.active = target!.index;
  }

  public override render() {
    return html`
      <igc-input
        part="target"
        @click=${this.toggle}
        .value=${ifDefined(this.value)}
        readonly
      ></igc-input>
      <div
        @keydown=${this.keydownHandler}
        tabindex="0"
        part="list-wrapper"
        ${this.toggleController.toggleDirective}
      >
        <div part="list">
          ${virtualize({
            scroller: true,
            items: this.dataState,
            renderItem: this.itemRenderer,
            scrollToIndex: {
              index: this.scrollIndex,
              position: this.scrollPosition,
            },
          })}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
