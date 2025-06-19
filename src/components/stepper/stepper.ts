import { html, LitElement } from 'lit';
import { property, queryAssignedElements } from 'lit/decorators.js';

import { addThemingController } from '../../theming/theming-controller.js';
import { watch } from '../common/decorators/watch.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import { isLTR } from '../common/util.js';
import type {
  HorizontalTransitionAnimation,
  StepperOrientation,
  StepperStepType,
  StepperTitlePosition,
  StepperVerticalAnimation,
} from '../types.js';
import IgcStepComponent from './step.js';
import type { IgcStepperComponentEventMap } from './stepper.common.js';
import { styles } from './themes/stepper/stepper.base.css.js';
import { styles as bootstrap } from './themes/stepper/stepper.bootstrap.css.js';
import { styles as fluent } from './themes/stepper/stepper.fluent.css.js';
import { styles as indigo } from './themes/stepper/stepper.indigo.css.js';

/**
 * IgxStepper provides a wizard-like workflow by dividing content into logical steps.
 *
 * @remarks
 * The stepper component allows the user to navigate between multiple steps.
 * It supports horizontal and vertical orientation as well as keyboard navigation and provides API methods to control the active step.
 *
 * @element igc-stepper
 *
 * @slot - Renders the step components inside default slot.
 *
 * @fires igcActiveStepChanging - Emitted when the active step is about to change.
 * @fires igcActiveStepChanged - Emitted when the active step is changed.
 */

export default class IgcStepperComponent extends EventEmitterMixin<
  IgcStepperComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-stepper';
  protected static styles = styles;

  /* blazorSuppress */
  public static register() {
    registerComponent(IgcStepperComponent, IgcStepComponent);
  }

  // biome-ignore lint/complexity/noBannedTypes: No easy fix as the callback shapes are wildly different
  private readonly keyDownHandlers: Map<string, Function> = new Map(
    Object.entries({
      Enter: this.activateStep,
      Space: this.activateStep,
      SpaceBar: this.activateStep,
      ' ': this.activateStep,
      ArrowUp: this.onArrowUpKeyDown,
      ArrowDown: this.onArrowDownKeyDown,
      ArrowLeft: this.onArrowLeftKeyDown,
      ArrowRight: this.onArrowRightKeyDown,
      Home: this.onHomeKey,
      End: this.onEndKey,
    })
  );

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
  public orientation: StepperOrientation = 'horizontal';

  /** Get/Set the type of the steps.
   *
   * @remarks
   * Default value is `full`.
   */
  @property({ reflect: true, attribute: 'step-type' })
  public stepType: StepperStepType = 'full';

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

  /**
   * The animation type when in vertical mode.
   * @attr vertical-animation
   */
  @property({ attribute: 'vertical-animation' })
  public verticalAnimation: StepperVerticalAnimation = 'grow';

  /**
   * The animation type when in horizontal mode.
   * @attr horizontal-animation
   */
  @property({ attribute: 'horizontal-animation' })
  public horizontalAnimation: HorizontalTransitionAnimation = 'slide';

  /**
   * The animation duration in either vertical or horizontal mode.
   * @attr animation-duration
   */
  @property({ attribute: 'animation-duration', type: Number })
  public animationDuration = 320;

  /**
   * Get/Set the position of the steps title.
   *
   * @remarks
   * The default value is auto.
   * When the stepper is horizontally orientated the title is positioned below the indicator.
   * When the stepper is horizontally orientated the title is positioned on the right side of the indicator.
   */
  @property({ reflect: false, attribute: 'title-position' })
  public titlePosition: StepperTitlePosition = 'auto';

  @watch('orientation', { waitUntilFirstUpdate: true })
  protected orientationChange(): void {
    this.setAttribute('aria-orientation', this.orientation);
    this.steps.forEach((step: IgcStepComponent) => {
      step.orientation = this.orientation;
      this.updateAnimation(step);
    });
  }

  @watch('stepType', { waitUntilFirstUpdate: true })
  protected stepTypeChange(): void {
    this.steps.forEach((step: IgcStepComponent) => {
      step.stepType = this.stepType;
    });
  }

  @watch('titlePosition', { waitUntilFirstUpdate: true })
  protected titlePositionChange(): void {
    this.steps.forEach((step: IgcStepComponent) => {
      step.titlePosition = this.titlePosition;
    });
  }

  @watch('contentTop', { waitUntilFirstUpdate: true })
  protected contentTopChange(): void {
    this.steps.forEach((step: IgcStepComponent) => {
      step.contentTop = this.contentTop;
    });
  }

  @watch('linear', { waitUntilFirstUpdate: true })
  protected linearChange(): void {
    this.steps.forEach((step: IgcStepComponent) => {
      step.linearDisabled = this.linear;
      if (step.index <= this.activeStep.index) {
        step.visited = true;
      } else {
        step.visited = false;
      }
    });
    if (this.linear) {
      this.updateStepsLinearDisabled();
    }
  }

  @watch('verticalAnimation', { waitUntilFirstUpdate: true })
  @watch('horizontalAnimation', { waitUntilFirstUpdate: true })
  protected animationTypeChange() {
    this.steps.forEach((step: IgcStepComponent) => {
      this.updateAnimation(step);
    });
  }

  @watch('animationDuration', { waitUntilFirstUpdate: true })
  protected animationDurationChange() {
    this.steps.forEach((step: IgcStepComponent) => {
      step.animationDuration = this.animationDuration;
    });
  }

  constructor() {
    super();

    addThemingController(this, {
      light: { bootstrap, fluent, indigo },
      dark: { bootstrap, fluent, indigo },
    });

    this.addEventListener('stepActiveChanged', (event: any) => {
      event.stopPropagation();
      this.activateStep(event.target, event.detail);
    });

    this.addEventListener('stepDisabledInvalidChanged', (event: any) => {
      event.stopPropagation();
      if (this.linear) {
        this.updateStepsLinearDisabled();
      }
    });

    this.addEventListener('stepCompleteChanged', (event: any) => {
      event.stopPropagation();
      const nextStep = this.steps[event.target.index + 1];
      if (nextStep) {
        nextStep.previousComplete = event.target.complete;
      }
    });

    this.addEventListener('stepHeaderKeydown', (event: any) => {
      event.stopPropagation();
      this.handleKeydown(event.detail.event, event.detail.focusedStep);
    });
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-orientation', this.orientation);
  }

  private activateFirstStep() {
    const firstEnabledStep = this.steps.find(
      (s: IgcStepComponent) => !s.disabled
    );
    if (firstEnabledStep) {
      this.activateStep(firstEnabledStep, false);
    }
  }

  private animateSteps(
    nextStep: IgcStepComponent,
    currentStep: IgcStepComponent
  ) {
    if (nextStep.index > currentStep.index) {
      // Animate steps in ascending/next direction
      currentStep.toggleAnimation('out');
      nextStep.toggleAnimation('in');
    } else {
      // Animate steps in descending/previous direction
      currentStep.toggleAnimation('in', 'reverse');
      nextStep.toggleAnimation('out', 'reverse');
    }
  }

  private async activateStep(step: IgcStepComponent, shouldEmit = true) {
    if (step === this.activeStep) {
      return;
    }

    if (shouldEmit) {
      const args = {
        detail: {
          owner: this,
          oldIndex: this.activeStep.index,
          newIndex: step.index,
        },
        cancelable: true,
      };

      this.animateSteps(step, this.activeStep);

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
    step.visited = true;
    this.activeStep = step;
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
        i > activeStepIndex && step.isAccessible
    );

    if (nextStep) {
      this.animateSteps(nextStep, this.activeStep);
      this.activateStep(nextStep, false);
    }
  }

  private handleKeydown(event: KeyboardEvent, focusedStep: IgcStepComponent) {
    const key = event.key.toLowerCase();

    if (this.keyDownHandlers.has(event.key)) {
      event.preventDefault();
      this.keyDownHandlers.get(event.key)?.call(this, focusedStep);
    }
    if (key === 'tab' && this.orientation === 'vertical') {
      return;
    }
    if (key === 'tab' && this.activeStep.index !== focusedStep.index) {
      this.activeStep.header.focus();
    }
  }

  private onHomeKey() {
    this.steps
      .filter((step: IgcStepComponent) => step.isAccessible)[0]
      ?.header?.focus();
  }

  private onEndKey() {
    this.steps
      .filter((step: IgcStepComponent) => step.isAccessible)
      .pop()
      ?.header?.focus();
  }

  private onArrowDownKeyDown(focusedStep: IgcStepComponent) {
    if (this.orientation === 'horizontal') {
      return;
    }
    this.getNextStep(focusedStep)?.header?.focus();
  }

  private onArrowUpKeyDown(focusedStep: IgcStepComponent) {
    if (this.orientation === 'horizontal') {
      return;
    }
    this.getPreviousStep(focusedStep)?.header?.focus();
  }

  private onArrowRightKeyDown(focusedStep: IgcStepComponent) {
    if (!isLTR(this) && this.orientation === 'horizontal') {
      this.getPreviousStep(focusedStep)?.header?.focus();
    } else {
      this.getNextStep(focusedStep)?.header?.focus();
    }
  }

  private onArrowLeftKeyDown(focusedStep: IgcStepComponent) {
    if (!isLTR(this) && this.orientation === 'horizontal') {
      this.getNextStep(focusedStep)?.header?.focus();
    } else {
      this.getPreviousStep(focusedStep)?.header?.focus();
    }
  }

  private getNextStep(
    focusedStep: IgcStepComponent
  ): IgcStepComponent | undefined {
    if (focusedStep.index === this.steps.length - 1) {
      return this.steps.find((step: IgcStepComponent) => step.isAccessible);
    }

    const nextAccessible = this.steps.find(
      (step: IgcStepComponent, i: number) =>
        i > focusedStep.index && step.isAccessible
    );
    return nextAccessible
      ? nextAccessible
      : this.steps.find((step: IgcStepComponent) => step.isAccessible);
  }

  private getPreviousStep(
    focusedStep: IgcStepComponent
  ): IgcStepComponent | undefined {
    if (focusedStep.index === 0) {
      return this.steps
        .filter((step: IgcStepComponent) => step.isAccessible)
        .pop();
    }

    let prevStep: IgcStepComponent | undefined;
    for (let i = focusedStep.index - 1; i >= 0; i--) {
      const step = this.steps[i];
      if (step.isAccessible) {
        prevStep = step;
        break;
      }
    }

    return prevStep
      ? prevStep
      : this.steps.filter((step: IgcStepComponent) => step.isAccessible).pop();
  }

  private updateStepsLinearDisabled(): void {
    const firstInvalidStep = this.steps
      .filter((step: IgcStepComponent) => !step.disabled && !step.optional)
      .find((step: IgcStepComponent) => step.invalid);
    if (firstInvalidStep) {
      this.steps.forEach((step: IgcStepComponent) => {
        if (step.index <= firstInvalidStep.index) {
          step.linearDisabled = false;
        } else {
          step.linearDisabled = true;
        }
      });
    } else {
      this.steps.forEach((step: IgcStepComponent) => {
        step.linearDisabled = false;
      });
    }
  }

  private updateAnimation(step: IgcStepComponent) {
    if (this.orientation === 'horizontal') {
      step.animation = this.horizontalAnimation;
    }

    if (this.orientation === 'vertical') {
      step.animation = this.verticalAnimation;
    }
  }

  private syncProperties(): void {
    this.steps.forEach((step: IgcStepComponent, index: number) => {
      step.orientation = this.orientation;
      step.stepType = this.stepType;
      step.titlePosition = this.titlePosition;
      step.contentTop = this.contentTop;
      step.index = index;
      step.active = this.activeStep === step;
      step.header?.setAttribute('aria-posinset', (index + 1).toString());
      step.header?.setAttribute('aria-setsize', this.steps.length.toString());
      step.header?.setAttribute('id', `igc-step-header-${index}`);
      step.header?.setAttribute('aria-controls', `igc-step-content-${index}`);
      if (index > 0) {
        step.previousComplete = this.steps[index - 1].complete;
      }
      step.animationDuration = this.animationDuration;
      this.updateAnimation(step);
    });
  }

  private stepsChanged(): void {
    this.style.setProperty('--steps-count', this.steps.length.toString());

    const lastActiveStep = this.steps
      .reverse()
      .find((step: IgcStepComponent) => step.active);
    if (!lastActiveStep) {
      // initially when there isn't a predefined active step or when the active step is removed
      this.activateFirstStep();
    } else {
      // activate the last step marked as active
      this.activateStep(lastActiveStep, false);
    }

    this.syncProperties();
    if (this.linear) {
      this.updateStepsLinearDisabled();
    }
  }

  /** Activates the step at a given index. */
  public navigateTo(index: number) {
    const step = this.steps[index];
    if (!step) {
      return;
    }
    this.activateStep(step, false);
  }

  /** Activates the next enabled step. */
  public next(): void {
    this.moveToNextStep();
  }

  /** Activates the previous enabled step. */
  public prev(): void {
    this.moveToNextStep(false);
  }

  /**
   * Resets the stepper to its initial state i.e. activates the first step.
   *
   * @remarks
   * The steps' content will not be automatically reset.
   */
  public reset(): void {
    this.steps.forEach((step) => {
      step.visited = false;
    });
    this.activateFirstStep();
  }

  protected override render() {
    return html`<slot @slotchange=${this.stepsChanged}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-stepper': IgcStepperComponent;
  }
}
