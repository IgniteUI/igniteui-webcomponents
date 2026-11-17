import type { CopyToClipboardFormat } from '../types.js';

/**
 * Formats the rendered text of the content for the clipboard.
 * - `plain`: Each run of whitespace other than line breaks becomes one space,
 *   the spaces around a line break are removed, each run of line breaks
 *   becomes one, and the result is trimmed.
 * - `preserve`: Only the leading and trailing line breaks are removed.
 */
export function formatCopiedText(
  text: string,
  format: CopyToClipboardFormat
): string {
  return format === 'preserve'
    ? text.replaceAll(/^\n+|\n+$/g, '')
    : text
        .replaceAll(/[^\S\n]+/g, ' ')
        .replaceAll(/[ \n]*\n[ \n]*/g, '\n')
        .trim();
}
