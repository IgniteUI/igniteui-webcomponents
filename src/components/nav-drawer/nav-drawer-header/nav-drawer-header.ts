import { html, LitElement } from 'lit';
//import { styles } from './navbar.material.css';

export class IgcNavDrawerHeaderComponent extends LitElement {
  //static styles = [styles];

  render() {
    return html` <slot></slot> `;
  }
}
