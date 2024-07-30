import type { Theme } from '../../../theming/types.js';
import type { DefaultMap } from './default-map.js';

// Exported internal types

export type Collection<T, U> = DefaultMap<T, U>;

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

export interface BroadcastIconsChangeMessage {
  actionType: ActionType;
  collections?: Map<string, Map<string, SvgIcon>>;
  references?: Map<string, Map<string, IconMeta>>;
}

// Exported public types

export interface IconMeta {
  name: string;
  collection: string;
  external?: boolean;
}
