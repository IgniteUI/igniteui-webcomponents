import { ContextProvider } from '@lit/context';
import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { splitterContext } from '../common/context.js';
import { addInternalsController } from '../common/controllers/internals.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { SplitterOrientation } from '../types.js';
import IgcSplitterPaneComponent from './splitter-pane.js';
import { styles } from './themes/splitter.base.css.js';

/**
 * The Splitter component provides a framework for a simple layout, splitting the view horizontally or vertically
 * into multiple smaller resizable and collapsible areas.
 *
 * @element igc-splitter
 * *
 * @fires igc... - Emitted when ... .
 *
 * @csspart ... - ... .
 */
export default class IgcSplitterComponent extends LitElement {
  public static readonly tagName = 'igc-splitter';
  public static override styles = [styles];

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcSplitterComponent, IgcSplitterPaneComponent);
  }

  //#region Properties

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      ariaOrientation: 'horizontal',
    },
  });

  @queryAssignedElements({ selector: 'igc-splitter-pane' })
  public panes!: Array<IgcSplitterPaneComponent>;

  private readonly _context = new ContextProvider(this, {
    context: splitterContext,
    initialValue: this,
  });

  /** Gets/Sets the orientation of the splitter.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: SplitterOrientation = 'horizontal';

  /**
   * Sets the visibility of the handle and expanders in the splitter bar.
   * @remarks
   * Default value is `false`.
   * @attr
   */
  @property({ type: Boolean, attribute: 'non-collapsible', reflect: true })
  public nonCollapsible = false;

  //#endregion

  //#region Internal API

  @watch('orientation')
  protected _orientationChange(): void {
    this._internals.setARIA({ ariaOrientation: this.orientation });
    this._updateContext();
  }

  @watch('panes')
  @watch('nonCollapsible')
  private _updateContext(): void {
    this._context.setValue(this, true);
    this.requestUpdate();
  }

  //#endregion

  protected override render() {
    return html`
      <div part="base">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-splitter': IgcSplitterComponent;
  }
}
