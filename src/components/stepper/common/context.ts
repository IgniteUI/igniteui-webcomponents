import { createContext } from '@lit/context';
import type IgcStepperComponent from '../stepper.js';
import type { StepperState } from './state.js';

export type StepperContext = {
  stepper: IgcStepperComponent;
  state: StepperState;
};

export const STEPPER_CONTEXT = createContext<StepperContext>(
  Symbol('stepper-context')
);
