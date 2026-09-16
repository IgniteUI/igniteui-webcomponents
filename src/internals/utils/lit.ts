import { html, nothing, type TemplateResult } from 'lit';

/**
 * Similar to Lit's `ifDefined` directive except one can check `assertion`
 * and bind a different `value` through this wrapper.
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
