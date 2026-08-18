import type { Theme } from '#theming/types.js';

// Exported internal types

/** Icons or references organized by collection, then by name. */
export type IconsCollection<V> = Map<string, Map<string, V>>;

/** Notified when the icon registry changes. Subscribers re-resolve their own state. */
export type IconCallback = () => void;
export type IconThemeKey = Theme | 'default';

export type SvgIcon = {
  svg: string;
  title?: string;
};

export type IconReferencePair = {
  alias: IconMeta;
  target: IconMeta;
  overwrite: boolean;
};

export enum ActionType {
  SyncState = 0,
  RegisterIcon = 1,
  UpdateIconReference = 2,
}

/** @hidden */
export interface BroadcastIconsChangeMessage {
  actionType: ActionType;
  collections?: IconsCollection<SvgIcon>;
  references?: IconsCollection<IconMeta>;
  origin?: string;
}

// Exported public types

/** Identifies a registered icon by its name and the collection it belongs to. */
export interface IconMeta {
  /** The name identifier of the icon in the collection. */
  name: string;
  /** The name of the collection the icon is registered in. */
  collection: string;
  /** @internal Internal use only. */
  external?: boolean;
}

/**
 * Options for registering an SVG icon.
 *
 * @remarks
 * Can be passed as the third argument to `registerIcon` or `registerIconFromText`
 * in place of a plain collection string, giving you control over both the
 * target collection and SVG metadata stripping in a single, named-parameter call.
 *
 * @example:
 * ```typescript
 * registerIconFromText('home', svg, { collection: 'my-collection', stripMeta: true });
 * ```
 */
export interface RegisterIconOptions {
  /**
   * The collection to register the icon in.
   * @default 'default'
   */
  collection?: string;

  /**
   * Whether to strip SVG meta elements (`<title>` and `<desc>`) from the icon
   * before storing it.
   *
   * @remarks
   * SVG `<title>` elements cause the browser to display a native tooltip when
   * the user hovers over the icon — an undesirable side-effect when using icon
   * packs such as `@igniteui/material-icons-extended` that embed accessible
   * metadata inside every icon.
   *
   * When `stripMeta` is `true`:
   * - The `<title>` and `<desc>` child elements are removed from the stored SVG.
   * - Any `aria-labelledby` / `aria-describedby` references on the root
   *   `<svg>` element that pointed to the stripped elements' IDs are cleaned up
   *   so the resulting markup contains no dangling ARIA references.
   * - The **title text** is still captured and stored as `SvgIcon.title`, which
   *   the icon component continues to expose as its host `aria-label`.
   *   Accessibility is therefore preserved at the component level while the
   *   browser tooltip is suppressed at the SVG level.
   *
   * @default false
   */
  stripMeta?: boolean;
}
