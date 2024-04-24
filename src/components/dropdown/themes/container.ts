import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
// Dark Overrides
import { styles as bootstrapDark } from './dark/dropdown.bootstrap.css.js';
import { styles as fluentDark } from './dark/dropdown.fluent.css.js';
import { styles as indigoDark } from './dark/dropdown.indigo.css.js';
import { styles as materialDark } from './dark/dropdown.material.css.js';
import { styles as sharedDark } from './dark/dropdown.shared.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/dropdown.bootstrap.css.js';
import { styles as fluentLight } from './light/dropdown.fluent.css.js';
import { styles as indigoLight } from './light/dropdown.indigo.css.js';
import { styles as materialLight } from './light/dropdown.material.css.js';
import { styles as sharedLight } from './light/dropdown.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/dropdown.bootstrap.css.js';
import { styles as fluent } from './shared/dropdown.fluent.css.js';
import { styles as indigo } from './shared/dropdown.indigo.css.js';
import { styles as material } from './shared/dropdown.material.css.js';

const light = {
  shared: css`
    ${sharedLight}
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
    ${sharedDark}
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
