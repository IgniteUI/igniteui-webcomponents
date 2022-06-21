import { LitElement, html } from 'lit';
import { property } from 'lit/decorators.js';
import IgcExpansionPanelComponent from '../expansion-panel/expansion-panel.js';

export default class IgcAccordionComponent extends LitElement {
  public static readonly tagName = 'igc-accordion';
  //public static styles = styles;

  @property({ reflect: true, type: Boolean })
  public singleBranchExpand = false;

  /** Returns all of the accordions's direct igc-expansion-panel children. */
  public get panels(): Array<IgcExpansionPanelComponent> {
    return Array.from(this.querySelectorAll(`igc-expansion-panel`)).filter(
      (p) => p.parentNode === this
    );
  }

  public hideAll() {}

  public showAll() {}

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-accordion': IgcAccordionComponent;
  }
}
