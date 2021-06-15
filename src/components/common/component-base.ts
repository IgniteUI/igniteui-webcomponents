import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export abstract class IgcBaseComponent extends LitElement {
  @property()
  size: 'small' | 'medium' | 'large' = 'large';
}
