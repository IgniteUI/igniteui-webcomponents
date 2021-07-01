import { html, css, LitElement } from 'lit';
import { styles } from './styles/themes/material.css';

export class IgniteuiWebcomponents extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    styles,
  ];

  render() {
    return html` <slot></slot> `;
  }
}
