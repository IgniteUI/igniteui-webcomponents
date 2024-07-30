import type {
  IconMeta,
  IconReference,
  IconThemeKey,
} from './registry/types.js';

type Icon = { [key in IconThemeKey]?: IconMeta };

export const iconReferences: IconReference[] = [];
const makeIconRefs = (icons: Icon) => {
  return new Map(
    Object.entries(icons).map((icon) => {
      return icon as [theme: IconThemeKey, IconMeta];
    })
  );
};

const addIcon = (name: string, target: Icon) => {
  const icon = {
    alias: {
      name,
      collection: 'default',
    },
    target: makeIconRefs(target),
  };

  iconReferences.push(icon as IconReference);
};

addIcon('expand', {
  default: {
    name: 'keyboard_arrow_down',
    collection: 'internal',
  },
});
addIcon('collapse', {
  default: {
    name: 'keyboard_arrow_up',
    collection: 'internal',
  },
});
addIcon('arrow_prev', {
  default: {
    name: 'navigate_before',
    collection: 'internal',
  },
  fluent: {
    name: 'arrow_upward',
    collection: 'internal',
  },
});
addIcon('arrow_next', {
  default: {
    name: 'navigate_next',
    collection: 'internal',
  },
  fluent: {
    name: 'arrow_downward',
    collection: 'internal',
  },
});
addIcon('selected', {
  default: {
    name: 'chip_select',
    collection: 'internal',
  },
});
addIcon('remove', {
  default: {
    name: 'chip_cancel',
    collection: 'internal',
  },
});
addIcon('input_clear', {
  default: {
    name: 'clear',
    collection: 'internal',
  },
  material: {
    name: 'chip_cancel',
    collection: 'internal',
  },
});
addIcon('input_expand', {
  default: {
    name: 'arrow_drop_down',
    collection: 'internal',
  },
  material: {
    name: 'keyboard_arrow_down',
    collection: 'internal',
  },
});
addIcon('input_collapse', {
  default: {
    name: 'arrow_drop_up',
    collection: 'internal',
  },
  material: {
    name: 'keyboard_arrow_up',
    collection: 'internal',
  },
});
addIcon('chevron_right', {
  default: {
    name: 'keyboard_arrow_right',
    collection: 'internal',
  },
});
addIcon('chevron_left', {
  default: {
    name: 'navigate_before',
    collection: 'internal',
  },
});
addIcon('case_sensitive', {
  default: {
    name: 'case_sensitive',
    collection: 'internal',
  },
});
addIcon('today', {
  default: {
    name: 'calendar_today',
    collection: 'internal',
  },
});
addIcon('star_filled', {
  default: {
    name: 'star',
    collection: 'internal',
  },
});
addIcon('star_outlined', {
  default: {
    name: 'star_border',
    collection: 'internal',
  },
});
addIcon('prev', {
  default: {
    name: 'navigate_before',
    collection: 'internal',
  },
});
addIcon('next', {
  default: {
    name: 'navigate_next',
    collection: 'internal',
  },
});
addIcon('tree_expand', {
  default: {
    name: 'keyboard_arrow_right',
    collection: 'internal',
  },
});
addIcon('tree_collapse', {
  default: {
    name: 'keyboard_arrow_down',
    collection: 'internal',
  },
});
