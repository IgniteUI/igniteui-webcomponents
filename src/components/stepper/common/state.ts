import type { PropertyValues } from 'lit';
import type IgcStepComponent from '../step.js';

type StepState = {
  linearDisabled: boolean;
  previousCompleted: boolean;
  visited: boolean;
};

class StepperState {
  private readonly _state = new WeakMap<IgcStepComponent, StepState>();

  private _steps: IgcStepComponent[] = [];
  private _activeStep?: IgcStepComponent;

  public linear = false;

  //#region Collection accessors

  /** Returns all registered step components. */
  public get steps(): readonly IgcStepComponent[] {
    return this._steps;
  }

  /** Returns the currently active step. */
  public get activeStep(): IgcStepComponent | undefined {
    return this._activeStep;
  }

  /** Returns all steps that are currently accessible (not disabled or linear-disabled). */
  public get accessibleSteps(): IgcStepComponent[] {
    return this._steps.filter((step) => this.isAccessible(step));
  }

  //#endregion

  //#region Per-step state

  /**
   * Sets the state of a given step component.
   *
   * If the step already has an existing state, it merges the new state with the existing one.
   * If the step does not have an existing state, it initializes it with default values and then applies the new state.
   *
   * After updating the state, it requests an update on the step component to reflect the changes in the UI.
   */
  public set(step: IgcStepComponent, state: Partial<StepState>): void {
    this.has(step)
      ? this._state.set(step, { ...this.get(step)!, ...state })
      : this._state.set(step, {
          linearDisabled: false,
          previousCompleted: false,
          visited: false,
          ...state,
        });

    step.requestUpdate();
  }

  /** Checks if a given step component has an associated state. */
  public has(step: IgcStepComponent): boolean {
    return this._state.has(step);
  }

  /** Retrieves the state of a given step component. */
  public get(step: IgcStepComponent): StepState | undefined {
    return this._state.get(step);
  }

  /** Deletes the state of a given step component. */
  public delete(step: IgcStepComponent): boolean {
    return this._state.delete(step);
  }

  /**
   * Determines if a given step component is accessible based on its `disabled` state
   * and the `linearDisabled` state from the stepper state management.
   */
  public isAccessible(step: IgcStepComponent): boolean {
    return !(step.disabled || this.get(step)?.linearDisabled);
  }

  //#endregion

  //#region Active step management

  /** Updates the registered steps collection. */
  public setSteps(steps: IgcStepComponent[]): void {
    this._steps = steps;
  }

  /** Changes the active step, deactivating the previous one and marking the new one as visited. */
  public changeActiveStep(step: IgcStepComponent): void {
    if (step === this._activeStep) {
      return;
    }

    if (this._activeStep) {
      this._activeStep.active = false;
    }
    step.active = true;
    this.set(step, { visited: true });
    this._activeStep = step;
  }

  /** Activates the first non-disabled step. */
  public activateFirstStep(): void {
    const step = this._steps.find((s) => !s.disabled);
    if (step) {
      this.changeActiveStep(step);
    }
  }

  /** Returns the next or previous accessible step relative to the active step. */
  public getAdjacentStep(next = true): IgcStepComponent | undefined {
    const steps = this.accessibleSteps;
    const activeIndex = steps.indexOf(this._activeStep!);

    if (activeIndex === -1) {
      return undefined;
    }

    return next ? steps[activeIndex + 1] : steps[activeIndex - 1];
  }

  //#endregion

  //#region State synchronization

  /** Synchronizes the `active` and `previousCompleted` state across all steps. */
  public syncState(): void {
    for (const [index, step] of this._steps.entries()) {
      step.active = this._activeStep === step;

      if (index > 0) {
        this.set(step, {
          previousCompleted: this._steps[index - 1].complete,
        });
      }
    }
  }

  /**
   * Sets the visited state for all steps based on the current active step and the linear mode.
   */
  public setVisitedState(value: boolean): void {
    const activeIndex = this._steps.indexOf(this._activeStep!);
    this.linear = value;

    for (const [index, step] of this._steps.entries()) {
      this.set(step, { visited: index <= activeIndex });
    }

    this.setLinearState();
  }

  /** Computes and applies the linear-disabled state for all steps. */
  public setLinearState(): void {
    if (!this.linear) {
      for (const step of this._steps) {
        this.set(step, { linearDisabled: false });
      }
      return;
    }

    const invalidIndex = this._steps.findIndex(
      (step) => !(step.disabled || step.optional) && step.invalid
    );

    if (invalidIndex > -1) {
      for (const [index, step] of this._steps.entries()) {
        this.set(step, { linearDisabled: index > invalidIndex });
      }
    } else {
      for (const step of this._steps) {
        this.set(step, { linearDisabled: false });
      }
    }
  }

  /** Handles step property changes, updating active step tracking and re-syncing state. */
  public onStepPropertyChanged(
    step: IgcStepComponent,
    changed: PropertyValues<IgcStepComponent>
  ): void {
    if (changed.has('active') && step.active) {
      this.changeActiveStep(step);
    }
    this.syncState();
    this.setLinearState();
  }

  /** Processes a change in the steps collection, resolving the active step and syncing state. */
  public stepsChanged(): void {
    const lastActiveStep = this._steps.findLast((step) => step.active);

    if (lastActiveStep) {
      this.changeActiveStep(lastActiveStep);
    } else {
      this.activateFirstStep();
    }

    this.syncState();
    this.setLinearState();
  }

  /** Resets all step states and activates the first step. */
  public reset(): void {
    for (const step of this._steps) {
      this.delete(step);
    }

    this.activateFirstStep();
    this.setLinearState();
  }

  //#endregion
}

/**
 * Creates a new instance of the StepperState class, which manages the state of steps in a stepper component.
 */
function createStepperState(): StepperState {
  return new StepperState();
}

export type { StepperState };
export { createStepperState };
