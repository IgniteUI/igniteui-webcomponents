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
  {
    alias: {
      name: 'arrow_prev',
      collection: 'default',
    },
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
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
    target: iconRefs({
      default: {
        name: 'navigate_next',
        collection: 'internal',
      },
    }),
  },
]);
