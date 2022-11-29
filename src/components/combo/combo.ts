import { html, LitElement, TemplateResult } from 'lit';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from './themes/light/combo.base.css.js';
import { styles as bootstrap } from './themes/light/combo.bootstrap.css.js';
import { styles as material } from './themes/light/combo.material.css.js';
import { styles as fluent } from './themes/light/combo.fluent.css.js';
import { styles as indigo } from './themes/light/combo.indigo.css.js';
import {
  property,
  query,
  queryAssignedElements,
  state,
} from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcComboListComponent from './combo-list.js';
import IgcComboItemComponent from './combo-item.js';
import IgcComboHeaderComponent from './combo-header.js';
import IgcInputComponent from '../input/input.js';
import IgcIconComponent from '../icon/icon.js';
import { NavigationController } from './controllers/navigation.js';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import { IgcToggleComponent } from '../toggle/types.js';
import {
  Keys,
  Values,
  ComboRecord,
  GroupingDirection,
  FilteringOptions,
} from './types.js';
import { DataController } from './controllers/data.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { partNameMap } from '../common/util.js';
import { filteringOptionsConverter } from './utils/converters.js';

defineComponents(
  IgcIconComponent,
  IgcComboListComponent,
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

  @query('[part="target"]')
  private target!: HTMLElement;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  /** The data source used to build the list of options. */
  @property({ attribute: false })
  public data: Array<T> = [];

  /** The value attribute of the control. */
  @property({ type: String, reflect: false })
  public value?: string | undefined;

  /** The name attribute of the control. */
  @property()
  public name!: string;

  /** The disabled attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public disabled = false;

  /** The required attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public required = false;

  /** The invalid attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  /** The outlined attribute of the control. */
  @property({ reflect: true, type: Boolean })
  public outlined = false;

  /** The autofocus attribute of the control. */
  @property({ type: Boolean })
  public override autofocus!: boolean;

  /** The label attribute of the control. */
  @property({ type: String })
  public label!: string;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: string;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /** Sets the open state of the component. */
  @property({ type: Boolean })
  public open = false;

  @property({ attribute: 'value-key', reflect: false })
  public valueKey?: Keys<T>;

  @property({ attribute: 'display-key', reflect: false })
  public displayKey?: Keys<T> = this.valueKey;

  @property({ attribute: 'group-key', reflect: false })
  public groupKey?: Keys<T> = this.displayKey;

  @property({ attribute: 'group-sorting', reflect: false })
  public groupSorting: GroupingDirection = 'asc';

  @property({
    attribute: 'filtering-options',
    reflect: false,
    converter: filteringOptionsConverter,
  })
  public filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
  };

  @property({ type: Boolean, attribute: 'case-sensitive-icon', reflect: false })
  public caseSensitiveIcon = false;

  @property({ type: Boolean, attribute: 'disable-filtering', reflect: false })
  public disableFiltering = false;

  @state()
  public dataState: Array<ComboRecord<T>> = [];

  @state()
  protected selected: Set<T> = new Set();

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data);

    if (this.hasUpdated) {
      this.pipeline();
    }
  }

  @watch('valueKey')
  protected updateDisplayKey() {
    this.displayKey = this.displayKey ?? this.valueKey;
  }

  @watch('displayKey')
  protected updateFilterKey() {
    this.filteringOptions.filterKey =
      this.filteringOptions.filterKey ?? this.displayKey;
  }

  @watch('groupKey')
  @watch('pipeline')
  protected pipeline() {
    this.dataState = this.dataController.apply([...this.data]);
    this.navigationController.active = 0;
  }

  @watch('selected', { waitUntilFirstUpdate: true })
  protected updateValue() {
    const values = Array.from(this.selected.values());

    this.value = values
      .map((value) => {
        if (typeof value === 'object') {
          return this.displayKey ? value[this.displayKey] : value;
        } else {
          return value;
        }
      })
      .join(', ');
  }

  @property({ attribute: false })
  public itemTemplate: (item: ComboRecord<T>) => TemplateResult = (item) => {
    if (this.displayKey) {
      return html`${item[this.displayKey]}`;
    }

    return html`${item}`;
  };

  @property({ attribute: false })
  public headerItemTemplate: (item: ComboRecord<T>) => TemplateResult = (
    item: ComboRecord<T>
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

  protected override firstUpdated() {
    if (this.autofocus) {
      this.target.focus();
    }
  }

  private selectValueKeys(values: Values<T>[]) {
    if (values.length === 0) return;

    values.forEach((value) => {
      const item = this.dataState.find((i) => i[this.valueKey!] === value);

      if (item) {
        this.selected.add(item);
      }
    });
  }

  private deselectValueKeys(values: Values<T>[]) {
    if (values.length === 0) return;

    values.forEach((value) => {
      const item = this.dataState.find((i) => i[this.valueKey!] === value);

      if (item) {
        this.selected.delete(item);
      }
    });
  }

  private selectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      this.selected.add(item as ComboRecord<T>);
    });
  }

  private deselectObjects(items: T[]) {
    if (items.length === 0) return;

    items.forEach((item) => {
      this.selected.delete(item as ComboRecord<T>);
    });
  }

  private selectAll() {
    this.dataState
      .filter((i) => !i.header)
      .forEach((item) => {
        this.selected.add(item);
      });
    this.requestUpdate('selected');
  }

  private deselectAll() {
    this.selected.clear();
    this.requestUpdate('selected');
  }

  public select(items?: T[] | Values<T>[]) {
    if (!items || items.length === 0) {
      this.selectAll();
      return;
    }

    if (this.valueKey) {
      this.selectValueKeys(items as Values<T>[]);
    } else {
      this.selectObjects(items as T[]);
    }

    this.requestUpdate('selected');
  }

  public deselect(items?: T[] | Values<T>[]) {
    if (!items || items.length === 0) {
      this.deselectAll();
      return;
    }

    if (this.valueKey) {
      this.deselectValueKeys(items as Values<T>[]);
    } else {
      this.deselectObjects(items as T[]);
    }

    this.requestUpdate('selected');
  }

  protected handleSearchInput(e: CustomEvent) {
    this.dataController.searchTerm = e.detail;
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

  protected itemRenderer = (item: T, index: number): TemplateResult => {
    const record = item as ComboRecord<T>;

    const headerTemplate = html`<igc-combo-header
      >${this.headerItemTemplate(record)}</igc-combo-header
    >`;

    const itemTemplate = html`<igc-combo-item
      @click=${this.itemClickHandler.bind(this)}
      .index=${index}
      .active=${this.navigationController.active === index}
      .selected=${this.selected.has(item)}
      >${this.itemTemplate(record)}</igc-combo-item
    >`;

    return html`${record.header ? headerTemplate : itemTemplate}`;
  };

  protected keydownHandler(event: KeyboardEvent) {
    const target = event
      .composedPath()
      .find(
        (el) => el instanceof IgcComboListComponent
      ) as IgcComboListComponent;

    if (target) {
      this.navigationController.navigate(event, target);
    }
  }

  protected itemClickHandler(event: MouseEvent) {
    const target = event.target as IgcComboItemComponent;
    this.toggleSelect(target.index);
  }

  public toggleSelect(index: number) {
    const item = this.dataState[index];

    if (this.valueKey) {
      !this.selected.has(item)
        ? this.select([item[this.valueKey]])
        : this.deselect([item[this.valueKey]]);
    } else {
      !this.selected.has(item) ? this.select([item]) : this.deselect([item]);
    }

    this.navigationController.active = index;
  }

  protected handleClearIconClick(e: MouseEvent) {
    e.stopPropagation();
    this.deselect();
    this.navigationController.active = 0;
  }

  protected toggleCaseSensitivity() {
    this.filteringOptions.caseSensitive = !this.filteringOptions.caseSensitive;
    this.requestUpdate('pipeline');
  }

  protected get hasPrefixes() {
    return this.inputPrefix.length > 0;
  }

  protected get hasSuffixes() {
    return this.inputSuffix.length > 0;
  }

  public override render() {
    return html`
      <igc-input
        part="target"
        exportparts="container: input, input: native-input, label, prefix, suffix"
        @click=${this.toggle}
        value=${ifDefined(this.value)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        dir=${this.dir}
        .disabled="${this.disabled}"
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        readonly
      >
        <span slot=${this.hasPrefixes && 'prefix'}>
          <slot name="prefix"></slot>
        </span>
        <span
          slot="suffix"
          part="clear-icon"
          @click=${this.handleClearIconClick}
          ?hidden=${this.selected.size === 0}
        >
          <slot name="clear-icon">
            <igc-icon
              name="chip_cancel"
              collection="internal"
              aria-hidden="true"
            ></igc-icon>
          </slot>
        </span>
        <span slot=${this.hasSuffixes && 'suffix'}>
          <slot name="suffix"></slot>
        </span>
        <span slot="suffix" part="toggle-icon">
          <slot name="toggle-icon">
            <igc-icon
              name=${this.open ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
              collection="internal"
              aria-hidden="true"
            ></igc-icon>
          </slot>
        </span>
      </igc-input>
      <div
        @keydown=${this.keydownHandler}
        tabindex="0"
        part="list-wrapper"
        ${this.toggleController.toggleDirective}
      >
        <div part="filter-input" ?hidden=${this.disableFiltering}>
          <igc-input
            placeholder="Search"
            exportparts="container: input, input: native-input, label, prefix, suffix"
            @igcInput=${this.handleSearchInput}
            @keydown=${(e: KeyboardEvent) => e.stopPropagation()}
            dir=${this.dir}
          >
            <igc-icon
              slot=${this.caseSensitiveIcon && 'suffix'}
              name="case_sensitive"
              collection="internal"
              part=${partNameMap({
                'case-icon': true,
                active: this.filteringOptions.caseSensitive ?? false,
              })}
              @click=${this.toggleCaseSensitivity}
            ></igc-icon>
          </igc-input>
        </div>
        <slot name="header"></slot>
        <igc-combo-list
          part="list"
          .items=${this.dataState}
          .renderItem=${this.itemRenderer}
        >
        </igc-combo-list>
        <slot name="footer"></slot>
      </div>
      <div
        id="helper-text"
        part="helper-text"
        ?hidden="${this.helperText.length === 0}"
      >
        <slot name="helper-text"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-combo': IgcComboComponent<object>;
  }
}
