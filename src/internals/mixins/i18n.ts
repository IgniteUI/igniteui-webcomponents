import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  addI18nController,
  type I18nController,
  type I18nControllerConfig,
} from '../i18n/i18n-controller.js';
import type { AbstractConstructor, Constructor } from './constructor.js';

export declare class I18nInterface<
  T extends object,
  TGet extends T = Required<T>,
> {
  protected readonly _i18nController: I18nController<T>;
  public set locale(value: string);
  public get locale(): string;
  public set resourceStrings(value: T);
  public get resourceStrings(): TGet;
}

/**
 * Mixes in the localization surface of a component — the `locale` and
 * `resourceStrings` reactive properties forwarding to an i18n controller
 * created with the passed configuration.
 *
 * The controller is exposed as the protected `_i18nController` for hosts
 * that need direct access.
 *
 * `TGet` is the type of the resolved strings the getter returns. It defaults
 * to `Required<T>` — the controller merges the full `defaultEN` set under any
 * custom overrides, so every key always resolves even though the core resource
 * interfaces declare them optional. Components transitioning between the
 * deprecated component-specific resource shapes and the core ones override it:
 * they accept either shape (`T` is the union) while the resolved strings
 * expose both key sets (`TGet` is the intersection).
 */
export function I18nMixin<
  T extends object,
  B extends AbstractConstructor<LitElement>,
  TGet extends T = Required<T>,
>(
  config: I18nControllerConfig<T>,
  superClass: B
): AbstractConstructor<I18nInterface<T, TGet>> & B;
export function I18nMixin<
  T extends object,
  B extends Constructor<LitElement>,
  TGet extends T = Required<T>,
>(config: I18nControllerConfig<T>, superClass: B) {
  class I18nElement extends superClass {
    protected readonly _i18nController = addI18nController<T>(this, config);

    /**
     * Gets/Sets the locale used for getting language, affecting resource strings.
     * @attr locale
     */
    @property()
    public set locale(value: string) {
      this._i18nController.locale = value;
    }

    public get locale(): string {
      return this._i18nController.locale;
    }

    /**
     * The resource strings for localization.
     */
    @property({ attribute: false })
    public set resourceStrings(value: T) {
      this._i18nController.resourceStrings = value;
    }

    public get resourceStrings(): TGet {
      return this._i18nController.resourceStrings as TGet;
    }
  }
  return I18nElement as unknown as Constructor<I18nInterface<T, TGet>> & B;
}
