import { moveFlag } from '#internals/utils/objects.js';
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

  public get steps(): readonly IgcStepComponent[] {
    return this._steps;
  }

  public get activeStep(): IgcStepComponent | undefined {
    return this._activeStep;
  }

  /** The active step and the steps that are not disabled or linear-disabled. */
  public get navigableSteps(): IgcStepComponent[] {
    return this._steps.filter(
      (step) => step === this._activeStep || this.isAccessible(step)
    );
  }

  //#endregion

  //#region Per-step state

  /** Merges `state` into the state of `step`, and updates the step on a change. */
  public set(step: IgcStepComponent, state: Partial<StepState>): void {
    const current = this.get(step);

    if (
      current &&
      Object.entries(state).every(
        ([key, value]) => current[key as keyof StepState] === value
      )
    ) {
      return;
    }

    this._state.set(step, {
      linearDisabled: false,
      previousCompleted: false,
      visited: false,
      ...current,
      ...state,
    });
    step.requestUpdate();
  }

  public get(step: IgcStepComponent): StepState | undefined {
    return this._state.get(step);
  }

  public delete(step: IgcStepComponent): boolean {
    return this._state.delete(step);
  }

  public isAccessible(step: IgcStepComponent): boolean {
    return !(step.disabled || this.get(step)?.linearDisabled);
  }

  //#endregion

  //#region Active step management

  /** Activates a connected step of the stepper that has `active`. */
  public stepActivated(step: IgcStepComponent): void {
    if (step.isConnected && this._steps.includes(step)) {
      this.changeActiveStep(step);
    }
  }

  /** Changes the active step, deactivating the previous one and marking the new one as visited. */
  public changeActiveStep(step: IgcStepComponent): void {
    const previous = this._activeStep;

    if (step === previous) {
      return;
    }

    this._activeStep = step;
    moveFlag(previous, step, 'active');
    this.set(step, { visited: true });
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
    const steps = this.navigableSteps;
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

  /** Sets the linear mode and marks the steps up to the active one as visited. */
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
    const invalidIndex = this.linear
      ? this._steps.findIndex(
          (step) => !(step.disabled || step.optional) && step.invalid
        )
      : -1;

    for (const [index, step] of this._steps.entries()) {
      this.set(step, {
        linearDisabled: invalidIndex > -1 && index > invalidIndex,
      });
    }
  }

  /** Processes a change in the steps collection, resolving the active step and syncing state. */
  public stepsChanged(steps: IgcStepComponent[]): void {
    const added = steps.filter((step) => !this._steps.includes(step));

    this._steps = steps;
    this.syncActiveStep(added);

    // A step renders its index, which a change of the collection can shift.
    for (const step of steps) {
      step.requestUpdate();
    }
  }

  /**
   * Resolves the active step and syncs the steps. As in markup, the last of the
   * active step and the added steps that has `active` wins. Else the active step
   * stays, also when its `active` was cleared.
   */
  public syncActiveStep(added: readonly IgcStepComponent[] = []): void {
    const current = this._activeStep;
    const step =
      this._steps.findLast(
        (each) => each.active && (each === current || added.includes(each))
      ) ?? (this._steps.includes(current!) ? current : undefined);

    if (step) {
      this.changeActiveStep(step);
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

function createStepperState(): StepperState {
  return new StepperState();
}

export type { StepperState };
export { createStepperState };
