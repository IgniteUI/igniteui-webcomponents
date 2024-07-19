import type {
  IconMeta,
  IconReference,
  IconThemeKey,
} from './registry/types.js';

type Icon = { [key in IconThemeKey]?: IconMeta };

const makeIconRefs = (icons: Icon) => {
  return new Map(
    Object.entries(icons).map((icon) => {
      return icon as [theme: IconThemeKey, IconMeta];
    })
  );
};

export const iconReferences: IconReference[] = [
  {
    alias: {
      name: 'expand',
      collection: 'default',
    },
    target: makeIconRefs({
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
    target: makeIconRefs({
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
  {
    alias: {
      name: 'arrow_prev',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'navigate_before',
        collection: 'internal',
      },
      fluent: {
        name: 'arrow_upward',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'arrow_next',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'navigate_next',
        collection: 'internal',
      },
      fluent: {
        name: 'arrow_downward',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'selected',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'chip_select',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'remove',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'chip_cancel',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'clear',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'clear',
        collection: 'internal',
      },
      material: {
        name: 'chip_cancel',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'expand',
      collection: 'combo',
    },
    target: makeIconRefs({
      default: {
        name: 'arrow_drop_down',
        collection: 'internal',
      },
      material: {
        name: 'keyboard_arrow_down',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'collapse',
      collection: 'combo',
    },
    target: makeIconRefs({
      default: {
        name: 'arrow_drop_up',
        collection: 'internal',
      },
      material: {
        name: 'keyboard_arrow_up',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'expand',
      collection: 'tree',
    },
    target: makeIconRefs({
      default: {
        name: 'keyboard_arrow_right',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'expand_rtl',
      collection: 'tree',
    },
    target: makeIconRefs({
      default: {
        name: 'navigate_before',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'collapse',
      collection: 'tree',
    },
    target: makeIconRefs({
      default: {
        name: 'keyboard_arrow_down',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'case-sensitive',
      collection: 'combo',
    },
    target: makeIconRefs({
      default: {
        name: 'case_sensitive',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'today',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'calendar_today',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'star-filled',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'star',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'star-outlined',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'star_border',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'prev',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'navigate_before',
        collection: 'internal',
      },
    }),
  },
  {
    alias: {
      name: 'next',
      collection: 'default',
    },
    target: makeIconRefs({
      default: {
        name: 'navigate_next',
        collection: 'internal',
      },
    }),
  },
];
