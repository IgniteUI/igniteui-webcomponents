import { ContextProvider } from '@lit/context';
import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { addThemingController } from '../../theming/theming-controller.js';
import { addInternalsController } from '../common/controllers/internals.js';
import {
  addKeybindings,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowUp,
  endKey,
  homeKey,
} from '../common/controllers/key-bindings.js';
import { addSlotController, setSlots } from '../common/controllers/slot.js';
import { registerComponent } from '../common/definitions/register.js';
import type { Constructor } from '../common/mixins/constructor.js';
import { EventEmitterMixin } from '../common/mixins/event-emitter.js';
import {
  addSafeEventListener,
  first,
  getElementFromPath,
  getRoot,
  isLTR,
  last,
  wrap,
} from '../common/util.js';
import type {
  HorizontalTransitionAnimation,
  StepperOrientation,
  StepperStepType,
  StepperTitlePosition,
  StepperVerticalAnimation,
} from '../types.js';
import { STEPPER_CONTEXT } from './common/context.js';
import { createStepperState } from './common/state.js';
import type {
  IgcActiveStepChangedEventArgs,
  IgcActiveStepChangingEventArgs,
  IgcStepperComponentEventMap,
} from './common/types.js';
import IgcStepComponent from './step.js';
import { styles } from './themes/stepper/stepper.base.css.js';
import { styles as bootstrap } from './themes/stepper/stepper.bootstrap.css.js';
import { styles as fluent } from './themes/stepper/stepper.fluent.css.js';
import { styles as indigo } from './themes/stepper/stepper.indigo.css.js';

const STEPPER_SYNC_PROPERTIES: (keyof IgcStepperComponent)[] = [
  'orientation',
  'stepType',
  'contentTop',
  'verticalAnimation',
  'horizontalAnimation',
  'animationDuration',
  'titlePosition',
];

/**
 * A stepper component that provides a wizard-like workflow by dividing content into logical steps.
 *
 * @remarks
 * The stepper component allows the user to navigate between multiple `igc-step` elements.
 * It supports horizontal and vertical orientation, linear and non-linear navigation,
 * keyboard navigation, and provides API methods to control the active step.
 *
 * In linear mode, the user can only advance to the next step if the current step is valid
 * (not marked as `invalid`).
 *
 * @element igc-stepper
 *
 * @slot - Renders `igc-step` components inside the default slot.
 *
 * @fires igcActiveStepChanging - Emitted when the active step is about to change. Cancelable.
 * @fires igcActiveStepChanged - Emitted after the active step has changed.
 *
 * @example
 * ```html
 * <igc-stepper>
 *   <igc-step>
 *     <span slot="title">Step 1</span>
 *     <p>Step 1 content</p>
 *   </igc-step>
 *   <igc-step>
 *     <span slot="title">Step 2</span>
 *     <p>Step 2 content</p>
 *   </igc-step>
 * </igc-stepper>
 * ```
 *
 * @example Linear stepper with vertical orientation
 * ```html
 * <igc-stepper orientation="vertical" linear>
 *   <igc-step complete>
 *     <span slot="title">Completed step</span>
 *     <p>This step is already complete.</p>
 *   </igc-step>
 *   <igc-step active>
 *     <span slot="title">Current step</span>
 *     <p>Fill in the details to proceed.</p>
 *   </igc-step>
 *   <igc-step>
 *     <span slot="title">Next step</span>
 *     <p>Upcoming content.</p>
 *   </igc-step>
 * </igc-stepper>
 * ```
 */
export default class IgcStepperComponent extends EventEmitterMixin<
  IgcStepperComponentEventMap,
  Constructor<LitElement>
>(LitElement) {
  public static readonly tagName = 'igc-stepper';
  public static styles = styles;

  /* blazorSuppress */
  public static register(): void {
    registerComponent(IgcStepperComponent, IgcStepComponent);
  }

  //#region Internal state and properties

  private readonly _state = createStepperState();

  private readonly _contextProvider = new ContextProvider(this, {
    context: STEPPER_CONTEXT,
    initialValue: {
      stepper: this,
      state: this._state,
    },
  });

  private readonly _internals = addInternalsController(this, {
    initialARIA: {
      role: 'tablist',
    },
  });

  private readonly _slots = addSlotController(this, {
    slots: setSlots(),
    onChange: this._handleSlotChange,
  });

  private get _isHorizontal(): boolean {
    return this.orientation === 'horizontal';
  }

  //#endregion

  //#region Public attributes and properties

  /** Returns all of the stepper's steps. */
  public get steps(): readonly IgcStepComponent[] {
    return this._state.steps;
  }

  /**
   * The orientation of the stepper.
   *
   * @attr orientation
   * @default 'horizontal'
   */
  @property({ reflect: true })
  public orientation: StepperOrientation = 'horizontal';

  /**
   * The visual type of the steps.
   *
   * @attr step-type
   * @default 'full'
   */
  @property({ reflect: true, attribute: 'step-type' })
  public stepType: StepperStepType = 'full';

  /**
   * Whether the stepper is linear.
   *
   * @remarks
   * If the stepper is in linear mode and if the active step is valid only then the user is able to move forward.
   *
   * @attr linear
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public linear = false;

  /**
   * Whether the content is displayed above the steps.
   *
   * @attr content-top
   * @default false
   */
  @property({ type: Boolean, reflect: true, attribute: 'content-top' })
  public contentTop = false;

  /**
   * The animation type when in vertical mode.
   *
   * @attr vertical-animation
   * @default 'grow'
   */
  @property({ attribute: 'vertical-animation' })
  public verticalAnimation: StepperVerticalAnimation = 'grow';

  /**
   * The animation type when in horizontal mode.
   *
   * @attr horizontal-animation
   * @default 'slide'
   */
  @property({ attribute: 'horizontal-animation' })
  public horizontalAnimation: HorizontalTransitionAnimation = 'slide';

  /**
   * The animation duration in either vertical or horizontal mode in milliseconds.
   *
   * @attr animation-duration
   * @default 320
   */
  @property({ type: Number, attribute: 'animation-duration' })
  public animationDuration = 320;

  /**
   * The position of the steps title.
   *
   * @remarks
   * When the stepper is horizontally orientated the title is positioned below the indicator.
   * When the stepper is vertically orientated the title is positioned on the right side of the indicator.
   *
   * @attr title-position
   * @default 'auto'
   */
  @property({ reflect: false, attribute: 'title-position' })
  public titlePosition: StepperTitlePosition = 'auto';

  //#endregion

  constructor() {
    super();

    addSafeEventListener(this, 'click', this._handleInteraction);

    addThemingController(this, {
      light: { bootstrap, fluent, indigo },
      dark: { bootstrap, fluent, indigo },
    });

    addKeybindings(this, {
      skip: this._skipKeyboard,
    })
      .set(arrowUp, this._handleArrowUp)
      .set(arrowDown, this._handleArrowDown)
      .set(arrowLeft, this._handleArrowLeft)
      .set(arrowRight, this._handleArrowRight)
      .set(homeKey, this._handleHomeKey)
      .set(endKey, this._handleEndKey)
      .setActivateHandler(this._handleInteraction);
  }

  //#region Lifecycle hooks

  protected override update(properties: PropertyValues<this>): void {
    this._syncStepperAttributes(properties);

    if (properties.has('orientation')) {
      this._internals.setARIA({ ariaOrientation: this.orientation });
    }

    if (properties.has('linear')) {
      this._state.setVisitedState(this.linear);
    }

    if (
      properties.has('horizontalAnimation') ||
      properties.has('animationDuration')
    ) {
      const duration =
        this.horizontalAnimation !== 'none' ? this.animationDuration : 0;

      this.style.setProperty('--animation-duration', `${duration}ms`);
    }

    super.update(properties);
  }

  //#endregion

  //#region Keyboard navigation handlers

  private _skipKeyboard(_: Element, event: KeyboardEvent): boolean {
    return !getElementFromPath('[data-step-header]', event);
  }

  private _handleHomeKey(): void {
    this._getStepHeader(first(this._state.accessibleSteps))?.focus();
  }

  private _handleEndKey(): void {
    this._getStepHeader(last(this._state.accessibleSteps))?.focus();
  }

  private _handleArrowDown(): void {
    if (!this._isHorizontal) {
      const step = this._getActiveStepComponent();

      if (step) {
        this._getStepHeader(this._getNextStep(step))?.focus();
      }
    }
  }

  private _handleArrowUp(): void {
    if (!this._isHorizontal) {
      const step = this._getActiveStepComponent();

      if (step) {
        this._getStepHeader(this._getPreviousStep(step))?.focus();
      }
    }
  }

  private _handleArrowLeft(): void {
    const step = this._getActiveStepComponent();

    if (step) {
      const next = isLTR(this)
        ? this._getPreviousStep(step)
        : this._getNextStep(step);

      this._getStepHeader(next)?.focus();
    }
  }

  private _handleArrowRight(): void {
    const step = this._getActiveStepComponent();

    if (step) {
      const next = isLTR(this)
        ? this._getNextStep(step)
        : this._getPreviousStep(step);

      this._getStepHeader(next)?.focus();
    }
  }

  //#endregion

  //#region Event handlers

  private _handleInteraction(event: Event): void {
    const step = getElementFromPath(IgcStepComponent.tagName, event);

    if (step && this._state.isAccessible(step)) {
      this._activateStep(step);
    }
  }

  private _handleSlotChange(): void {
    this._state.setSteps(
      this._slots.getAssignedElements('[default]', {
        selector: IgcStepComponent.tagName,
      })
    );

    this._state.stepsChanged();
    this.style.setProperty('--steps-count', this.steps.length.toString());
  }

  //#endregion

  //#region Internal methods

  private _syncStepperAttributes(properties: PropertyValues<this>): void {
    if (STEPPER_SYNC_PROPERTIES.some((p) => properties.has(p))) {
      this._contextProvider.updateObservers();
    }
  }

  private _animateSteps(
    nextStep: IgcStepComponent,
    currentStep: IgcStepComponent
  ): void {
    const steps = this._state.steps;

    if (steps.indexOf(nextStep) > steps.indexOf(currentStep)) {
      // Animate steps in ascending/next direction
      currentStep.toggleAnimation('out');
      nextStep.toggleAnimation('in');
    } else {
      // Animate steps in descending/previous direction
      currentStep.toggleAnimation('in', 'reverse');
      nextStep.toggleAnimation('out', 'reverse');
    }
  }

  private _emitChanging(args: IgcActiveStepChangingEventArgs): boolean {
    return this.emitEvent('igcActiveStepChanging', {
      detail: args,
      cancelable: true,
    });
  }

  private _emitChanged(args: IgcActiveStepChangedEventArgs): void {
    this.emitEvent('igcActiveStepChanged', {
      detail: args,
    });
  }

  private _activateStep(step: IgcStepComponent, shouldEmit = true): void {
    if (step === this._state.activeStep) {
      return;
    }

    if (!shouldEmit) {
      this._state.changeActiveStep(step);
      return;
    }

    const steps = this._state.steps;
    const activeIndex = steps.indexOf(this._state.activeStep!);
    const index = steps.indexOf(step);

    const args = { oldIndex: activeIndex, newIndex: index };

    if (!this._emitChanging(args)) {
      return;
    }

    if (this._state.activeStep) {
      this._animateSteps(step, this._state.activeStep);
    }

    this._state.changeActiveStep(step);
    this._emitChanged({ index });
  }

  private _moveToNextStep(next = true): void {
    const step = this._state.getAdjacentStep(next);

    if (step) {
      if (this._state.activeStep) {
        this._animateSteps(step, this._state.activeStep);
      }
      this._state.changeActiveStep(step);
    }
  }

  private _getNextStep(step: IgcStepComponent): IgcStepComponent {
    const steps = this._state.accessibleSteps;
    const next = wrap(0, steps.length - 1, steps.indexOf(step) + 1);

    return steps[next];
  }

  private _getPreviousStep(step: IgcStepComponent): IgcStepComponent {
    const steps = this._state.accessibleSteps;
    const previous = wrap(0, steps.length - 1, steps.indexOf(step) - 1);

    return steps[previous];
  }

  private _getActiveStepComponent(): IgcStepComponent | null {
    const active = getRoot(this).activeElement;
    return active ? active.closest(IgcStepComponent.tagName) : null;
  }

  private _getStepHeader(step?: IgcStepComponent): HTMLElement | null {
    return step?.renderRoot.querySelector('[data-step-header]') ?? null;
  }

  //#endregion

  //#region Public API

  /** Activates the step at a given index. */
  public navigateTo(index: number): void {
    const step = this._state.steps[index];

    if (step) {
      this._activateStep(step, false);
    }
  }

  /** Activates the next enabled step. */
  public next(): void {
    this._moveToNextStep();
  }

  /** Activates the previous enabled step. */
  public prev(): void {
    this._moveToNextStep(false);
  }

  /**
   * Resets the stepper to its initial state i.e. activates the first step.
   *
   * @remarks
   * The steps' content will not be automatically reset.
   */
  public reset(): void {
    this._state.reset();
  }

  //#endregion

  protected override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'igc-stepper': IgcStepperComponent;
  }
}
