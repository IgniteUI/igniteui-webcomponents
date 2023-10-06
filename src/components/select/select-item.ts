import { queryAssignedNodes } from 'lit/decorators.js';
import { watch } from '../common/decorators/watch.js';
import IgcDropdownItemComponent from '../dropdown/dropdown-item.js';
import { extractText } from '../common/util.js';

/**
 * Represents an item in a select list.
 *
 * @element igc-select-item
 *
 * @slot - Renders the all content bar the prefix and suffix.
 * @slot prefix - Renders content before the main content area.
 * @slot suffix - Renders content after the main content area.
 *
 * @csspart prefix - The prefix wrapper.
 * @csspart content - The main content wrapper.
 * @csspart suffix - The suffix wrapper.
 */
export default class IgcSelectItemComponent extends IgcDropdownItemComponent {
  @queryAssignedNodes({ flatten: true })
  private content!: Array<Element>;

  public static override readonly tagName = 'igc-select-item';

  @watch('active')
  protected activeChange() {
    this.tabIndex = this.active ? 0 : -1;

    if (this.active) {
      this.focus();
    }
  }

  /** Returns the text of the item without the prefix and suffix content. */
  public override get textContent() {
    return extractText(this.content).join(' ');
  }

  /** Sets the textContent of the item without touching the prefix and suffix content. */
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
