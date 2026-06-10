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
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import { addSafeEventListener, first, last } from '../common/util.js';
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
  /** Returns all of the accordions's direct igc-expansion-panel children. */
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
      .set(arrowUp, this._navigateToPrevious)
      .set(arrowDown, this._navigateToNext)
      .set([shiftKey, altKey, arrowDown], this._expandAll)
      .set([shiftKey, altKey, arrowUp], this._collapseAll);
  }

  //#region Event handlers

  private _handleSlotChange(): void {
    this._panels = this._slots.getAssignedElements('[default]', {
      selector: IgcExpansionPanelComponent.tagName,
    });
  }

  private async _handlePanelOpening(event: Event): Promise<void> {
    const current = event.target as IgcExpansionPanelComponent;

    if (!(this.singleExpand && this.panels.includes(current))) {
      return;
    }

    await Promise.all(
      this._interactivePanels
        .filter((panel) => panel.open && panel !== current)
        .map((panel) => this._closePanel(panel))
    );
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
    this._getPanelHeader(first(this._interactivePanels))?.focus();
  }

  private _navigateToLast(): void {
    this._getPanelHeader(last(this._interactivePanels))?.focus();
  }

  private _navigateToPrevious(event: KeyboardEvent): void {
    const current = event.target as IgcExpansionPanelComponent;
    const next = this._getNextPanel(current, -1);

    if (next !== current) {
      this._getPanelHeader(next)?.focus();
    }
  }

  private _navigateToNext(event: KeyboardEvent): void {
    const current = event.target as IgcExpansionPanelComponent;
    const next = this._getNextPanel(current, 1);

    if (next !== current) {
      this._getPanelHeader(next)?.focus();
    }
  }

  private async _collapseAll(): Promise<void> {
    await Promise.all(
      this._interactivePanels.map((panel) => this._closePanel(panel))
    );
  }

  private async _expandAll(event: KeyboardEvent): Promise<void> {
    const current = event.target as IgcExpansionPanelComponent;

    if (this.singleExpand) {
      const closePromises = this._interactivePanels
        .filter((panel) => panel.open && panel !== current)
        .map((panel) => this._closePanel(panel));

      await Promise.all(closePromises);
      await this._openPanel(current);
    } else {
      await Promise.all(
        this._interactivePanels.map((panel) => this._openPanel(panel))
      );
    }
  }

  //#endregion

  //#region Internal API

  private _getPanelHeader(
    panel: IgcExpansionPanelComponent
  ): HTMLElement | undefined {
    // biome-ignore lint/complexity/useLiteralKeys: Direct property access instead of DOM query
    return panel['_headerRef'].value;
  }

  private _getNextPanel(
    panel: IgcExpansionPanelComponent,
    dir: 1 | -1 = 1
  ): IgcExpansionPanelComponent {
    const panels = this._interactivePanels;
    const idx = panels.indexOf(panel);

    return panels[idx + dir] || panel;
  }

  private async _closePanel(p: IgcExpansionPanelComponent): Promise<void> {
    const args = { detail: p };

    if (!(p.open && p.emitEvent('igcClosing', { cancelable: true, ...args }))) {
      return;
    }

    if (await p.hide()) {
      p.emitEvent('igcClosed', args);
    }
  }

  private async _openPanel(p: IgcExpansionPanelComponent): Promise<void> {
    const args = { detail: p };

    if (p.open || !p.emitEvent('igcOpening', { cancelable: true, ...args })) {
      return;
    }

    if (await p.show()) {
      p.emitEvent('igcOpened', args);
    }
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
