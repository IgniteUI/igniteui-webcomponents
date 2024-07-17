import type { IconMeta, IconReferences, Themes } from './icon.registry.js';

type Icon = {
  [THEME in Themes]?: IconMeta;
};

const iconRefs = (icons: Icon) => {
  return new Map(
    Object.entries(icons).map((icon) => {
      return icon as [theme: Themes, IconMeta];
    })
  );
};

export const iconReferences: IconReferences = new Set([
  {
    alias: {
      name: 'expand',
      collection: 'default',
    },
    target: iconRefs({
      default: {
        name: 'keyboard_arrow_down',
        collection: 'internal',
      },
      indigo: {
        name: 'arrow_downward',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'collapse',
      collection: 'default',
    },
    target: iconRefs({
      default: {
        name: 'keyboard_arrow_up',
        collection: 'internal',
      },
      indigo: {
        name: 'arrow_upward',
        collection: 'internal',
      },
    }),
  },
]);
