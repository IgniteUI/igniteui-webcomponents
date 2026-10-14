import { all } from '@igniteui/material-icons-extended';
import { registerIcon, registerIconFromText } from 'igniteui-webcomponents';

const MATERIAL_ICONS = 'https://unpkg.com/material-design-icons@3.0.1';

/**
 * The Material icons of the stories, by name. The icon registry is global, so
 * each name has one glyph here. No name is a built-in alias (such as `error`)
 * or a name of `@igniteui/material-icons-extended` (such as `check`).
 */
const materialIcons = {
  adjust: 'image/svg/production/ic_adjust_24px.svg',
  'align-center': 'editor/svg/production/ic_format_align_center_24px.svg',
  'align-justify': 'editor/svg/production/ic_format_align_justify_24px.svg',
  'align-left': 'editor/svg/production/ic_format_align_left_24px.svg',
  'align-right': 'editor/svg/production/ic_format_align_right_24px.svg',
  'alert-error': 'alert/svg/production/ic_error_24px.svg',
  archive: 'content/svg/production/ic_archive_24px.svg',
  'arrow-back': 'navigation/svg/production/ic_arrow_back_24px.svg',
  'arrow-down': 'hardware/svg/production/ic_keyboard_arrow_down_24px.svg',
  'arrow-forward': 'navigation/svg/production/ic_arrow_forward_24px.svg',
  'arrow-up': 'hardware/svg/production/ic_keyboard_arrow_up_24px.svg',
  assessment: 'action/svg/production/ic_assessment_24px.svg',
  'assignment-return': 'action/svg/production/ic_assignment_return_24px.svg',
  bold: 'editor/svg/production/ic_format_bold_24px.svg',
  bookmark: 'action/svg/production/ic_bookmark_24px.svg',
  'bookmark-border': 'action/svg/production/ic_bookmark_border_24px.svg',
  call: 'communication/svg/production/ic_call_24px.svg',
  'call-made': 'communication/svg/production/ic_call_made_24px.svg',
  'call-missed': 'communication/svg/production/ic_call_missed_24px.svg',
  'call-received': 'communication/svg/production/ic_call_received_24px.svg',
  chat: 'communication/svg/production/ic_chat_24px.svg',
  'check-circle': 'action/svg/production/ic_check_circle_24px.svg',
  'chevron-left': 'navigation/svg/production/ic_chevron_left_24px.svg',
  'chevron-right': 'navigation/svg/production/ic_chevron_right_24px.svg',
  close: 'navigation/svg/production/ic_close_24px.svg',
  cloud: 'file/svg/production/ic_cloud_24px.svg',
  'code-brackets': 'action/svg/production/ic_code_24px.svg',
  comment: 'communication/svg/production/ic_comment_24px.svg',
  copy: 'content/svg/production/ic_content_copy_24px.svg',
  'crop-square': 'image/svg/production/ic_crop_square_24px.svg',
  cut: 'content/svg/production/ic_content_cut_24px.svg',
  dashboard: 'action/svg/production/ic_dashboard_24px.svg',
  delete: 'action/svg/production/ic_delete_24px.svg',
  description: 'action/svg/production/ic_description_24px.svg',
  done: 'action/svg/production/ic_done_24px.svg',
  'done-all': 'action/svg/production/ic_done_all_24px.svg',
  download: 'file/svg/production/ic_file_download_24px.svg',
  drafts: 'content/svg/production/ic_drafts_24px.svg',
  edit: 'image/svg/production/ic_edit_24px.svg',
  email: 'communication/svg/production/ic_email_24px.svg',
  event: 'action/svg/production/ic_event_24px.svg',
  'exit-to-app': 'action/svg/production/ic_exit_to_app_24px.svg',
  'expand-more': 'navigation/svg/production/ic_expand_more_24px.svg',
  explore: 'action/svg/production/ic_explore_24px.svg',
  favorite: 'action/svg/production/ic_favorite_24px.svg',
  'favorite-border': 'action/svg/production/ic_favorite_border_24px.svg',
  'flight-land': 'action/svg/production/ic_flight_land_24px.svg',
  'flight-takeoff': 'action/svg/production/ic_flight_takeoff_24px.svg',
  folder: 'file/svg/production/ic_folder_24px.svg',
  'folder-open': 'file/svg/production/ic_folder_open_24px.svg',
  forward: 'content/svg/production/ic_forward_24px.svg',
  'forward-30': 'av/svg/production/ic_forward_30_24px.svg',
  group: 'social/svg/production/ic_group_24px.svg',
  'group-add': 'social/svg/production/ic_group_add_24px.svg',
  'headset-mic': 'hardware/svg/production/ic_headset_mic_24px.svg',
  help: 'action/svg/production/ic_help_24px.svg',
  home: 'action/svg/production/ic_home_24px.svg',
  image: 'image/svg/production/ic_image_24px.svg',
  inbox: 'content/svg/production/ic_inbox_24px.svg',
  info: 'action/svg/production/ic_info_24px.svg',
  italic: 'editor/svg/production/ic_format_italic_24px.svg',
  keyboard: 'hardware/svg/production/ic_keyboard_24px.svg',
  label: 'action/svg/production/ic_label_24px.svg',
  language: 'action/svg/production/ic_language_24px.svg',
  link: 'editor/svg/production/ic_insert_link_24px.svg',
  'list-bulleted': 'editor/svg/production/ic_format_list_bulleted_24px.svg',
  'list-numbered': 'editor/svg/production/ic_format_list_numbered_24px.svg',
  'local-shipping': 'maps/svg/production/ic_local_shipping_24px.svg',
  location: 'maps/svg/production/ic_place_24px.svg',
  lock: 'action/svg/production/ic_lock_24px.svg',
  mail: 'content/svg/production/ic_mail_24px.svg',
  menu: 'navigation/svg/production/ic_menu_24px.svg',
  minus: 'content/svg/production/ic_remove_24px.svg',
  'more-horiz': 'navigation/svg/production/ic_more_horiz_24px.svg',
  'more-vert': 'navigation/svg/production/ic_more_vert_24px.svg',
  movie: 'av/svg/production/ic_movie_24px.svg',
  'music-note': 'image/svg/production/ic_music_note_24px.svg',
  'near-me': 'maps/svg/production/ic_near_me_24px.svg',
  notifications: 'social/svg/production/ic_notifications_24px.svg',
  'open-in-new': 'action/svg/production/ic_open_in_new_24px.svg',
  'pan-tool': 'action/svg/production/ic_pan_tool_24px.svg',
  paste: 'content/svg/production/ic_content_paste_24px.svg',
  pause: 'av/svg/production/ic_pause_24px.svg',
  people: 'social/svg/production/ic_people_24px.svg',
  person: 'social/svg/production/ic_person_24px.svg',
  photo: 'image/svg/production/ic_photo_24px.svg',
  'play-arrow': 'av/svg/production/ic_play_arrow_24px.svg',
  plus: 'content/svg/production/ic_add_24px.svg',
  redo: 'content/svg/production/ic_redo_24px.svg',
  'replay-10': 'av/svg/production/ic_replay_10_24px.svg',
  reply: 'content/svg/production/ic_reply_24px.svg',
  'reply-all': 'content/svg/production/ic_reply_all_24px.svg',
  search: 'action/svg/production/ic_search_24px.svg',
  send: 'content/svg/production/ic_send_24px.svg',
  settings: 'action/svg/production/ic_settings_24px.svg',
  share: 'social/svg/production/ic_share_24px.svg',
  'shopping-cart': 'action/svg/production/ic_shopping_cart_24px.svg',
  'skip-next': 'av/svg/production/ic_skip_next_24px.svg',
  'skip-previous': 'av/svg/production/ic_skip_previous_24px.svg',
  star: 'toggle/svg/production/ic_star_24px.svg',
  'star-border': 'toggle/svg/production/ic_star_border_24px.svg',
  'status-failed': 'alert/svg/production/ic_error_24px.svg',
  'status-queued': 'action/svg/production/ic_schedule_24px.svg',
  'status-running': 'action/svg/production/ic_autorenew_24px.svg',
  'status-succeeded': 'action/svg/production/ic_check_circle_24px.svg',
  'status-warning': 'alert/svg/production/ic_warning_24px.svg',
  sunny: 'image/svg/production/ic_wb_sunny_24px.svg',
  table: 'editor/svg/production/ic_border_all_24px.svg',
  'text-fields': 'editor/svg/production/ic_text_fields_24px.svg',
  'trending-down': 'action/svg/production/ic_trending_down_24px.svg',
  'trending-up': 'action/svg/production/ic_trending_up_24px.svg',
  underline: 'editor/svg/production/ic_format_underlined_24px.svg',
  undo: 'content/svg/production/ic_undo_24px.svg',
  'unfold-more': 'navigation/svg/production/ic_unfold_more_24px.svg',
  update: 'action/svg/production/ic_update_24px.svg',
  videocam: 'av/svg/production/ic_videocam_24px.svg',
  visibility: 'action/svg/production/ic_visibility_24px.svg',
  'visibility-off': 'action/svg/production/ic_visibility_off_24px.svg',
  'volume-off': 'av/svg/production/ic_volume_off_24px.svg',
  'volume-up': 'av/svg/production/ic_volume_up_24px.svg',
  warning: 'alert/svg/production/ic_warning_24px.svg',
  work: 'action/svg/production/ic_work_24px.svg',
} as const;

export type MaterialIconName = keyof typeof materialIcons;

const requested = new Set<MaterialIconName>();

/**
 * Registers Material icons in the default collection. Each icon loads once,
 * also when several story files need it.
 */
export function registerMaterialIcons(...names: MaterialIconName[]): void {
  for (const name of names) {
    if (!requested.has(name)) {
      requested.add(name);
      registerIcon(name, `${MATERIAL_ICONS}/${materialIcons[name]}`).catch(
        () => {}
      );
    }
  }
}

const biking =
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="biking" class="svg-inline--fa fa-biking fa-w-20" role="img" viewBox="0 0 640 512"><path fill="currentColor" d="M400 96a48 48 0 1 0-48-48 48 48 0 0 0 48 48zm-4 121a31.9 31.9 0 0 0 20 7h64a32 32 0 0 0 0-64h-52.78L356 103a31.94 31.94 0 0 0-40.81.68l-112 96a32 32 0 0 0 3.08 50.92L288 305.12V416a32 32 0 0 0 64 0V288a32 32 0 0 0-14.25-26.62l-41.36-27.57 58.25-49.92zm116 39a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64zM128 256a128 128 0 1 0 128 128 128 128 0 0 0-128-128zm0 192a64 64 0 1 1 64-64 64 64 0 0 1-64 64z"/></svg>';

let extendedIcons: string[] | undefined;

/**
 * Registers the icons of `@igniteui/material-icons-extended` and a `biking`
 * icon once, and returns their names in order, for an icon name control.
 */
export function registerExtendedIcons(): string[] {
  if (!extendedIcons) {
    for (const { name, value } of all) {
      registerIconFromText(name, value);
    }
    registerIconFromText('biking', biking);
    extendedIcons = [...all.map(({ name }) => name), 'biking'].sort();
  }

  return extendedIcons;
}
