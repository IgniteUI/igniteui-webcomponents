import { LitElement, nothing } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * The list-item component is a container
 * intended for row items in the list component.
 *
 * @element igc-list-item
 *
 * @slot - Renders custom content.
 * @slot start - Renders content before all other content.
 * @slot end - Renders content after all other content.
 * @slot title - Renders the title.
 * @slot subtitle - Renders the subtitle.
 *
 * @csspart start - The start container.
 * @csspart end - The end container.
 * @csspart content - The header and custom content container.
 * @csspart header - The title and subtitle container.
 * @csspart title - The title container.
 * @csspart subtitle - The subtitle container.
 */
export default class IgcCircularGradientComponent extends LitElement {
  public static readonly tagName = 'igc-circular-gradient';

  @property()
  public offset = '0%';

  @property()
  public color!: string;

  @property({ type: Number })
  public opacity = 1;

  constructor() {
    super();
  }

  public override connectedCallback() {
    super.connectedCallback();
  }

  protected override render() {
    return nothing;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-circular-gradient': IgcCircularGradientComponent;
  }
}
