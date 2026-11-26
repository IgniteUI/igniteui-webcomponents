import {
  html,
  LitElement,
  type PropertyValues,
  type TemplateResult,
} from 'lit';

import { property } from 'lit/decorators.js';
import { addValueStateMotion } from '#animations/value-state.js';
import { type ListContext, listContext } from '#internals/context.js';
import { addAsyncContextConsumer } from '#internals/controllers/async-consumer.js';
import {
  type ARIAState,
  addInternalsController,
} from '#internals/controllers/internals.js';
import { addSlotController, setSlots } from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { isEmpty } from '#internals/utils/arrays.js';
import {
  normalizedTextContent,
  releaseTabIndex,
} from '#internals/utils/dom.js';
import { all } from '#themes/list/themes/item.js';
import { addThemingController } from '#theming/theming-controller.js';
import { styles as componentBase } from '../../styles/common/component.css.js';
import { styles } from './themes/item.base.css.js';
import { styles as shared } from './themes/shared/item/list-item.common.css.js';

/**
 * The list-item component is a container
 * intended for row items in the list component.
 *
 * @element igc-list-item
 *
 * @slot - Renders custom content.
 * @slot start - Renders content before all other content.
 * @slot end - Renders content after all other content.
 * @slot title - Renders the title.
 * @slot subtitle - Renders the subtitle.
 *
 * @csspart start - The start container.
 * @csspart end - The end container.
 * @csspart content - The header and custom content container.
 * @csspart header - The title and subtitle container.
 * @csspart title - The title container.
 * @csspart subtitle - The subtitle container.
 */
export default class IgcListItemComponent extends LitElement {
  public static readonly tagName = 'igc-list-item';
  public static override styles = [componentBase, styles, shared];

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcListItemComponent);
  }

  //#region Internal state and properties

  private readonly _context = addAsyncContextConsumer(this, listContext);

  // Before the internals, so the first ARIA update can read the slots.
  private readonly _slots = addSlotController(this, {
    slots: setSlots('title', 'subtitle'),
  });

  private readonly _internals = addInternalsController(this, {
    initialARIA: { role: 'listitem' },
    aria: () => this._resolveARIA(),
  });

  /** The list that navigates this item, if any. */
  private get _list(): ListContext | undefined {
    const list = this._context.value;
    return list?.navigates(this) ? list : undefined;
  }

  private get _titles(): Element[] {
    return this._slots.getAssignedElements('title');
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Whether the list item is selected. It changes the visual style of the
   * item. In a list with keyboard navigation, assistive technology also reads
   * it as the selected state of the item.
   * @attr
   */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  //#endregion

  constructor() {
    super();

    addThemingController(this, all);
    addValueStateMotion(this, { watch: () => [this.selected] });
  }

  //#region Lit lifecycle methods

  public override disconnectedCallback(): void {
    releaseTabIndex(this);
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    // The context changes with no property, so this runs on each update.
    this._internals.setState('navigable', !!this._list);
  }

  protected override updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has('selected')) {
      this._list?.syncState();
    }
  }

  //#endregion

  //#region Internal API

  /**
   * @hidden @internal
   * The text that a type-ahead search of the list matches: the title, else the
   * whole content.
   */
  public get _searchText(): string {
    const titles = this._titles;
    return normalizedTextContent(isEmpty(titles) ? [this] : titles);
  }

  /**
   * In a navigating list: an option or a row, named by its title, unless the
   * app gives an `aria-label`, and described by its subtitle and its header.
   * The list updates the item when its `aria-label` changes.
   */
  private _resolveARIA(): ARIAState {
    const list = this._list;

    if (!list) {
      return {
        role: 'listitem',
        ariaSelected: null,
        ariaLabelledByElements: null,
        ariaDescribedByElements: null,
      };
    }

    const titles = this._titles;
    const header = list.headerOf(this);
    const descriptions = [
      ...(isEmpty(titles) ? [] : this._slots.getAssignedElements('subtitle')),
      ...(header ? [header] : []),
    ];
    const labelled = !isEmpty(titles) && !this.hasAttribute('aria-label');

    return {
      role: list.roles().item,
      ariaSelected:
        this.selected || list.exposesUnselected() ? `${this.selected}` : null,
      ariaLabelledByElements: labelled ? titles : null,
      ariaDescribedByElements: isEmpty(descriptions) ? null : descriptions,
    };
  }

  //#endregion

  protected override render(): TemplateResult {
    const parts = html`
      <section part="start">
        <slot name="start"></slot>
      </section>
      <section part="content">
        <div part="header">
          <slot part="title" name="title"></slot>
          <slot part="subtitle" name="subtitle"></slot>
        </div>
        <slot></slot>
      </section>
      <section part="end">
        <slot name="end"></slot>
      </section>
    `;
    // The one cell of a grid row. `display: contents` keeps the item layout.
    const cell = this._list?.roles().cell;

    return cell ? html`<div role=${cell} data-cell>${parts}</div>` : parts;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-list-item': IgcListItemComponent;
  }
}
