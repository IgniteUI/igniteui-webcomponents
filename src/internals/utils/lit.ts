import { html, nothing, type TemplateResult } from 'lit';

/**
 * Returns `value` when `assertion` is truthy, and `nothing` otherwise.
 *
 * @remarks
 * Like the `ifDefined` directive of Lit, but the condition and the bound
 * value are separate.
 */
export function bindIf<T>(assertion: unknown, value: T): NonNullable<T> {
  return assertion
    ? (value ?? (nothing as NonNullable<T>))
    : (nothing as NonNullable<T>);
}

const trimmedCache = new WeakMap<TemplateStringsArray, TemplateStringsArray>();

/** @internal */
export function trimmedHtml(
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult {
  if (!trimmedCache.has(strings)) {
    const trimmedStrings = strings.map((s) => s.trim().replaceAll('\n', ''));
    trimmedCache.set(
      strings,
      Object.assign([...trimmedStrings], { raw: [...strings.raw] })
    );
  }

  return html(trimmedCache.get(strings)!, ...values);
}
