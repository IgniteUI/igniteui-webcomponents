import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
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
import { styles as shared } from './light/calendar.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/bootstrap/days-view.bootstrap.css.js';
import { styles as fluent } from './shared/fluent/days-view.fluent.css.js';
import { styles as indigo } from './shared/indigo/days-view.indigo.css.js';
import { styles as material } from './shared/material/days-view.material.css.js';

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
