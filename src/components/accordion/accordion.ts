import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';

export default class IgcAccordionComponent extends LitElement {
  public static readonly tagName = 'igc-accordion';
  //public static styles = styles;

  @property({ reflect: true, type: Boolean })
  public singleBranchExpand = false;

  private get _enabledPanels(): Array<IgcExpansionPanelComponent> {
    return this.panels.filter((p) => !p.disabled);
  }

  /** Returns all of the accordions's direct igc-expansion-panel children. */
  public get panels(): Array<IgcExpansionPanelComponent> {
    return Array.from(this.querySelectorAll(`igc-expansion-panel`)).filter(
      (p) => p.parentNode === this
    );
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.panels.forEach((p) => {
      p.addEventListener('igcOpening', this.handlePanelOpening);
      p.addEventListener('keydown', this.handleKeydown, { capture: true });
    });
  }

  private handlePanelOpening = (
    event: CustomEvent<IgcExpansionPanelComponent>
  ) => {
    if (!this.singleBranchExpand) {
      return;
    }
    this._enabledPanels.forEach((p) => {
      if (p.open && p !== event.detail) {
        p.closeWithEvent();
      }
    });
  };

  private handleKeydown = (event: KeyboardEvent) => {
    switch (event.key.toLowerCase()) {
      case 'home':
        this.getPanelHeader(this._enabledPanels[0]).focus();
        break;
      case 'end':
        this.getPanelHeader(this._enabledPanels.slice(-1)[0]).focus();
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
      if (this.singleBranchExpand && !isUp) {
        this._enabledPanels.forEach((p) =>
          p !== focusedPanel ? p.closeWithEvent() : p.openWithEvent()
        );
        return;
      }

      if (isUp) {
        this._enabledPanels.forEach((p) => p.closeWithEvent());
      } else {
        this._enabledPanels.forEach((p) => p.openWithEvent());
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

  /** Hides all of the child expansion panels' contents. */
  public hideAll() {
    this.panels.forEach((p) => (p.open = false));
  }

  /** Shows all of the child expansion panels' contents. */
  public showAll() {
    this.panels.forEach((p) => (p.open = true));
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
