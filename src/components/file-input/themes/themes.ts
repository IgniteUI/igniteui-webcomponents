import { css } from 'lit';

import type { Themes } from '../../../theming/types.js';
import { all as inputThemes } from '../../input/themes/themes.js';

// Shared Styles
import { styles as bootstrap } from './shared/bootstrap.css.js';
import { styles as material } from './shared/material.css.js';

const light = {
  shared: css`
    ${inputThemes.light.shared!}
  `,
  bootstrap: css`
    ${bootstrap}
    ${inputThemes.light.bootstrap!}
  `,
  material: css`
    ${material}
    ${inputThemes.light.material!}
  `,
  indigo: css`
    ${inputThemes.light.indigo!}
  `,
  fluent: css`
    ${inputThemes.light.fluent!}
  `,
};

const dark = {
  shared: css`
    ${inputThemes.dark.shared!}
  `,
  bootstrap: css`
    ${bootstrap}
    ${inputThemes.dark.bootstrap!}
  `,
  material: css`
    ${material}
    ${inputThemes.dark.material!}
  `,
  indigo: css`
    ${inputThemes.dark.indigo!}
  `,
  fluent: css`
    ${inputThemes.dark.fluent!}
  `,
};

export const all: Themes = { light, dark };
