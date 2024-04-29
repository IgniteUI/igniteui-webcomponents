import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/combo.bootstrap.css.js';
import { styles as fluentDark } from './dark/combo.fluent.css.js';
import { styles as indigoDark } from './dark/combo.indigo.css.js';
import { styles as materialDark } from './dark/combo.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/combo.bootstrap.css.js';
import { styles as fluentLight } from './light/combo.fluent.css.js';
import { styles as indigoLight } from './light/combo.indigo.css.js';
import { styles as materialLight } from './light/combo.material.css.js';
import { styles as shared } from './light/combo.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/combo.bootstrap.css.js';
import { styles as fluent } from './shared/combo.fluent.css.js';
import { styles as indigo } from './shared/combo.indigo.css.js';
import { styles as material } from './shared/combo.material.css.js';

const light = {
  shared: css`
    ${shared}
  `,
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
  shared: css`
    ${shared}
  `,
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
