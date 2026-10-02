import type { PropertyValues } from 'lit';
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

  /** Steps that are not disabled or linear-disabled. */
  public get accessibleSteps(): IgcStepComponent[] {
    return this._steps.filter((step) => this.isAccessible(step));
  }

  //#endregion

  //#region Per-step state

  /** Merges `state` into the state of `step` and updates the step. */
  public set(step: IgcStepComponent, state: Partial<StepState>): void {
    this._state.set(step, {
      linearDisabled: false,
      previousCompleted: false,
      visited: false,
      ...this.get(step),
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

  public setSteps(steps: IgcStepComponent[]): void {
    this._steps = steps;
  }

  /** Changes the active step, deactivating the previous one and marking the new one as visited. */
  public changeActiveStep(step: IgcStepComponent): void {
    if (step === this._activeStep) {
      return;
    }

    moveFlag(this._activeStep, step, 'active');
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

function createStepperState(): StepperState {
  return new StepperState();
}

export type { StepperState };
export { createStepperState };
