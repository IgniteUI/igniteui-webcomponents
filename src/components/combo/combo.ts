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
import { SelectionController } from './controllers/selection.js';
import { IgcToggleController } from '../toggle/toggle.controller.js';
import { DataController } from './controllers/data.js';
import { IgcToggleComponent } from '../toggle/types.js';
import {
  Keys,
  Values,
  ComboRecord,
  GroupingDirection,
  FilteringOptions,
  IgcComboEventMap,
} from './types.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { partNameMap } from '../common/util.js';
import { filteringOptionsConverter } from './utils/converters.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { Constructor } from '../common/mixins/constructor.js';

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
 * @fires igcChange - Emitted when the control's selection has changed.
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
  extends EventEmitterMixin<IgcComboEventMap, Constructor<LitElement>>(
    LitElement
  )
  implements Partial<IgcToggleComponent>
{
  public static readonly tagName = 'igc-combo';
  public static styles = styles;

  protected navigationController = new NavigationController<T>(this);
  protected selectionController = new SelectionController<T>(this);
  protected dataController = new DataController<T>(this);
  protected toggleController!: IgcToggleController;

  @queryAssignedElements({ slot: 'helper-text' })
  protected helperText!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'suffix' })
  protected inputSuffix!: Array<HTMLElement>;

  @queryAssignedElements({ slot: 'prefix' })
  protected inputPrefix!: Array<HTMLElement>;

  @query('[part="search-input"]')
  private input!: IgcInputComponent;

  @query('[part="target"]')
  private target!: IgcInputComponent;

  @query('igc-combo-list')
  private list!: IgcComboListComponent;

  /** The data source used to generate the list of options. */
  @property({ attribute: false })
  public data: Array<T> = [];

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

  /**
   * Focuses the first item in the list of options when the menu opens.
   * @attr autofocus-options
   */
  @property({ attribute: 'autofocus-options', type: Boolean })
  public autofocusOptions = false;

  /** The label attribute of the control. */
  @property({ type: String })
  public label!: string;

  /** The placeholder attribute of the control. */
  @property({ type: String })
  public placeholder!: string;

  /**
   * The placeholder attribute of the search input.
   * @attr placeholder-search
   */
  @property({ attribute: 'placeholder-search', type: String })
  public placeholderSearch = 'Search';

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /** Sets the open state of the component. */
  @property({ type: Boolean })
  public open = false;

  /**
   * The key in the data source used when selecting items.
   * @attr value-key
   */
  @property({ attribute: 'value-key', reflect: false })
  public valueKey?: Keys<T>;

  /**
   * The key in the data source used to display items in the list.
   * @attr display-key
   */
  @property({ attribute: 'display-key', reflect: false })
  public displayKey?: Keys<T> = this.valueKey;

  /**
   * The key in the data source used to group items in the list.
   * @attr group-key
   */
  @property({ attribute: 'group-key', reflect: false })
  public groupKey?: Keys<T> = this.displayKey;

  /**
   * Sorts the items in each group by ascending or descending order.
   * @attr group-sorting
   * @type {"asc" | "desc"}
   */
  @property({ attribute: 'group-sorting', reflect: false })
  public groupSorting: GroupingDirection = 'asc';

  /**
   * An object that configures the filtering of the combo.
   * @attr filtering-options
   * @type {FilteringOptions<T>}
   * @param filterKey - The key in the data source used when filtering the list of options.
   * @param caseSensitive - Determines whether the filtering operation should be case sensitive.
   */
  @property({
    attribute: 'filtering-options',
    reflect: false,
    converter: filteringOptionsConverter,
  })
  public filteringOptions: FilteringOptions<T> = {
    filterKey: this.displayKey,
    caseSensitive: false,
  };

  /**
   * Enables the case sensitive search icon in the filtering input.
   * @attr case-sensitive-icon
   */
  @property({ type: Boolean, attribute: 'case-sensitive-icon', reflect: false })
  public caseSensitiveIcon = false;

  /**
   * Disables the filtering of the list of options.
   * @attr disable-filtering
   */
  @property({ type: Boolean, attribute: 'disable-filtering', reflect: false })
  public disableFiltering = false;

  /**
   * The template used for the content of each combo item.
   * @type {(item: T) => TemplateResult}
   */
  @property({ attribute: false })
  public itemTemplate: (item: ComboRecord<T>) => TemplateResult = (item) => {
    if (typeof item !== 'object' || item === null) {
      return String(item) as any;
    }

    if (this.displayKey) {
      return html`${item[this.displayKey]}`;
    }

    return html`${String(item)}`;
  };

  /**
   * The template used for the content of each combo group header.
   * @type {(item: T) => TemplateResult}
   */
  @property({ attribute: false })
  public groupHeaderTemplate: (item: ComboRecord<T>) => TemplateResult = (
    item: ComboRecord<T>
  ) => {
    return html`${this.groupKey && item[this.groupKey]}`;
  };

  /** @hidden @internal */
  @state()
  public dataState: Array<ComboRecord<T>> = [];

  @watch('data')
  protected dataChanged() {
    this.dataState = structuredClone(this.data) as ComboRecord<T>[];

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
  @watch('groupSorting')
  @watch('pipeline')
  protected async pipeline() {
    this.dataState = await this.dataController.apply([...this.data]);
    this.navigationController.active = 0;
  }

  constructor() {
    super();

    this.toggleController = new IgcToggleController(this, {
      target: this.target,
    });

    this.addEventListener('focus', () => {
      this.emitEvent('igcFocus');
    });

    this.addEventListener('blur', async () => {
      await this.hide(true);
      this.emitEvent('igcBlur');
    });

    this.addEventListener(
      'keydown',
      this.navigationController.navigateHost.bind(this.navigationController)
    );
  }

  protected override async firstUpdated() {
    await this.updateComplete;
    this.requestUpdate();
  }

  /**
   * Returns the current selection as a list of commma separated values,
   * represented by the display key, when provided.
   */
  public get value() {
    return this.selectionController.getValue(
      Array.from(this.selectionController.selected)
    );
  }

  /** Sets focus on the component. */
  public override focus(options?: FocusOptions) {
    this.target.focus(options);
  }

  /** Removes focus from the component. */
  public override blur() {
    this.target.blur();
  }

  /**
   * Selects the options in the list by either value or key value.
   * If not argument is provided all items will be selected.
   * @param { T[] | Values<T>[] } items - A list of values or values as set by the valueKey.
   */
  public select(items?: T[] | Values<T>[], emit = false) {
    this.selectionController.select(items, emit);
  }

  /**
   * Deselects the options in the list by either value or key value.
   * If not argument is provided all items will be deselected.
   * @param { T[] | Values<T>[] } items - A list of values or values as set by the valueKey.
   */
  public deselect(items?: T[] | Values<T>[], emit = false) {
    this.selectionController.deselect(items, emit);
  }

  protected handleSearchInput(e: CustomEvent) {
    this.dataController.searchTerm = e.detail;
  }

  protected handleOpening() {
    const args = { cancelable: true };
    return this.emitEvent('igcOpening', args);
  }

  protected handleClosing(): boolean {
    const args = { cancelable: true };
    return this.emitEvent('igcClosing', args);
  }

  /** Shows the list of options. */
  public async show(emit = false) {
    if (this.open) return;
    if (emit && !this.handleOpening()) return;
    this.open = true;

    await this.updateComplete;
    emit && this.emitEvent('igcOpened');

    this.list.focus();

    if (!this.autofocusOptions) {
      this.input.focus();
    }
  }

  /** Hides the list of options. */
  public async hide(emit = false) {
    if (!this.open) return;
    if (emit && !this.handleClosing()) return;
    this.open = false;

    await this.updateComplete;
    emit && this.emitEvent('igcClosed');
  }

  /** Toggles the list of options. */
  public toggle(emit = false) {
    this.open ? this.hide(emit) : this.show(emit);
  }

  protected itemRenderer = (item: T, index: number): TemplateResult => {
    const record = item as ComboRecord<T>;
    const { selected } = this.selectionController;

    const headerTemplate = html`<igc-combo-header part="group-header"
      >${this.groupHeaderTemplate(record)}</igc-combo-header
    >`;

    const itemParts = partNameMap({
      item: true,
      selected: selected.has(item),
      active: this.navigationController.active === index,
    });

    const itemTemplate = html`<igc-combo-item
      part="${itemParts}"
      exportparts="checkbox, checkbox-indicator, checked"
      @click=${this.itemClickHandler.bind(this)}
      .index=${index}
      .active=${this.navigationController.active === index}
      .selected=${selected.has(item)}
      >${this.itemTemplate(record)}</igc-combo-item
    >`;

    return html`${this.groupKey && record.header
      ? headerTemplate
      : itemTemplate}`;
  };

  protected listKeydownHandler(event: KeyboardEvent) {
    const target = event
      .composedPath()
      .find(
        (el) => el instanceof IgcComboListComponent
      ) as IgcComboListComponent;

    if (target) {
      this.navigationController.navigateList(event, target);
    }
  }

  protected itemClickHandler(event: MouseEvent) {
    const target = event
      .composedPath()
      .find(
        (el) => el instanceof IgcComboItemComponent
      ) as IgcComboItemComponent;

    this.toggleSelect(target.index);
    this.input.focus();
  }

  /** @internal @hidden */
  public toggleSelect(index: number) {
    this.selectionController.changeSelection(index);
    this.navigationController.active = index;
  }

  protected navigateTo(item: T) {
    this.navigationController.navigateTo(item, this.list);
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

  protected override render() {
    const { selected } = this.selectionController;

    return html`
      <igc-input
        part="target"
        exportparts="container: input, input: native-input, label, prefix, suffix"
        @click=${() => this.toggle(true)}
        value=${ifDefined(this.value)}
        placeholder=${ifDefined(this.placeholder)}
        label=${ifDefined(this.label)}
        dir=${this.dir}
        @igcFocus=${(e: Event) => e.stopPropagation()}
        @igcBlur=${(e: Event) => e.stopPropagation()}
        @keydown=${this.navigationController.navigateHost.bind(
          this.navigationController
        )}
        .disabled="${this.disabled}"
        .required=${this.required}
        .invalid=${this.invalid}
        .outlined=${this.outlined}
        .autofocus=${this.autofocus}
        readonly
      >
        <span slot=${this.hasPrefixes && 'prefix'}>
          <slot name="prefix"></slot>
        </span>
        <span
          slot="suffix"
          part="clear-icon"
          @click=${this.handleClearIconClick}
          ?hidden=${selected.size === 0}
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
        @keydown=${this.listKeydownHandler}
        part="list-wrapper"
        ${this.toggleController.toggleDirective}
      >
        <div part="filter-input" ?hidden=${this.disableFiltering}>
          <igc-input
            part="search-input"
            placeholder=${this.placeholderSearch}
            exportparts="container: input, input: native-input, label, prefix, suffix"
            @igcFocus=${(e: Event) => e.stopPropagation()}
            @igcBlur=${(e: Event) => e.stopPropagation()}
            @igcInput=${this.handleSearchInput}
            @keydown=${(e: KeyboardEvent) =>
              this.navigationController.navigateInput(e, this.list)}
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
          ?hidden=${this.dataState.length === 0}
        >
        </igc-combo-list>
        <slot name="empty" ?hidden=${this.dataState.length > 0}>
          <div part="empty">The list is empty</div>
        </slot>
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
