import { isServer } from 'lit';

import { isDefined } from '../components/common/util.js';

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return !!rule && 'style' in rule;
}

function cssKeyToJsKey(key: string): string {
  return key.replace('--', '').replace(/-./g, (x) => x.toUpperCase()[1]);
}

function getAllCssVariableNames(): Set<string> {
  const cssVars = new Set<string>();

  /* c8 ignore next 3 */
  if (isServer || !isDefined(globalThis.document)) {
    return cssVars;
  }

  // Filter out any external stylesheets which throw CORS errors
  const styleSheets = Array.from(globalThis.document.styleSheets).filter(
    (sheet) => {
      try {
        return sheet.cssRules;
      } catch {
        return false;
      }
    }
  );

  for (const sheet of styleSheets) {
    const rules = Array.from(sheet.cssRules).filter(isStyleRule);

    for (const rule of rules) {
      Array.from(rule.style).forEach((style) => {
        if (style.startsWith('--')) {
          cssVars.add(style);
        }
      });
    }
  }

  return cssVars;
}

function getElementCssVariables(
  allCssVars: Set<string>,
  element: HTMLElement,
  pseudo?: string
): Record<string, string> {
  const cssVars: Record<string, string> = {};

  /* c8 ignore next 3 */
  if (!isDefined(globalThis.getComputedStyle)) {
    return cssVars;
  }

  const styles = globalThis.getComputedStyle(element, pseudo);

  for (const key of allCssVars) {
    const value = styles.getPropertyValue(key);

    if (value) {
      cssVars[cssKeyToJsKey(key)] = value.trim();
    }
  }

  return cssVars;
}

export function getAllCssVariables(): Record<string, string> {
  /* c8 ignore next 2 */
  return isServer || !isDefined(globalThis.document)
    ? {}
    : getElementCssVariables(
        getAllCssVariableNames(),
        globalThis.document.documentElement
      );
}
