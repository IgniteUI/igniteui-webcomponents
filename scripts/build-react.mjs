import fs from 'node:fs/promises';
import path from 'node:path';
import { format } from 'prettier';
import { rimraf } from 'rimraf';

const ignored = [
  'igc-popover',
  'igc-days-view',
  'igc-months-view',
  'igc-years-view',
];

const prettierConfig = { parser: 'babel-ts', singleQuote: true };

const ReactRoot = new URL('../src/react', import.meta.url);
const metadata = JSON.parse(
  await fs.readFile(new URL('../custom-elements.json', import.meta.url), 'utf8')
);

const components = getAllComponents(metadata, ignored);
const rootIndexPath = path.join(ReactRoot.pathname, 'index.ts');
const rootIndexContent = [];

await rimraf(ReactRoot.pathname);
await fs.mkdir(ReactRoot, { recursive: true });

for (const component of components) {
  const componentSubpaths = makeComponentSubpaths(ReactRoot, component);
  const eventsMeta = makeEventsMeta(component);
  const importPath = fixImportPath(component.path);

  await fs.mkdir(componentSubpaths.dir, { recursive: true });

  const litReactImports = eventsMeta.hasEvents
    ? `import {type EventName, createComponent } from '../../react-props.js'`
    : `import { createComponent } from '../../react-props.js'`;

  const source = await format(
    `
    import * as React from 'react';

    ${litReactImports}
    import Component from '${importPath}';
    ${eventsMeta.imports}
    ${eventsMeta.exports}

    Component.register()

    ${makeDescription(component)}
    const reactWrapper = createComponent({
      tagName: '${component.tagName}',
      elementClass: Component,
      react: React,
      events: {
        ${eventsMeta.events}
      },
      displayName: '${component.name}'
    })

    export default reactWrapper
    `,
    prettierConfig
  );

  await fs.writeFile(componentSubpaths.file, source, 'utf8');

  rootIndexContent.push(
    `export { default as ${component.name} } from './${componentSubpaths.name}/index.js'`
  );
}

await fs.writeFile(
  rootIndexPath,
  await format(rootIndexContent.join('\n'), prettierConfig),
  'utf8'
);

function makeComponentSubpaths(root, component) {
  const name = component.tagName.replace(/^igc-/, '');
  const dir = path.join(root.pathname, name);
  const file = path.join(dir, 'index.ts');

  return { name, dir, file };
}

function getAllComponents(metadata, skip) {
  const allComponents = [];

  metadata.modules.map((module) => {
    module.declarations?.map((declaration) => {
      if (
        declaration.customElement &&
        declaration.tagName &&
        !declaration.deprecated &&
        !skip.includes(declaration.tagName)
      ) {
        const component = declaration;
        const path = module.path;

        if (component) {
          allComponents.push(Object.assign(component, { path }));
        }
      }
    });
  });

  return allComponents;
}

function getEvents(component) {
  if (component.tagName === 'igc-step') {
    return [];
  }
  return (component.events || []).filter((event) => event.name);
}

function makeDescription(component) {
  return component.description
    ? [
        '/**',
        ...component.description.split('\n').map((part) => `* ${part}`),
        '*/',
      ].join('\n')
    : '';
}

function makeEventsMeta(component) {
  const _events = getEvents(component);
  const hasEvents = _events.length > 0;
  const eventTypeImport = `${component.name}EventMap`;
  const importPath = fixImportPath(component.path);

  return {
    hasEvents,
    imports: hasEvents
      ? `import type {${eventTypeImport}} from '${importPath}'`
      : '',
    exports: hasEvents
      ? `export type {${eventTypeImport}} from '${importPath}'`
      : '',
    events: hasEvents
      ? _events
          .map(
            (e) =>
              `on${e.name}: '${e.name}' as EventName<${eventTypeImport}['${e.name}']>`
          )
          .join(',\n')
      : '',
  };
}

function fixImportPath(path) {
  return `../..${path.replace(/^src/, '').replace(/\.ts$/, '.js')}`;
}
