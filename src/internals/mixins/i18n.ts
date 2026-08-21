import type { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import {
  addI18nController,
  type I18nController,
  type I18nControllerConfig,
} from '../i18n/i18n-controller.js';
import type { AbstractConstructor } from './constructor.js';

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
 * Mixes in the localization surface of a component - the `locale` and
 * `resourceStrings` reactive properties forwarding to an i18n controller
 * created with the passed configuration.
 *
 * The controller is exposed as the protected `_i18nController` for hosts
 * that need direct access.
 *
 * `TGet` is the type of the resolved strings. It defaults to `Required<T>`,
 * because the controller merges the full `defaultEN` set under any overrides,
 * so every key resolves even though the resource interfaces declare them
 * optional. Components that still accept a deprecated component-specific
 * resource shape override it: `T` is the union of the two shapes accepted,
 * `TGet` their intersection.
 *
 * The base class must be the first argument - the manifest analyzer resolves
 * the superclass of an `extends Mixin(...)` clause from the first argument,
 * and a leading config object would sever the inheritance chain in the
 * manifest (dropping every inherited public member from the docs).
 */
export function I18nMixin<
  T extends object,
  B extends AbstractConstructor<LitElement>,
  TGet extends T = Required<T>,
>(superClass: B, config: I18nControllerConfig<T>) {
  abstract class I18nElement extends superClass {
    protected readonly _i18nController = addI18nController<T>(this, config);

    /**
     * The locale used to resolve the component's resource strings.
     * Falls back to the global locale when not set.
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
  return I18nElement as unknown as AbstractConstructor<I18nInterface<T, TGet>> &
    B;
}
