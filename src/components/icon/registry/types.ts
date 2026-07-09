import type { Theme } from '../../../theming/types.js';
import type { DefaultMap } from './default-map.js';

// Exported internal types

export type IconsCollection<T> = DefaultMap<string, Map<string, T>>;

export type IconCallback = (name: string, collection: string) => void;
export type IconThemeKey = Theme | 'default';

export type SvgIcon = {
  svg: string;
  title?: string;
};

export type IconReference = {
  alias: IconMeta;
  target: Map<IconThemeKey, IconMeta>;
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

/** @ignore */
export interface BroadcastIconsChangeMessage {
  actionType: ActionType;
  collections?: Map<string, Map<string, SvgIcon>>;
  references?: Map<string, Map<string, IconMeta>>;
  origin?: string;
}

// Exported public types

export interface IconMeta {
  name: string;
  collection: string;
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
   *   the `<igc-icon>` component continues to expose as its host `aria-label`.
   *   Accessibility is therefore preserved at the component level while the
   *   browser tooltip is suppressed at the SVG level.
   *
   * @default false
   */
  stripMeta?: boolean;
}
