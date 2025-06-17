import type {
  LitElement,
  ReactiveController,
  ReactiveControllerHost,
} from 'lit';

type ElementInternalsConfig = {
  initialARIA: Partial<Record<keyof ARIAMixin, string | null>>;
};

class ElementInternalsController implements ReactiveController {
  private readonly _host: ReactiveControllerHost & LitElement;
  private readonly _internals: ElementInternals;

  public get form(): HTMLFormElement | null {
    return this._internals.form;
  }

  constructor(
    host: ReactiveControllerHost & LitElement,
    config?: ElementInternalsConfig
  ) {
    this._host = host;
    this._internals = this._host.attachInternals();

    if (config?.initialARIA) {
      this.setARIA(config.initialARIA);
    }

    host.addController(this);
  }

  public setARIA(state: Partial<Record<keyof ARIAMixin, string | null>>): void {
    Object.assign(this._internals, state);
  }

  public setState(state: string, value: boolean): void {
    value
      ? this._internals.states.add(state)
      : this._internals.states.delete(state);
  }

  /** @internal */
  public hostConnected(): void {}
}

export function addInternalsController(
  host: ReactiveControllerHost & LitElement,
  config?: ElementInternalsConfig
): ElementInternalsController {
  return new ElementInternalsController(host, config);
}

export type { ElementInternalsController };
