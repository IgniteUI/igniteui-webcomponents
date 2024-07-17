import type { IconReferences } from './icon.registry.js';

export const iconReferences: IconReferences = new Set([
  {
    alias: {
      name: 'expand',
      collection: 'default',
    },
    target: new Map([
      [
        'default',
        {
          name: 'keyboard_arrow_down',
          collection: 'internal',
        },
      ],
      [
        'indigo',
        {
          name: 'arrow_downward',
          collection: 'internal',
        },
      ],
    ]),
  },
  {
    alias: {
      name: 'collapse',
      collection: 'default',
    },
    target: new Map([
      [
        'default',
        {
          name: 'keyboard_arrow_up',
          collection: 'internal',
        },
      ],
      [
        'indigo',
        {
          name: 'arrow_upward',
          collection: 'internal',
        },
      ],
    ]),
  },
]);
