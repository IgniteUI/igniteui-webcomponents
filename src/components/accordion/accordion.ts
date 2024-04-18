import { LitElement, html } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import {
  addKeybindings,
  altKey,
  arrowDown,
  arrowUp,
  endKey,
  homeKey,
  shiftKey,
} from '../common/controllers/key-bindings.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { registerComponent } from '../common/definitions/register.js';
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
  public static register() {
    registerComponent(IgcAccordionComponent, IgcExpansionPanelComponent);
  }

  @queryAssignedElements({ selector: 'igc-expansion-panel:not([disabled])' })
  private enabledPanels!: Array<IgcExpansionPanelComponent>;

  private get firstEnabled() {
    return this.enabledPanels[0];
  }

  private get lastEnabled() {
    return this.enabledPanels[this.enabledPanels.length - 1];
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

    this.addEventListener('igcOpening', this.handlePanelOpening);

    addKeybindings(this, {
      skip: this.skipKeybinding,
      bindingDefaults: { preventDefault: true },
    })
      .set(homeKey, () => this.getPanelHeader(this.firstEnabled).focus())
      .set(endKey, () => this.getPanelHeader(this.lastEnabled).focus())
      .set(arrowUp, this.navigatePrev)
      .set(arrowDown, this.navigateNext)
      .set([shiftKey, altKey, arrowDown], this.expandAll)
      .set([shiftKey, altKey, arrowUp], this.collapseAll);
  }

  private skipKeybinding(target: Element) {
    return !(
      target.matches(IgcExpansionPanelComponent.tagName) &&
      this.enabledPanels.includes(target as IgcExpansionPanelComponent)
    );
  }

  private navigatePrev(event: KeyboardEvent) {
    const current = event.target as IgcExpansionPanelComponent;
    const next = this.getNextPanel(current, -1);

    if (event.altKey || next === current) {
      return;
    }

    this.getPanelHeader(next).focus();
  }

  private navigateNext(event: KeyboardEvent) {
    const current = event.target as IgcExpansionPanelComponent;
    const next = this.getNextPanel(current, 1);

    if (event.altKey || next === current) {
      return;
    }

    this.getPanelHeader(next).focus();
  }

  private collapseAll() {
    const panels = this.enabledPanels;
    for (const panel of panels) {
      this.closePanel(panel);
    }
  }

  private expandAll(event: KeyboardEvent) {
    const current = event.target as IgcExpansionPanelComponent;
    const panels = this.enabledPanels;

    if (this.singleExpand) {
      for (const panel of panels) {
        current === panel ? this.openPanel(panel) : this.closePanel(panel);
      }
    } else {
      for (const panel of panels) {
        this.openPanel(panel);
      }
    }
  }

  private handlePanelOpening(event: Event) {
    const panel = event.target as IgcExpansionPanelComponent;
    if (!this.singleExpand || !this.panels.includes(panel)) {
      return;
    }
    this.enabledPanels.forEach((p) => {
      if (p.open && p !== panel) {
        this.closePanel(p);
      }
    });
  }

  private getNextPanel(panel: IgcExpansionPanelComponent, dir: 1 | -1 = 1) {
    const idx = this.enabledPanels.indexOf(panel);
    return this.enabledPanels[idx + dir] || panel;
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
