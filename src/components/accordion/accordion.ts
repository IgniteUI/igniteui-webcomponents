import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { styles } from './themes/accordion.base.css.js';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';

defineComponents(IgcExpansionPanelComponent);

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

  private get _enabledPanels(): Array<IgcExpansionPanelComponent> {
    return this.panels.filter((p) => !p.disabled);
  }

  /**
   * Allows only one panel to be expanded at a time.
   * @attr single-expand
   */
  @property({ attribute: 'single-expand', reflect: true, type: Boolean })
  public singleExpand = false;

  /** Returns all of the accordions's direct igc-expansion-panel children. */
  @queryAssignedElements({ selector: 'igc-expansion-panel' })
  @blazorSuppress()
  public panels!: Array<IgcExpansionPanelComponent>;

  constructor() {
    super();
    this.addEventListener('keydown', this.handleKeydown, { capture: true });
    this.addEventListener('igcOpening', this.handlePanelOpening);
  }

  private handlePanelOpening(event: Event) {
    const panel = event.target as IgcExpansionPanelComponent;
    if (!this.singleExpand || !this.panels.includes(panel)) {
      return;
    }
    this._enabledPanels.forEach((p) => {
      if (p.open && p !== panel) {
        this.closePanel(p);
      }
    });
  }

  private handleKeydown = (event: KeyboardEvent) => {
    if (
      (event.target as HTMLElement).tagName.toLowerCase() !==
        'igc-expansion-panel' ||
      !this._enabledPanels.includes(event.target as IgcExpansionPanelComponent)
    ) {
      return;
    }
    switch (event.key.toLowerCase()) {
      case 'home':
        this.getPanelHeader(this._enabledPanels.at(0)!).focus();
        break;
      case 'end':
        this.getPanelHeader(this._enabledPanels.at(-1)!).focus();
        break;
      case 'arrowup':
      case 'up':
        this.handleUpDownArrow(true, event);
        break;
      case 'arrowdown':
      case 'down':
        this.handleUpDownArrow(false, event);
        break;
    }
  };

  private handleUpDownArrow(isUp: boolean, event: KeyboardEvent) {
    const focusedPanel = event.target as IgcExpansionPanelComponent;
    if (!event.altKey) {
      const next = this.getNextPanel(focusedPanel, isUp ? -1 : 1);
      if (next === focusedPanel) {
        return;
      }
      this.getPanelHeader(next).focus();
    }
    if (event.shiftKey && event.altKey) {
      if (this.singleExpand && !isUp) {
        this._enabledPanels.forEach((p) =>
          p !== focusedPanel ? this.closePanel(p) : this.openPanel(p)
        );
        return;
      }

      if (isUp) {
        this._enabledPanels.forEach((p) => this.closePanel(p));
      } else {
        this._enabledPanels.forEach((p) => this.openPanel(p));
      }
    }
  }

  private getNextPanel(panel: IgcExpansionPanelComponent, dir: 1 | -1 = 1) {
    const panelIndex = this._enabledPanels.indexOf(panel);
    return this._enabledPanels[panelIndex + dir] || panel;
  }

  private getPanelHeader(panel: IgcExpansionPanelComponent) {
    return panel.shadowRoot?.querySelector('div[part="header"]') as HTMLElement;
  }

  private async closePanel(panel: IgcExpansionPanelComponent) {
    if (!panel.open) {
      return;
    }
    if (!panel.emitEvent('igcClosing', { cancelable: true, detail: panel })) {
      return;
    }
    panel.hide();
    await panel.updateComplete;

    panel.emitEvent('igcClosed', { detail: panel });
  }

  private async openPanel(panel: IgcExpansionPanelComponent) {
    if (panel.open) {
      return;
    }
    if (!panel.emitEvent('igcOpening', { cancelable: true, detail: panel })) {
      return;
    }

    panel.show();
    await panel.updateComplete;

    panel.emitEvent('igcOpened', { detail: panel });
  }

  /** Hides all of the child expansion panels' contents. */
  public hideAll() {
    this.panels.forEach((p) => p.hide());
  }

  /** Shows all of the child expansion panels' contents. */
  public showAll() {
    this.panels.forEach((p) => p.show());
  }

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-accordion': IgcAccordionComponent;
  }
}
