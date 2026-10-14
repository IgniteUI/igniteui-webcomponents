import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
  shiftKey,
} from '#internals/controllers/key-bindings.js';
import {
  addSlotController,
  DefaultSlot,
  setSlots,
} from '#internals/controllers/slot.js';
import { registerComponent } from '#internals/definitions/register.js';
import { firstOf, lastOf } from '#internals/utils/arrays.js';
import { addSafeEventListener } from '#internals/utils/events.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import { styles } from './themes/accordion.base.css.js';

/**
 * The Accordion is a container-based component that can house multiple expansion panels
 * and offers keyboard navigation.
 *
 * @element igc-accordion
 *
 * @slot - Renders the expansion panels inside default slot.
 */
export default class IgcAccordionComponent extends LitElement {
  public static readonly tagName = 'igc-accordion';
  public static override styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcAccordionComponent, IgcExpansionPanelComponent);
  }

  //#region Internal state and properties

  private _panels: IgcExpansionPanelComponent[] = [];

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._handleSlotChange,
    initial: true,
  });

  private get _interactivePanels(): IgcExpansionPanelComponent[] {
    return this._panels.filter((panel) => !panel.disabled);
  }

  /** Interactive panels that render. A `hidden` panel cannot take focus. */
  private get _navigablePanels(): IgcExpansionPanelComponent[] {
    return this._interactivePanels.filter((panel) =>
      this._getPanelHeader(panel)?.checkVisibility({ visibilityProperty: true })
    );
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Allows only one panel to be expanded at a time.
   * @attr single-expand
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'single-expand' })
  public singleExpand = false;

  /* blazorSuppress */
  /** Returns all of the direct expansion panel children of the accordion. */
  public get panels(): IgcExpansionPanelComponent[] {
    return Array.from(this._panels);
  }

  //#endregion

  constructor() {
    super();

    addSafeEventListener(this, 'igcOpening' as any, this._handlePanelOpening);

    addKeybindings(this, { skip: this._skipKeybinding })
      .set(homeKey, this._navigateToFirst)
      .set(endKey, this._navigateToLast)
      .set(arrowUp, (event) => this._navigateBy(event, -1))
      .set(arrowDown, (event) => this._navigateBy(event, 1))
      .set([shiftKey, altKey, arrowDown], this._expandAll)
      .set([shiftKey, altKey, arrowUp], this._collapseAll);
  }

  //#region Event handlers

  private _handleSlotChange(): void {
    this._panels = this._slots.getAssignedElements(DefaultSlot, {
      selector: IgcExpansionPanelComponent.tagName,
    });
  }

  private async _handlePanelOpening(event: Event): Promise<void> {
    const current = event.target as IgcExpansionPanelComponent;

    if (!(this.singleExpand && this.panels.includes(current))) {
      return;
    }

    await this._closeOthers(current);
  }

  //#endregion

  //#region Keyboard interaction handlers

  private _skipKeybinding(target: Element): boolean {
    return !(
      target instanceof IgcExpansionPanelComponent &&
      this._interactivePanels.includes(target)
    );
  }

  private _navigateToFirst(): void {
    this._getPanelHeader(firstOf(this._navigablePanels))?.focus();
  }

  private _navigateToLast(): void {
    this._getPanelHeader(lastOf(this._navigablePanels))?.focus();
  }

  private _navigateBy(event: KeyboardEvent, dir: 1 | -1): void {
    const panels = this._navigablePanels;
    const current = event.target as IgcExpansionPanelComponent;
    const next = panels[panels.indexOf(current) + dir];

    if (next) {
      this._getPanelHeader(next)?.focus();
    }
  }

  private async _collapseAll(): Promise<void> {
    await Promise.all(this._interactivePanels.map((panel) => panel._hide()));
  }

  private async _expandAll(event: KeyboardEvent): Promise<void> {
    const current = event.target as IgcExpansionPanelComponent;

    if (this.singleExpand) {
      await this._closeOthers(current);
      await current._show();
    } else {
      await Promise.all(this._interactivePanels.map((panel) => panel._show()));
    }
  }

  //#endregion

  //#region Internal API

  private _getPanelHeader(
    panel: IgcExpansionPanelComponent
  ): HTMLElement | undefined {
    return panel['_headerRef'].value;
  }

  private _closeOthers(
    current: IgcExpansionPanelComponent
  ): Promise<boolean[]> {
    return Promise.all(
      this._interactivePanels
        .filter((panel) => panel.open && panel !== current)
        .map((panel) => panel._hide())
    );
  }

  //#endregion

  //#region Public API

  /** Hides all of the child expansion panels' contents. */
  public async hideAll(): Promise<void> {
    await Promise.all(this.panels.map((panel) => panel.hide()));
  }

  /** Shows all of the child expansion panels' contents. */
  public async showAll(): Promise<void> {
    await Promise.all(this.panels.map((panel) => panel.show()));
  }

  //#endregion

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-accordion': IgcAccordionComponent;
  }
}
