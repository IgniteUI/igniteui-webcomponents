import { html, LitElement } from 'lit';
import { SizableMixin } from '../common/mixins/sizable';

export class IgcListComponent extends SizableMixin(LitElement) {
  render() {
    return html` <slot></slot> `;
  }
}
