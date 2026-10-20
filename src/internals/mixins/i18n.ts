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

/** The configuration of `I18nMixin`. */
export type I18nMixinConfig<
  T extends object,
  TGet extends T = Required<T>,
> = I18nControllerConfig<T> & {
  /**
   * Typing only, never set: the type `resourceStrings` returns, e.g. the
   * intersection of a deprecated and a core shape.
   */
  readonly resolved?: TGet;
};

/**
 * Adds the `locale` and `resourceStrings` properties, both backed by an
 * `I18nController` that `config` creates.
 *
 * @remarks
 * `TGet` defaults to `Required<T>`, because the controller merges the full
 * `defaultEN` set under any overrides, so every key resolves.
 *
 * The base class must be the first argument. The manifest analyzer reads the
 * superclass of `extends Mixin(...)` from that argument; a leading config
 * object drops every inherited public member from the docs.
 */
export function I18nMixin<
  T extends object,
  B extends AbstractConstructor<LitElement>,
  TGet extends T = Required<T>,
>(superClass: B, config: I18nMixinConfig<T, TGet>) {
  abstract class I18nElement extends superClass {
    protected readonly _i18nController = addI18nController<T>(this, config);

    /**
     * The locale of the component. Without it, the component takes the locale
     * of the nearest ancestor component that sets one, and then the global
     * locale.
     *
     * @attr locale
     */
    @property()
    public set locale(value: string) {
      this._i18nController.locale = value;
    }

    public get locale(): string {
      return this._i18nController.locale;
    }

    /** The resource strings for localization. */
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
