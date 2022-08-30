import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { watch } from '../common/decorators';
import { defineComponents } from '../common/definitions/defineComponents';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { IgcStepperEventMap } from './stepper.common';
import IgcStepComponent from './step';
import { Direction } from '../common/types.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from '../stepper/themes/stepper.base.css.js';
import { styles as bootstrap } from '../stepper/themes/light/stepper.bootstrap.css.js';
import { styles as indigo } from '../stepper/themes/light/stepper.indigo.css.js';
import { styles as fluent } from '../stepper/themes/light/stepper.fluent.css.js';
import { styles as material } from '../stepper/themes/light/stepper.material.css.js';

defineComponents(IgcStepComponent);

@themes({ bootstrap, indigo, fluent, material })
export default class IgcStepperComponent extends SizableMixin(
  EventEmitterMixin<IgcStepperEventMap, Constructor<LitElement>>(LitElement)
) {
  protected static styles = styles;

  /** @private */
  public static readonly tagName = 'igc-stepper';

  @queryAssignedElements({ selector: 'igc-step' })
  public steps!: Array<IgcStepComponent>;

  /** Gets/Sets the orientation of the stepper.
   *
   * @remarks
   * Default value is `horizontal`.
   */
  @property({ reflect: true })
  public orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Get/Set the type of the steps.
   *
   * @remarks
   * Default value is `full`.
   */
  @property({ reflect: true })
  public stepType: 'indicator' | 'title' | 'full' = 'full';

  /**
   * Get/Set the position of the steps title.
   *
   * @remarks
   * The default value when the stepper is horizontally orientated is `bottom`.
   * In vertical layout the default title position is `end`.
   */
  @property({ reflect: true })
  public titlePosition: 'bottom' | 'top' | 'end' | 'start' = 'end';

  /**
   * Get/Set whether the stepper is linear.
   *
   * @remarks
   * If the stepper is in linear mode and if the active step is valid only then the user is able to move forward.
   */
  @property({ type: Boolean })
  public linear = false;

  /**
   * Get/Set whether the content is displayed above the steps.
   *
   * @remarks
   * Default value is `false` and the content is below the steps.
   */
  @property({ type: Boolean })
  public contentTop = false;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: Direction = 'auto';

  @watch('stepType', { waitUntilFirstUpdate: true })
  protected selectionModeChange(): void {
    this.steps?.forEach((step: IgcStepComponent) => {
      step.requestUpdate();
    });
  }

  private stepsChange(): void {
    this.steps?.forEach((step: IgcStepComponent) => {
      step.requestUpdate();
    });
  }

  protected override render() {
    return html`<slot @slotchange=${this.stepsChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-stepper': IgcStepperComponent;
  }
}
