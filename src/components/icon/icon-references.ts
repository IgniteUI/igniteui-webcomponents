/** READ BEFORE YOU MODIFY THIS FILE!
 *
 * Before you add/modify an icon reference, please think about the semantics of the icon you are adding/modifying.
 *
 * Icon aliases have sematic meaning depending on the context in which they are used.
 * For instance, if your component handles toggling between expanded and collapsed states,
 * you may want to use the already existing `expand` and `collapse` aliases that point to
 * the `expand_more` and `expand_less` icons in the material font set.
 *
 * It may so happen, however, that the design of your component requires you to use the `chevron_right` for the
 * expand icon and the `expand_more` for the collapse icon. In this case the `tree_expand` and `tree_collapse` aliases
 * would be appropriate.
 * This distinction is important when choosing which icon to use for your component as it will have an impact
 * when a user decides to rewire the `expand`/`collapse` icons to some other icons.
 *
 * Likewise, modifying existing references should be handled with caution as many component in the framework already
 * share icons that have equivalent semantic meaning. For example, the `Paginator`, `Grid Filtering Row`,
 * and `Tabs` components in Ignite UI for Angular all use the `prev` and `next` icons for navigating between pages
 * or lists of items. Changing the underlying target for those icons should be done in a way that suits all components.
 *
 * Keep in mind that icon aliases and their underlying names are shared between Ignite UI component frameworks
 * and changing an alias name here should be reflected in the other frameworks as well.
 *
 * To get acquainted with which component uses what icon, please make sure to read the
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
  copy_success: { default: 'chip_select', indigo: 'indigo_check' },
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
