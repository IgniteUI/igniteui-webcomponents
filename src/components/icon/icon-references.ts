/** READ BEFORE YOU MODIFY THIS FILE!
 *
 * An icon alias has semantic meaning. Pick the alias that matches the intent of the
 * component, not only the glyph. For example, a component that toggles between expanded
 * and collapsed states uses `expand`/`collapse`, but a design that needs `chevron_right`
 * and `expand_more` uses `tree_expand`/`tree_collapse`. This matters when a user rewires
 * the `expand`/`collapse` icons.
 *
 * Change an existing reference with caution: many components share icons with the same
 * meaning (for example `prev` and `next`), and the change must suit all of them.
 *
 * The Ignite UI component frameworks share the alias names and their targets. Reflect a
 * changed alias name in the other frameworks too.
 *
 * For the icons each component uses, read the
 * [docs](https://infragistics.com/products/ignite-ui-angular/Angular/components/icon-service#internal-usage).
 */
import type { IconMeta, IconThemeKey } from './registry/types.js';

/** The collection every built-in alias target lives in. */
const INTERNAL = 'internal';

/**
 * Maps an alias in the `default` collection to the name of its target icon in
 * the `internal` collection, per theme. The `default` entry is the fallback for
 * themes without an explicit target.
 */
const ICON_ALIASES: Record<string, Partial<Record<IconThemeKey, string>>> = {
  expand: { default: 'keyboard_arrow_down', indigo: 'indigo_chevron_down' },
  attach_file: { default: 'attach_file', indigo: 'indigo_attach_file' },
  attach_document: { default: 'document_filled' },
  attach_image: { default: 'document_image' },
  auto_suggest: { default: 'auto_suggest' },
  send_message: { default: 'send' },
  image_thumbnail: { default: 'image' },
  table_thumbnail: { default: 'table' },
  layout_thumbnail: { default: 'layout' },
  code_thumbnail: { default: 'code_circle' },
  document_thumbnail: { default: 'document_empty' },
  file_generic: { default: 'file_generic' },
  file_css: { default: 'file_css' },
  file_csv: { default: 'file_csv' },
  file_doc: { default: 'file_doc' },
  file_htm: { default: 'file_htm' },
  file_html: { default: 'file_html' },
  file_js: { default: 'file_js' },
  file_json: { default: 'file_json' },
  file_pdf: { default: 'file_pdf' },
  file_rtf: { default: 'file_rtf' },
  file_svg: { default: 'file_svg' },
  file_txt: { default: 'file_txt' },
  file_xls: { default: 'file_xls' },
  file_xml: { default: 'file_xml' },
  file_zip: { default: 'file_zip' },
  file_link: { default: 'file_link' },
  more_horiz: { default: 'more_horiz' },
  open_in_new: { default: 'open_in_new' },
  thumb_up_active: { default: 'thumb_up_filled' },
  thumb_up_inactive: { default: 'thumb_up_empty' },
  thumb_down_active: { default: 'thumb_down_filled' },
  thumb_down_inactive: { default: 'thumb_down_empty' },
  regenerate: { default: 'reload' },
  copy_content: { default: 'copy' },
  collapse: { default: 'keyboard_arrow_up', indigo: 'indigo_chevron_up' },
  eye_dropper: { default: 'colorize' },
  arrow_prev: {
    default: 'navigate_before',
    fluent: 'arrow_upward',
    indigo: 'indigo_chevron_left',
  },
  arrow_next: {
    default: 'navigate_next',
    fluent: 'arrow_downward',
    indigo: 'indigo_chevron_right',
  },
  selected: { default: 'chip_select' },
  remove: { default: 'chip_cancel', indigo: 'indigo_cancel' },
  input_clear: { default: 'clear', indigo: 'indigo_clear' },
  input_expand: {
    default: 'keyboard_arrow_down',
    indigo: 'indigo_chevron_down',
  },
  input_collapse: { default: 'keyboard_arrow_up', indigo: 'indigo_chevron_up' },
  chevron_right: {
    default: 'keyboard_arrow_right',
    indigo: 'indigo_chevron_right',
  },
  chevron_left: { default: 'navigate_before', indigo: 'indigo_chevron_left' },
  case_sensitive: { default: 'case_sensitive' },
  today: { default: 'calendar_today', indigo: 'indigo_calendar_today' },
  clock: { default: 'access_time', indigo: 'indigo_access_time' },
  star_filled: { default: 'star' },
  star_outlined: { default: 'star_border' },
  prev: { default: 'navigate_before', indigo: 'indigo_chevron_left' },
  next: { default: 'navigate_next', indigo: 'indigo_chevron_right' },
  tree_expand: {
    default: 'keyboard_arrow_right',
    indigo: 'indigo_chevron_right',
  },
  tree_collapse: {
    default: 'keyboard_arrow_down',
    indigo: 'indigo_chevron_down',
  },
  carousel_prev: {
    default: 'keyboard_arrow_left',
    indigo: 'indigo_chevron_left',
  },
  carousel_next: {
    default: 'keyboard_arrow_right',
    indigo: 'indigo_chevron_right',
  },
  error: { default: 'error', indigo: 'indigo_error' },
  fullscreen: { default: 'fullscreen', indigo: 'indigo_fullscreen' },
  fullscreen_exit: {
    default: 'fullscreen_exit',
    indigo: 'indigo_fullscreen_exit',
  },
  expand_content: {
    default: 'expand_content',
    indigo: 'indigo_expand_content',
  },
  collapse_content: {
    default: 'collapse_content',
    indigo: 'indigo_collapse_content',
  },
  resize: { default: 'resize' },
};

/** Resolved alias name -> theme -> target icon. */
export const ICON_REFERENCES: ReadonlyMap<
  string,
  ReadonlyMap<IconThemeKey, IconMeta>
> = new Map(
  Object.entries(ICON_ALIASES).map(([alias, targets]) => [
    alias,
    new Map(
      (Object.entries(targets) as [IconThemeKey, string][]).map(
        ([theme, name]) => [theme, { name, collection: INTERNAL }]
      )
    ),
  ])
);
