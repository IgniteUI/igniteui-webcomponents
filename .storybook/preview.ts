/// <reference types="vite/client" />

import { html } from 'lit';
import { configureTheme } from '../src/theming';
import type { Decorator } from '@storybook/web-components';
import { withActions } from '@storybook/addon-actions/decorator';

type ThemeImport = { default: string };

const themes = import.meta.glob<ThemeImport>('../src/styles/themes/**/*.scss', {
  as: 'inline',
});

const getTheme = async ({ theme, variant }) => {
  const matcher = `../src/styles/themes/${variant}/${theme}.scss`;

  const [_, resolver] = Object.entries(themes).find(([path]) => {
    return path.match(matcher);
  })!;

  const stylesheet = await resolver();
  return stylesheet.default;
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

const parser = new DOMParser();

export const parameters = {
  backgrounds: {
    disable: true,
  },
  docs: {
    source: {
      // Strip theme styles and wrapping container from the code preview
      transform: (code: string) =>
        parser.parseFromString(code, 'text/html').querySelector('#igc-story')
          ?.innerHTML,
      format: 'html',
      language: 'html',
    },
  },
};

export const loaders = [
  async ({ globals }) => ({
    theme: await getTheme(globals),
  }),
];

const themeProvider: Decorator = (Story, context) => {
  configureTheme(context.globals.theme);

  const styles = html`<style>
    .docs-story,
    .sb-main-padded {
        background: ${context.globals.variant === 'light' ? '#fff' : '#000'};
        color: ${context.globals.variant === 'light' ? '#000' : '#fff'};
    }

    ${context.loaded.theme}
    ${getSize(context.globals.size)}
  </style>`;

  return html`
    ${styles}
    <div id="igc-story" dir=${context.globals.direction ?? 'auto'}>
      ${Story()}
    </div>
  `;
};

export const decorators = [themeProvider, withActions];
