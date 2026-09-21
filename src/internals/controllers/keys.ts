/**
 * The key names, and the case-insensitive key check.
 *
 * @remarks
 * The module has no imports, so a consumer of a key name depends on nothing
 * else. The modifier table and the combination helpers live with their only
 * consumer, the key-bindings controller.
 */

/* Common keys */
export const arrowLeft = 'ArrowLeft' as const;
export const arrowRight = 'ArrowRight' as const;
export const arrowUp = 'ArrowUp' as const;
export const arrowDown = 'ArrowDown' as const;
export const enterKey = 'Enter' as const;
export const spaceBar = ' ' as const;
export const escapeKey = 'Escape' as const;
export const homeKey = 'Home' as const;
export const endKey = 'End' as const;
export const pageUpKey = 'PageUp' as const;
export const pageDownKey = 'PageDown' as const;
export const tabKey = 'Tab' as const;

/* Modifiers */
export const altKey = 'Alt' as const;
export const ctrlKey = 'Control' as const;
export const metaKey = 'Meta' as const;
export const shiftKey = 'Shift' as const;

/**
 * Whether the key of the event matches `key`, without regard to case.
 *
 * @remarks
 * Prefer it over a direct comparison with `event.key`. A caller can hold a
 * normalized lowercase name, while an event carries the canonical case.
 */
export function isKey(event: KeyboardEvent, key: string): boolean {
  return event.key.toLowerCase() === key.toLowerCase();
}
