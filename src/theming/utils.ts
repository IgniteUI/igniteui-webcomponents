/*eslint no-empty: ['error', {allowEmptyCatch: true}]*/
const CssKeyToJsKey = (key: string) =>
  key.replace('--', '').replace(/-./g, (x) => x.toUpperCase()[1]);

const getAllCSSVariableNames = (
  styleSheets: StyleSheetList = document.styleSheets
) => {
  const cssVars: string[] = [];

  Array.from(styleSheets).forEach((styleSheet) => {
    try {
      Array.from(styleSheet.cssRules).forEach((rule: any) => {
        if (!rule || !rule['style']) {
          return;
        }

        Array.from(rule['style']).forEach((style: any) => {
          if (style.startsWith('--') && cssVars.indexOf(style) == -1) {
            cssVars.push(style);
          }
        });
      });
    } catch (e) {}
  });

  return cssVars;
};

const getElementCSSVariables = (
  allCSSVars: Array<string>,
  element: HTMLElement = document.body,
  pseudo: string | undefined = ''
) => {
  const elStyles = globalThis?.getComputedStyle(element, pseudo);
  const cssVars = {};

  allCSSVars.forEach((key) => {
    const value = elStyles.getPropertyValue(key);

    if (value) {
      (cssVars as any)[CssKeyToJsKey(key)] = value.trim();
    }
  });

  return cssVars;
};

export const getAllCSSVariables = (): Record<string, string> => {
  const cssVars = getAllCSSVariableNames();
  return getElementCSSVariables(cssVars, document.documentElement);
};
