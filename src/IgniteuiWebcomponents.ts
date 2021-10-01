import { html, css, LitElement } from 'lit';
import { styles } from './styles/themes/material.css';

export class IgniteuiWebcomponents extends LitElement {
  /** @private */
  public static styles = [
    css`
      :host {
        display: block;
      }
    `,
    styles,
  ];

  protected render() {
    return html` <slot></slot> `;
  }
}
