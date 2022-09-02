import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';
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

  private activeStep!: IgcStepComponent;

  /** Returns all of the stepper's steps. */
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
  @property({ reflect: true, type: Boolean, attribute: 'content-top' })
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
    Promise.resolve().then(() => {
      this.updateCssVars();
    });
  }

  @watch('contentTop', { waitUntilFirstUpdate: true })
  protected contentTopChange(): void {
    this.steps.forEach(
      (step: IgcStepComponent) => (step.contentTop = this.contentTop)
    );
  }

  @watch('linear', { waitUntilFirstUpdate: true })
  protected linearChange(): void {
    this.steps.forEach((step: IgcStepComponent) => {
      step.linearDisabled = this.linear;
    });
    if (this.linear) {
      this.calculateLinearDisabledSteps();
    }
  }

  constructor() {
    super();
    this.addEventListener('activeStepChanged', (event: any) => {
      event.stopPropagation();
      this.activateStep(event.target, event.detail);
    });
    this.addEventListener('stepInvalidStateChanged', (event: any) => {
      event.stopPropagation();
      if (this.linear) {
        this.calculateLinearDisabledSteps();
      }
    });
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    if (!this.activeStep) {
      this.activateFirstStep();
    }
  }

  /** Activates the step at a given index. */
  public navigateTo(index: number) {
    const step = this.steps[index];
    if (!step) {
      return;
    }
    this.activateStep(step);
  }

  /** Activates the next enabled step. */
  public next(): void {
    this.moveToNextStep();
  }

  /** Activates the previous enabled step. */
  public prev(): void {
    this.moveToNextStep(false);
  }

  private syncProperties(): void {
    this.steps.forEach((step: IgcStepComponent, index: number) => {
      step.orientation = this.orientation;
      step.stepType = this.stepType;
      step.titlePosition = this.titlePosition;
      step.contentTop = this.contentTop;
      step.index = index;
      step.active = this.activeStep === step;
      if (this.linear) {
        this.calculateLinearDisabledSteps();
      }
    });
  }

  private activateStep(step: IgcStepComponent, shouldEmit = false) {
    if (step === this.activeStep) {
      return;
    }

    console.log('activate step after check for current');

    if (shouldEmit) {
      console.log('emitted!!!!!!!!!!!!');
      const args = {
        detail: {
          owner: this,
          oldIndex: this.activeStep.index,
          newIndex: step.index,
        },
        cancelable: true,
      };

      const allowed = this.emitEvent('igcActiveStepChanging', args);

      if (!allowed) {
        return;
      }
      this.changeActiveStep(step);
      this.emitEvent('igcActiveStepChanged', {
        detail: { owner: this, index: step.index },
      });
    } else {
      this.changeActiveStep(step);
    }
  }

  private changeActiveStep(step: IgcStepComponent) {
    if (this.activeStep) {
      this.activeStep.active = false;
    }

    step.active = true;
    this.activeStep = step;
    this.updateCssVars();
  }

  private activateFirstStep() {
    const firstEnabledStep = this.steps.find(
      (s: IgcStepComponent) => !s.disabled
    );
    if (firstEnabledStep) {
      this.activateStep(firstEnabledStep);
    }
  }

  private moveToNextStep(next = true) {
    let steps = this.steps;
    let activeStepIndex = this.activeStep.index;
    if (!next) {
      steps = this.steps.reverse();
      activeStepIndex = steps.findIndex(
        (step: IgcStepComponent) => step === this.activeStep
      );
    }

    const nextStep = steps.find(
      (step: IgcStepComponent, i: number) =>
        i > activeStepIndex && !step.disabled && !step.linearDisabled
    );
    if (nextStep) {
      this.activateStep(nextStep);
    }
  }

  public calculateLinearDisabledSteps(): void {
    if (!this.activeStep) {
      return;
    }

    if (!this.activeStep.invalid) {
      const firstRequiredIndex = this.getNextRequiredStep();
      if (firstRequiredIndex !== -1) {
        this.updateLinearDisabledSteps(firstRequiredIndex);
      } else {
        this.steps.forEach(
          (step: IgcStepComponent) => (step.linearDisabled = false)
        );
      }
    } else {
      this.steps.forEach((step: IgcStepComponent) => {
        if (step.index > this.activeStep.index) {
          step.linearDisabled = true;
        }
      });
    }
  }

  private updateLinearDisabledSteps(toIndex: number): void {
    this.steps.forEach((step: IgcStepComponent) => {
      if (step.index > this.activeStep.index) {
        if (step.index <= toIndex) {
          step.linearDisabled = false;
        } else {
          step.linearDisabled = true;
        }
      }
    });
  }

  private getNextRequiredStep(): number {
    if (!this.activeStep) {
      return -1;
    }
    return this.steps.findIndex(
      (step: IgcStepComponent) =>
        step.index > this.activeStep.index &&
        !step.optional &&
        !step.disabled &&
        step.invalid
    );
  }

  protected stepsChanged(): void {
    this.syncProperties();
  }

  private updateCssVars() {
    console.log('updateCss');
    this.style.setProperty(
      '--step-body-height',
      this.activeStep.body[0].clientHeight + 'px'
    );
    this.style.setProperty(
      '--step-header-height',
      this.activeStep.header.clientHeight + 'px'
    );
  }

  protected override render() {
    return html`<div part="stepper">
      <slot @slotchange=${this.stepsChanged}></slot>
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-stepper': IgcStepperComponent;
  }
}
