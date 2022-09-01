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

  // Map containing the currennt steps and their event listener functions
  private _stepsAndListeners: Map<IgcStepComponent, any> = new Map();
  private activeStep!: IgcStepComponent;
  private _init = true;

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

  @watch('linear', { waitUntilFirstUpdate: true })
  protected linearChange(): void {
    if (this.linear) {
      this.calculateLinearDisabledSteps();
    }
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    this.steps.forEach((step: IgcStepComponent) => {
      if (step.active) {
        this.activeStep = step;
      }
      this._stepsAndListeners.set(step, null);
    });
    if (!this.activeStep) {
      this.activateFirstStep();
    }
    this.syncProperties(this.steps);
    this._init = false;
  }

  public override disconnectedCallback() {
    this._stepsAndListeners.forEach(this.removeStepsEventListeners);
    this._stepsAndListeners.clear();
  }

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

  private syncProperties(steps: IgcStepComponent[]): void {
    steps.forEach((step: IgcStepComponent, index: number) => {
      step.orientation = this.orientation;
      step.stepType = this.stepType;
      step.titlePosition = this.titlePosition;
      step.contentTop = this.contentTop;
      step.index = index;
      step.active = this.activeStep === step;
      if (this.linear) {
        step.isAccessible =
          step.index > this.activeStep.index && this.activeStep.invalid;
      }
      const activeStepChangedHandler = (event: any) => {
        event.stopPropagation();
        this.activateStep(step);
      };
      const invalidStateChangedHandler = (event: any) => {
        event.stopPropagation();
        if (this.linear) {
          console.log('linear');
          this.calculateLinearDisabledSteps();
        }
      };
      step.addEventListener('activeStepChanged', activeStepChangedHandler);
      step.addEventListener(
        'stepInvalidStateChanged',
        invalidStateChangedHandler
      );
      this._stepsAndListeners.set(step, {
        activeStepChangedHandler,
        invalidStateChangedHandler,
      });
    });
  }

  private activateStep(step: IgcStepComponent) {
    if (step === this.activeStep) {
      return;
    }

    if (this.activeStep) {
      this.activeStep.active = false;
    }

    step.active = true;
    this.activeStep = step;
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
    let steps: IgcStepComponent[] = this.steps;
    let activeStepIndex = this.activeStep.index;
    if (!next) {
      steps = this.steps.reverse();
      activeStepIndex = steps.findIndex((s) => s === this.activeStep);
    }

    const nextStep = steps.find(
      (s, i) => i > activeStepIndex && s.isAccessible
    );
    if (nextStep) {
      this.activateStep(nextStep);
    }
  }

  private calculateLinearDisabledSteps(): void {
    this.steps.forEach((step) => {
      if (
        step.disabled ||
        (step.index > this.activeStep.index && this.activeStep.invalid)
      ) {
        step.isAccessible = false;
      } else {
        step.isAccessible = true;
      }
    });
  }

  private stepsChanged(): void {
    if (!this._init) {
      // update step indexes
      // and set up properties and event listener for newly added steps
      this.steps.forEach((step: IgcStepComponent, index: number) => {
        step.index = index;
        if (!this._stepsAndListeners.has(step)) {
          this._stepsAndListeners.set(step, null);
          this.syncProperties([step]);
        }
      });

      // remove the event listener from the deleted steps
      const currentSteps = new Set(this.steps);
      Array.from(this._stepsAndListeners.keys()).forEach(
        (step: IgcStepComponent) => {
          if (!currentSteps.has(step)) {
            const eventHandlers = this._stepsAndListeners.get(step);
            this.removeStepsEventListeners(eventHandlers, step);
            this._stepsAndListeners.delete(step);
          }
        }
      );
    }
  }

  private removeStepsEventListeners(
    eventHandlers: any,
    step: IgcStepComponent
  ): void {
    step.removeEventListener(
      'activeStepChanged',
      eventHandlers.activeStepChangedHandler
    );
    step.removeEventListener(
      'stepInvalidStateChanged',
      eventHandlers.invalidStateChangedHandler
    );
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
