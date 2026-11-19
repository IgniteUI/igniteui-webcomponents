import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeImportAlias from '../../migrations/7.5.0-poc.1/badge-import-alias.js';

/** Runs the migrations in order on the files, returning the written paths */
function run(files, ...migrations) {
  const writes = [];
  const host = {
    root: '.',
    typescript: ts,
    files: () => Object.keys(files),
    read: (path) => files[path],
    write: (path, content) => {
      writes.push(path);
      files[path] = content;
    },
  };
  for (const migration of migrations) {
    migration(host);
  }
  return writes;
}

/** Asserts the migrations turn `before` into `after`, then change nothing more */
function migrates(migrations, before, after, file = 'src/main.ts') {
  const files = { [file]: before };
  run(files, ...migrations);
  assert.equal(files[file], after);
  assert.deepEqual(run(files, ...migrations), []);
}

test('alias: imports IgcBadgeComponent by name and renames every reference to the alias', () => {
  migrates(
    [badgeImportAlias],
    `import { IgcBadgeComponent as Badge, defineComponents } from 'igniteui-webcomponents';

defineComponents(Badge);
`,
    `import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';

defineComponents(IgcBadgeComponent);
`,
    'src/main.js'
  );

  const main = (badge, specifier) => `import { html } from 'lit';
import { IgcAvatarComponent, ${specifier}, IgcButtonComponent as Button, defineComponents } from 'igniteui-webcomponents';

defineComponents(${badge}, IgcAvatarComponent, Button);
const badge = document.querySelector<${badge}>(${badge}.tagName);
export const create = (Badge: string) => document.createElement(Badge);
export const view = html\`<igc-badge title="Badge">Badge</igc-badge>\`;
const components = { ${badge === 'Badge' ? 'Badge' : 'Badge: IgcBadgeComponent'} };
export { ${badge === 'Badge' ? 'Badge' : 'IgcBadgeComponent as Badge'}, components };
`;
  migrates(
    [badgeImportAlias],
    main('Badge', 'IgcBadgeComponent as Badge'),
    main('IgcBadgeComponent', 'IgcBadgeComponent')
  );
});

test('alias: drops the alias when IgcBadgeComponent is imported by name too', () => {
  migrates(
    [badgeImportAlias],
    `import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';
import { IgcBadgeComponent as Badge } from 'igniteui-webcomponents';
defineComponents(Badge, IgcBadgeComponent);
`,
    `import { IgcBadgeComponent, defineComponents } from 'igniteui-webcomponents';
defineComponents(IgcBadgeComponent, IgcBadgeComponent);
`
  );
});

test('alias: skips a script where IgcBadgeComponent names something else', () => {
  for (const conflict of [
    'const IgcBadgeComponent = 1;',
    'function f(IgcBadgeComponent) {}',
    "import { IgcBadgeComponent } from './badge';",
    "import { IgcBadgeComponent as Other } from 'igniteui-webcomponents';",
  ]) {
    const text = `import { IgcBadgeComponent as Badge } from 'igniteui-webcomponents';\n${conflict}\nBadge.register();\n`;
    migrates([badgeImportAlias], text, text);
  }
});

test('alias: keeps a side-effect import of the package', () => {
  migrates(
    [badgeImportAlias],
    `import 'igniteui-webcomponents';\nimport { IgcBadgeComponent as Badge } from 'igniteui-webcomponents';\nBadge.register();\n`,
    `import 'igniteui-webcomponents';\nimport { IgcBadgeComponent } from 'igniteui-webcomponents';\nIgcBadgeComponent.register();\n`
  );
});
