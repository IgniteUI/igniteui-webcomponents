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
  indigo: {
    name: 'indigo_chevron_down',
    collection: 'internal',
  },
});
addIcon('collapse', {
  default: {
    name: 'keyboard_arrow_up',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_up',
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
  indigo: {
    name: 'indigo_chevron_left',
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
  indigo: {
    name: 'indigo_chevron_right',
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
  indigo: {
    name: 'indigo_cancel',
    collection: 'internal',
  },
});
addIcon('input_clear', {
  default: {
    name: 'clear',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_clear',
    collection: 'internal',
  },
});
addIcon('input_expand', {
  default: {
    name: 'keyboard_arrow_down',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_down',
    collection: 'internal',
  },
});
addIcon('input_collapse', {
  default: {
    name: 'keyboard_arrow_up',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_up',
    collection: 'internal',
  },
});
addIcon('chevron_right', {
  default: {
    name: 'keyboard_arrow_right',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_right',
    collection: 'internal',
  },
});
addIcon('chevron_left', {
  default: {
    name: 'navigate_before',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_left',
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
  indigo: {
    name: 'indigo_calendar_today',
    collection: 'internal',
  },
});
addIcon('clock', {
  default: {
    name: 'access_time',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_access_time',
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
  indigo: {
    name: 'indigo_chevron_left',
    collection: 'internal',
  },
});
addIcon('next', {
  default: {
    name: 'navigate_next',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_right',
    collection: 'internal',
  },
});
addIcon('tree_expand', {
  default: {
    name: 'keyboard_arrow_right',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_right',
    collection: 'internal',
  },
});
addIcon('tree_collapse', {
  default: {
    name: 'keyboard_arrow_down',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_down',
    collection: 'internal',
  },
});
addIcon('carousel_prev', {
  default: {
    name: 'keyboard_arrow_left',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_left',
    collection: 'internal',
  },
});
addIcon('carousel_next', {
  default: {
    name: 'keyboard_arrow_right',
    collection: 'internal',
  },
  indigo: {
    name: 'indigo_chevron_right',
    collection: 'internal',
  },
});
addIcon('error', {
  default: {
    name: 'error',
    collection: 'internal',
  },
});
