import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/card.bootstrap.css.js';
import { styles as fluentDark } from './dark/card.fluent.css.js';
import { styles as indigoDark } from './dark/card.indigo.css.js';
import { styles as materialDark } from './dark/card.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/container/card.bootstrap.css.js';
import { styles as fluentLight } from './light/container/card.fluent.css.js';
import { styles as indigoLight } from './light/container/card.indigo.css.js';
import { styles as materialLight } from './light/container/card.material.css.js';
// Shared Styles
import { styles as shared } from './shared/container/card.common.css.js';
import { styles as fluent } from './shared/container/card.fluent.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
