import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import comboEventRename from '../../migrations/7.5.0-poc.3/combo-event-rename.js';

/** Asserts the migration turns `before` into `after`, then changes nothing more */
function migrates(before, after, file = 'src/main.ts') {
  const files = { [file]: before };
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
  comboEventRename(host);
  assert.equal(files[file], after);
  comboEventRename(host);
  assert.deepEqual(writes, before === after ? [] : [file]);
}

test('renames igcOpening to igcOpened in listeners on known combos', () => {
  migrates(
    `const combo = document.querySelector('igc-combo');
combo.addEventListener('igcOpening', handler);
`,
    `const combo = document.querySelector('igc-combo');
combo.addEventListener('igcOpened', handler);
`,
    'src/main.js'
  );

  const main = (
    event
  ) => `import { type IgcComboComponent, IgcSelectComponent } from 'igniteui-webcomponents';
import * as UI from 'igniteui-webcomponents';

const typed: IgcComboComponent | null = document.getElementById('combo') as IgcComboComponent;
const looked = document.querySelector<UI.IgcComboComponent>('#combo')!;
const select = document.querySelector('igc-select') as IgcSelectComponent;
let reassigned = document.querySelector('igc-combo');
typed?.addEventListener('${event}', handler);
looked.removeEventListener("${event}", handler);
document.querySelector('igc-combo.large')!.addEventListener('${event}', handler);
(document.createElement('igc-combo') as HTMLElement).addEventListener('${event}', handler);
select.addEventListener('igcOpening', handler);
reassigned.addEventListener('igcOpening', handler);
document.querySelector('igc-combo igc-input')!.addEventListener('igcOpening', handler);
const listen = (combo: IgcComboComponent, other: HTMLElement) => {
  combo.addEventListener('${event}', handler);
  other.addEventListener('igcOpening', handler);
};
const listenShadowed = (typed: HTMLElement) => typed.addEventListener('igcOpening', handler);
const events = ['igcOpening'];
console.log('igcOpening');
`;
  migrates(main('igcOpening'), main('igcOpened'));
});

test('renames @igcOpening to @igcOpened on igc-combo in Lit templates', () => {
  const view = (event) => `import { html } from 'lit';

export const view = (open: () => void) => html\`
  <igc-combo @${event}=\${open} @igcClosing=\${open} title="@igcOpening">
    <span @igcOpening=\${open}></span>
  </igc-combo>
  <igc-select @igcOpening=\${open}></igc-select>
  <!-- <igc-combo @igcOpening=\${open}> -->
  \${html\`<igc-combo
    .value=\${[]}
    @${event}=\${() => open()}
  ></igc-combo>\`}
  <igc-combo @igcOpening=\${open} @igcOpened=\${open}></igc-combo>
\`;
const notLit = css\`<igc-combo @igcOpening=\${open}>\`;
`;
  migrates(view('igcOpening'), view('igcOpened'));
});

test('skips a script with syntax errors, with a warning', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const broken = `const combo = document.querySelector('igc-combo');
combo.addEventListener('igcOpening', handler;
`;
  migrates(broken, broken);
  // Once per run: `migrates` runs the migration twice.
  assert.equal(warn.mock.callCount(), 2);
  assert.match(warn.mock.calls[0].arguments[0], /Skipped src\/main\.ts/);
});
