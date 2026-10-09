import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { internalsOf } from '../controllers/internals.js';
import { IgcGroupBaseComponent } from './group.js';

describe('Group base component', () => {
  let tag: ReturnType<typeof unsafeStatic>;

  before(() => {
    tag = unsafeStatic(defineCE(class extends IgcGroupBaseComponent {}));
  });

  const ariaLabelOf = (group: Element) =>
    internalsOf(group)?.getARIA('ariaLabel');

  it('names the group by the text of its label', async () => {
    const group = await fixture<IgcGroupBaseComponent>(
      html`<${tag}><span slot="label"> Fruits </span></${tag}>`
    );

    expect(internalsOf(group)?.getARIA('role')).to.equal('group');
    expect(ariaLabelOf(group)).to.equal('Fruits');
  });

  it('removes the name when the label goes away', async () => {
    const group = await fixture<IgcGroupBaseComponent>(
      html`<${tag}><span slot="label">Fruits</span></${tag}>`
    );

    group.querySelector('[slot="label"]')!.remove();
    await elementUpdated(group);

    expect(ariaLabelOf(group)).to.be.null;
  });

  it('has no name without a label', async () => {
    const group = await fixture<IgcGroupBaseComponent>(html`<${tag}></${tag}>`);

    expect(ariaLabelOf(group)).to.be.null;
  });
});
