import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { all as inputThemes } from '../../input/themes/themes.js';

// Dark Overrides
import { styles as bootstrapDark } from './dark/file-input.bootstrap.css.js';
import { styles as fluentDark } from './dark/file-input.fluent.css.js';
import { styles as indigoDark } from './dark/file-input.indigo.css.js';
import { styles as materialDark } from './dark/file-input.material.css.js';
// Light Overrides
import { styles as bootstrapLight } from './light/file-input.bootstrap.css.js';
import { styles as fluentLight } from './light/file-input.fluent.css.js';
import { styles as indigoLight } from './light/file-input.indigo.css.js';
import { styles as materialLight } from './light/file-input.material.css.js';
import { styles as shared } from './light/file-input.shared.css.js';
// Shared Styles
import { styles as bootstrap } from './shared/file-input.bootstrap.css.js';
import { styles as fluent } from './shared/file-input.fluent.css.js';
import { styles as indigo } from './shared/file-input.indigo.css.js';
import { styles as material } from './shared/file-input.material.css.js';

const light = {
  shared: css`
    ${shared}
    ${inputThemes.light.shared!}
  `,
  bootstrap: css`
    ${bootstrap}
    ${bootstrapLight}
    ${inputThemes.light.bootstrap!}
  `,
  material: css`
    ${material}
    ${materialLight}
    ${inputThemes.light.material!}
  `,
  indigo: css`
    ${indigo}
    ${indigoLight}
    ${inputThemes.light.indigo!}
  `,
  fluent: css`
    ${fluent}
    ${fluentLight}
    ${inputThemes.light.fluent!}
  `,
};

const dark = {
  shared: css`
    ${shared}
    ${inputThemes.dark.shared!}
  `,
  bootstrap: css`
    ${bootstrap}
    ${bootstrapDark}
    ${inputThemes.dark.bootstrap!}
  `,
  material: css`
    ${material}
    ${materialDark}
    ${inputThemes.dark.material!}
  `,
  indigo: css`
    ${indigo}
    ${indigoDark}
    ${inputThemes.dark.indigo!}
  `,
  fluent: css`
    ${fluent}
    ${fluentDark}
    ${inputThemes.dark.fluent!}
  `,
};

export const all: Themes = { light, dark };
