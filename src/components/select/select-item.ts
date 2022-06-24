import { queryAssignedNodes } from 'lit/decorators.js';
import IgcDropdownItemComponent from '../dropdown/dropdown-item';

export default class IgcSelectItemComponent extends IgcDropdownItemComponent {
  @queryAssignedNodes({ flatten: true })
  private content!: Array<Element>;

  public static override readonly tagName =
    'igc-select-item' as 'igc-dropdown-item';

  constructor() {
    super();
  }

  protected override firstUpdated() {
    console.log(this.content);
  }

  public override get textContent() {
    return this.content
      .map((t) => t.textContent?.trim())
      .filter((t) => t !== '')
      .join(' ');
  }

  public override set textContent(value: string) {
    const text = new Text(value);
    this.content.forEach((n) => n.remove());
    this.appendChild(text);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-select-item': IgcSelectItemComponent;
  }
}
