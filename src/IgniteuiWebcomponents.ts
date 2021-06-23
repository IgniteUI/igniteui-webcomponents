import { html, css, LitElement } from 'lit';
import { styles as materialTheme } from './styles/themes/material.css';

export class IgniteuiWebcomponents extends LitElement {
  static styles = [
    css`
      :host {
        display: block;
      }
    `,
    materialTheme,
  ];

  render() {
    return html` <slot></slot> `;
  }
}
