import assert from 'node:assert/strict';
import { test } from 'node:test';
import ts from 'typescript';
import badgeOutline from '../../migrations/7.5.0-poc.0/badge-outline.js';

/** In-memory project; `typescript` stands in for the CLI's */
function project(files, typescript = ts) {
  const writes = [];
  const host = {
    root: '.',
    typescript,
    files: () => Object.keys(files),
    read: (path) => files[path],
    write: (path, content) => {
      writes.push(path);
      files[path] = content;
    },
  };
  return { files, writes, run: () => badgeOutline(host) };
}

const page = (old, outlined) => `<!doctype html>
<!-- <igc-badge outline> in a comment -->
<style>
  igc-badge[outline] { outline: 1px solid red; }
</style>
<igc-badge ${old} variant="success">3</igc-badge>
<IGC-BADGE ${old === 'outline' ? 'OUTLINE' : old}>outline</IGC-BADGE>
<igc-badge
  variant="info"
  ${old}
></igc-badge>
<igc-badge ${old}/>
<igc-badge outlined></igc-badge>
<igc-badge ${outlined}outlined shape="square"></igc-badge>
<igc-avatar outline></igc-avatar>
<igc-button outline>outline</igc-button>
<p title="outline">outline</p>
`;

const view = (old, outlined) => `import { html } from 'lit';

// html\`<igc-badge outline>\` in a comment
const label = '<igc-badge outline>';

export const view = (isActive: boolean) => html\`
  <igc-badge ?${old}=\${isActive} variant="success">3</igc-badge>
  <igc-badge .${old}=\${isActive > 0}></igc-badge>
  <igc-badge ${old} title=\${\`outline \${isActive}\`}></igc-badge>
  <igc-badge ${outlined}?outlined=\${isActive}></igc-badge>
  \${isActive ? html\`<igc-badge ${old}></igc-badge>\` : label}
  <igc-avatar ?outline=\${isActive}></igc-avatar>
  <!-- <igc-badge outline> -->
\`;
`;

const css = 'igc-badge { outline: 1px solid; }\n';

test('renames outline to outlined on igc-badge only, keeping everything else', () => {
  const { files, writes, run } = project({
    'index.html': page('outline', 'outline '),
    'src/view.ts': view('outline', 'outline '),
    'src/styles.css': css,
  });

  run();

  assert.equal(files['index.html'], page('outlined', ''));
  assert.equal(files['src/view.ts'], view('outlined', ''));
  assert.equal(files['src/styles.css'], css);
  assert.deepEqual(writes, ['index.html', 'src/view.ts']);
});

test('leaves the content of script, style and textarea elements untouched', () => {
  const raw = `<script type="module">
  // <igc-badge outline>
  const badge = '<igc-badge outline>';
</SCRIPT >
<style>
  igc-badge[outline]::after { content: '<igc-badge outline>'; }
</style>
<textarea><igc-badge outline></textarea>
<script-like outline></script-like>
`;
  const { files, run } = project({
    'index.html': `${raw}<igc-badge outline></igc-badge>\n`,
  });

  run();

  assert.equal(files['index.html'], `${raw}<igc-badge outlined></igc-badge>\n`);
});

test('changes nothing when run again', () => {
  const { files, writes, run } = project({
    'index.html': page('outline', 'outline '),
    'src/view.ts': view('outline', 'outline '),
  });

  run();
  const migrated = { ...files };
  run();

  assert.deepEqual(files, migrated);
  assert.equal(writes.length, 2);
});

test('skips a script with syntax errors, with a warning, and migrates the other files', (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const broken = `import { html } from 'lit';
export function view() {
  return html\`<igc-badge outline></igc-badge>\`;
`;
  const { files, writes, run } = project({
    'index.html': page('outline', ''),
    'src/broken.ts': broken,
    'src/view.ts': view('outline', ''),
  });

  run();

  assert.equal(files['src/broken.ts'], broken);
  assert.equal(files['index.html'], page('outlined', ''));
  assert.equal(files['src/view.ts'], view('outlined', ''));
  assert.deepEqual(writes, ['index.html', 'src/view.ts']);
  assert.equal(warn.mock.callCount(), 1);
  assert.match(warn.mock.calls[0].arguments[0], /Skipped src\/broken\.ts/);
});

test("needs the CLI's TypeScript only for scripts that use igc-badge", () => {
  const { files, run } = project(
    { 'index.html': page('outline', ''), 'src/main.ts': 'export {};\n' },
    null
  );
  run();
  assert.equal(files['index.html'], page('outlined', ''));
  assert.throws(
    () => project({ 'src/view.ts': view('outline', '') }, null).run(),
    /requires TypeScript from the CLI/
  );
});
