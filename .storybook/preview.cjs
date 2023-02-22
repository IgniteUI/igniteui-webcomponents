import { html } from 'lit-html';
import { configureTheme } from '../src/theming';

const themes = import.meta.glob('../dist/themes/**/*.css', {
  as: 'inline',
});

const getTheme = async ({ theme, variant }) => {
  const matcher = `../dist/themes/${variant}/${theme}.css`;

  const [_, resolver] = Object.entries(themes).find(([path]) => {
    return path.match(matcher);
  });

  const stylesheet = await resolver();
  return stylesheet.default;
};

const getSize = (size) => {
  if (size === 'attribute') {
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
      title: 'Theme'
    },
  },
  variant: {
    name: 'Variant',
    description: 'Theme variant',
    defaultValue: 'light',
    toolbar: {
      icon: 'mirror',
      items: ['light', 'dark'],
      title: 'Variant'
    },
  },
  direction: {
    name: 'Direction',
    description: 'Component direction',
    defaultValue: 'ltr',
    toolbar: {
      icon: 'accessibility',
      items: ['ltr', 'rtl'],
      title: 'Direction'
    },
  },
  size: {
    name: 'Size',
    description: 'Component size',
    defaultValue: 'attribute',
    toolbar: {
      icon: 'grow',
      items: ['attribute', 'small', 'medium', 'large'],
      title: 'Size'
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

const themeProvider = (Story, context) => {
  configureTheme(context.globals.theme);

  // Workaround for https://github.com/cfware/babel-plugin-template-html-minifier/issues/56
  const htmlNoMin = html;
  const styles = htmlNoMin`
    <style>
      .sb-main-padded {
          background: ${context.globals.variant === 'light' ? '#fff' : '#000'};
      }

      ${context.loaded.theme}
      ${getSize(context.globals.size)}
    </style>`;

  return html` ${styles} ${Story()} `;
};

export const decorators = [themeProvider];
