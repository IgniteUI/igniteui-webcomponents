import { isServer } from 'lit';

/**
 * Converts a CSS custom property name to a camelCase JavaScript key.
 * Removes leading '--' and converts kebab-case to camelCase.
 * @param key - The CSS variable name (e.g., '--my-color')
 * @returns The JavaScript key (e.g., 'myColor')
 */
function cssKeyToJsKey(key: string): string {
  // Regex: matches '--' at start OR '-x' pattern to convert to camelCase
  return key.replace(/^--|-./g, (match) => {
    return match.startsWith('--') ? '' : match.charAt(1).toUpperCase();
  });
}

function getCssVariables(): Record<string, string> {
  const rootStyles = getComputedStyle(document.documentElement);
  const result: Record<string, string> = {};

  for (const key of Array.from(rootStyles)) {
    if (key.startsWith('--')) {
      result[cssKeyToJsKey(key)] = rootStyles.getPropertyValue(key).trim();
    }
  }

  return result;
}

/**
 * Retrieves all CSS custom properties from the document root element.
 * Property names are converted from kebab-case to camelCase.
 *
 * @returns An object mapping camelCase property names to their values.
 * Returns an empty object in SSR environments.
 * @example
 * // CSS: --my-primary-color: #ff0000;
 * // Returns: { myPrimaryColor: '#ff0000' }
 */
export function getAllCssVariables(): Record<string, string> {
  return isServer ? {} : getCssVariables();
}
