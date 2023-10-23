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
import { styles as bootstrap } from './shared/container/card.bootstrap.css.js';
import { styles as fluent } from './shared/container/card.fluent.css.js';
import { styles as indigo } from './shared/container/card.indigo.css.js';
import { styles as material } from './shared/container/card.material.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${material} ${materialLight}
  `,
  fluent: css`
    ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${material} ${materialDark}
  `,
  fluent: css`
    ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
