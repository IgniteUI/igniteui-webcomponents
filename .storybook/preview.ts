/// <reference types="vite/client" />

import { type CSSResult, html } from 'lit';
import { configureTheme } from '../src/theming/config';
import type { Decorator } from '@storybook/web-components';
import { withActions } from '@storybook/addon-actions/decorator';
import { configureActions } from '@storybook/addon-actions';

configureActions({
  clearOnStoryChange: true,
  limit: 5,
});

type ThemeImport = { styles: CSSResult };

const themes = import.meta.glob<ThemeImport>(
  '../src/styles/themes/**/*.css.ts',
  {
    eager: true,
    import: 'styles',
  }
);

const getTheme = ({ theme, variant }) => {
  const matcher = `../src/styles/themes/${variant}/${theme}.css.ts`;

  for (const [path, styles] of Object.entries(themes)) {
    if (path === matcher) {
      return styles;
    }
  }
};

const getSize = (size: 'small' | 'medium' | 'large' | 'default') => {
  if (size === 'default') {
    return;
  }

  return `:root {
    --ig-size: var(--ig-size-${size});
  }`;
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'bootstrap',
    toolbar: {
      icon: 'cog',
      items: ['bootstrap', 'material', 'fluent', 'indigo'],
      title: 'Theme',
    },
  },
  variant: {
    name: 'Variant',
    description: 'Theme variant',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      items: ['light', 'dark'],
      title: 'Variant',
    },
  },
  direction: {
    name: 'Direction',
    description: 'Component direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'accessibility',
      items: ['ltr', 'rtl'],
      title: 'Direction',
    },
  },
  size: {
    name: 'Size',
    description: 'Component size',
    defaultValue: 'default',
    toolbar: {
      icon: 'grow',
      items: ['default', 'small', 'medium', 'large'],
      title: 'Size',
    },
  },
};

export const parameters = {
  backgrounds: {
    disable: true,
  },
};

export const loaders = [
  async ({ globals }) => ({
    theme: await getTheme(globals),
  }),
];

const themeProvider: Decorator = (Story, context) => {
  const { theme, variant, direction, size } = context.globals;
  configureTheme(theme, variant);

  const styles = html`<style>
    .docs-story,
    .sb-main-padded {
        background: ${variant === 'light' ? '#fff' : '#000'};
        color: ${variant === 'light' ? '#000' : '#fff'};
    }

    #igc-story[dir='rtl'] {
      --ig-dir: -1;
    }

    ${context.loaded.theme}
    ${getSize(size)}
  </style>`;

  return html`
    ${styles}
    <div id="igc-story" dir=${direction ?? 'auto'}>${Story()}</div>
  `;
};

export const decorators = [themeProvider, withActions];
