import { isServer } from 'lit';

function isStyleRule(rule: CSSRule): rule is CSSStyleRule {
  return rule != null && 'style' in rule;
}

function cssKeyToJsKey(key: string): string {
  return key.replace(/^--|-./g, (match) => {
    return match.startsWith('--') ? '' : match.charAt(1).toUpperCase();
  });
}

function getAllCssVariableNames(): Set<string> {
  const cssVars = new Set<string>();
  const styleSheets = Array.from(document.styleSheets);

  for (const sheet of styleSheets) {
    let rules: CSSRuleList | undefined;

    // Potential CORS or access errors
    try {
      rules = sheet.cssRules;
    } catch {
      continue;
    }

    if (!rules) {
      continue;
    }

    for (const rule of Array.from(rules)) {
      if (isStyleRule(rule)) {
        const length = rule.style.length;

        for (let i = 0; i < length; i++) {
          const style = rule.style[i];

          if (style.startsWith('--')) {
            cssVars.add(style);
          }
        }
      }
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
  const styles = getComputedStyle(element, pseudo);

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
  return isServer
    ? {}
    : getElementCssVariables(
        getAllCssVariableNames(),
        document.documentElement
      );
}
