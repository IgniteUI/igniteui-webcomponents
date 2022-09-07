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

export const NAVIGATION_KEYS = new Set([
  'down',
  'up',
  'left',
  'right',
  'arrowdown',
  'arrowup',
  'arrowleft',
  'arrowright',
  'home',
  'end',
  'enter',
  'space',
  'spacebar',
  ' ',
]);

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
  private focusedStep?: IgcStepComponent;

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
  @property({ reflect: true, attribute: 'step-type' })
  public stepType: 'indicator' | 'title' | 'full' = 'full';

  /**
   * Get/Set the position of the steps title.
   *
   * @remarks
   * The default value when the stepper is horizontally orientated is `bottom`.
   * In vertical layout the default title position is `end`.
   */
  @property({ reflect: true, attribute: 'title-position' })
  public titlePosition: 'bottom' | 'top' | 'end' | 'start' = 'bottom';

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
    this.setAttribute('aria-orientation', this.orientation);
    // TODO: set correct titlePosition
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
    this.steps.forEach((step: IgcStepComponent) => {
      step.linearDisabled = this.linear;
      if (step.index <= this.activeStep.index) {
        step.visited = true;
      } else {
        step.visited = false;
      }
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
    this.addEventListener('focusHeader', (event: any) => {
      event.stopPropagation();

      this.focusedStep = event.detail;
      this.activeStep.setAttribute('tabindex', '-1');
    });
    this.addEventListener('blurHeader', (event: any) => {
      this.focusedStep = undefined;
      event.stopPropagation();
      this.activeStep.setAttribute('tabindex', '0');
    });
    this.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.target instanceof IgcStepComponent) {
        this.handleKeydown(event);
      }
    });
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tablist');
    this.setAttribute('aria-orientation', this.orientation);
  }

  protected override async firstUpdated() {
    await this.updateComplete;

    if (!this.activeStep) {
      this.activateFirstStep();
    }
  }

  public handleKeydown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (!NAVIGATION_KEYS.has(key)) {
      if (this.orientation === 'vertical' || key !== 'tab') {
        return;
      }
      if (key === 'tab' && !this.focusedStep) {
        return;
      }
      if (key === 'tab' && event.shiftKey) {
        return;
      }
    }

    event.preventDefault();
    event.stopPropagation();
    if (!this.focusedStep) {
      return;
    }

    if (this.orientation === 'horizontal') {
      if (
        key === 'up' ||
        key === 'arrowup' ||
        key === 'down' ||
        key === 'arrowdown'
      ) {
        return;
      }
    }

    this.handleNavigation(key);
  }

  public handleNavigation(key: string): void {
    switch (key) {
      case 'home':
        this.steps
          .filter((step: IgcStepComponent) => step.isAccessible)[0]
          ?.header.focus();
        break;
      case 'end':
        this.steps
          .filter((step: IgcStepComponent) => step.isAccessible)
          .pop()
          ?.header.focus();
        break;
      case 'arrowup':
      case 'up':
        this.previousStep?.header.focus();
        break;
      case 'arrowleft':
      case 'left':
        if (this.dir === 'rtl' && this.orientation === 'horizontal') {
          this.nextStep?.header.focus();
        } else {
          this.previousStep?.header.focus();
        }
        break;
      case 'arrowdown':
      case 'down':
        this.nextStep?.header.focus();
        break;
      case 'arrowright':
      case 'right':
        if (this.dir === 'rtl' && this.orientation === 'horizontal') {
          this.previousStep?.header.focus();
        } else {
          this.nextStep?.header.focus();
        }
        break;
      case ' ':
      case 'spacebar':
      case 'space':
      case 'enter':
        this.activateStep(this.focusedStep!, true);
        break;
      case 'tab':
        if (
          this.focusedStep &&
          this.focusedStep.index < this.activeStep.index
        ) {
          this.activeStep.header.focus();
        } else {
          this.activeStep.content.focus();
        }
        break;
      default:
        return;
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
      step.style.setProperty('--step-index', index.toString());
      step.active = this.activeStep === step;
      step.setAttribute('aria-setsize', this.steps.length.toString());
      step.setAttribute('posinset', (index + 1).toString());
      step.setAttribute('id', `igc-step-${index}`);
      step.setAttribute('aria-controls', `igc-content-${index}`);
      if (this.linear) {
        this.calculateLinearDisabledSteps();
      }
    });
  }

  private activateStep(step: IgcStepComponent, shouldEmit = false) {
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

  private activateFirstStep() {
    const firstEnabledStep = this.steps.find(
      (s: IgcStepComponent) => !s.disabled
    );
    if (firstEnabledStep) {
      this.activateStep(firstEnabledStep);
    }
  }

  private get nextStep(): IgcStepComponent | undefined {
    const focusedStep = this.focusedStep;
    if (focusedStep) {
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

    return undefined;
  }

  private get previousStep(): IgcStepComponent | undefined {
    const focusedStep = this.focusedStep;
    if (focusedStep) {
      if (focusedStep.index === 0) {
        return this.steps
          .filter((step: IgcStepComponent) => step.isAccessible)
          .pop();
      }

      let prevStep;
      for (let i = focusedStep.index - 1; i >= 0; i--) {
        const step = this.steps[i];
        if (step.isAccessible) {
          prevStep = step;
          break;
        }
      }

      return prevStep
        ? prevStep
        : this.steps
            .filter((step: IgcStepComponent) => step.isAccessible)
            .pop();
    }

    return undefined;
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
    this.style.setProperty('--steps-count', this.steps.length.toString());
    this.syncProperties();
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
