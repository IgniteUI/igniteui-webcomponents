import { css } from 'lit';

// Dark Overrides
import { styles as bootstrapDark } from './dark/calendar.bootstrap.css.js';
import { styles as fluentDark } from './dark/calendar.fluent.css.js';
import { styles as indigoDark } from './dark/calendar.indigo.css.js';
import { styles as materialDark } from './dark/calendar.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/calendar.bootstrap.css.js';
import { styles as fluentLight } from './light/calendar.fluent.css.js';
import { styles as indigoLight } from './light/calendar.indigo.css.js';
import { styles as materialLight } from './light/calendar.material.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/bootstrap/calendar.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/calendar.fluent.css.js';
import { styles as indigo } from './shared/indigo/calendar.indigo.css.js';
import { styles as shared } from './shared/material/calendar.common.css.js';
import { Themes } from '../../../theming/types.js';

const light = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapLight}
  `,
  material: css`
    ${shared} ${materialLight}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentLight}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoLight}
  `,
};

const dark = {
  bootstrap: css`
    ${shared} ${bootstrap} ${bootstrapDark}
  `,
  material: css`
    ${shared} ${materialDark}
  `,
  fluent: css`
    ${shared} ${fluent} ${fluentDark}
  `,
  indigo: css`
    ${shared} ${indigo} ${indigoDark}
  `,
};

export const all: Themes = { light, dark };
