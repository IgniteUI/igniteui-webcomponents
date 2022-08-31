import { html, LitElement } from 'lit';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { defineComponents } from '../common/definitions/defineComponents';
import { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { SizableMixin } from '../common/mixins/sizable.js';
import { IgcStepperEventMap } from './stepper.common';
import IgcStepComponent from './step';
import { Direction } from '../common/types.js';
import { themes } from '../../theming/theming-decorator.js';
import { styles } from '../stepper/themes/stepper/stepper.base.css.js';
import { styles as bootstrap } from '../stepper/themes/stepper/light/stepper.bootstrap.css.js';
import { styles as indigo } from '../stepper/themes/stepper/light/stepper.indigo.css.js';
import { styles as fluent } from '../stepper/themes/stepper/light/stepper.fluent.css.js';
import { styles as material } from '../stepper/themes/stepper/light/stepper.material.css.js';
import { watch } from '../common/decorators/watch.js';

defineComponents(IgcStepComponent);

@themes({ bootstrap, indigo, fluent, material })
export default class IgcStepperComponent extends SizableMixin(
  EventEmitterMixin<IgcStepperEventMap, Constructor<LitElement>>(LitElement)
) {
  /** @private */
  public static readonly tagName = 'igc-stepper';

  /** @private */
  protected static styles = styles;

  /** Returns all of the stepper's steps. */
  @queryAssignedElements({ selector: 'igc-step' })
  public steps!: Array<IgcStepComponent>;

  @state()
  protected activeStep?: IgcStepComponent;

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

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected orientationChange(): void {
    this.steps.forEach(
      (step: IgcStepComponent) => (step.orientation = this.orientation)
    );
  }

  @watch('stepType', { waitUntilFirstUpdate: true })
  protected stepTypeChange(): void {
    this.steps.forEach(
      (step: IgcStepComponent) => (step.stepType = this.stepType)
    );
  }

  @watch('titlePosition', { waitUntilFirstUpdate: true })
  protected titlePositionChange(): void {
    this.steps.forEach(
      (step: IgcStepComponent) => (step.titlePosition = this.titlePosition)
    );
  }

  @watch('contentTop', { waitUntilFirstUpdate: true })
  protected contentTopChange(): void {
    this.steps.forEach(
      (step: IgcStepComponent) => (step.contentTop = this.contentTop)
    );
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this.syncProperties();
  }

  private syncProperties(): void {
    this.steps.forEach((step: IgcStepComponent, index: number) => {
      step.orientation = this.orientation;
      step.stepType = this.stepType;
      step.titlePosition = this.titlePosition;
      step.contentTop = this.contentTop;
      step.index = index;
      step.active = this.activeStep === step;
    });
  }

  private stepsChange(): void {
    this.syncProperties();
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
