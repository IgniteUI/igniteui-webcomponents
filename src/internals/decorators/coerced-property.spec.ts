import {
  defineCE,
  elementUpdated,
  expect,
  fixture,
  html,
  unsafeStatic,
} from '@open-wc/testing';
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { coercedProperty } from './coerced-property.js';

type ChangeRecord = { value: number; previous: number | undefined };

class CoercedFixtureElement extends LitElement {
  public changes: ChangeRecord[] = [];

  @property({ type: Number, reflect: true })
  @coercedProperty<number, CoercedFixtureElement>({
    transform: ({ value }) => Math.min(Math.max(value, 0), 10),
    onChange: ({ value, host, previous }) => {
      host.changes.push({ value, previous });
    },
  })
  public value = 15;

  public listChanges = 0;

  @property({ attribute: false })
  @coercedProperty<number[], CoercedFixtureElement>({
    onChange: ({ host }) => {
      host.listChanges++;
    },
  })
  public list: number[] = [];

  protected override render() {
    return html`${this.value}`;
  }
}

class ReversedOrderFixtureElement extends LitElement {
  @coercedProperty<number, ReversedOrderFixtureElement>({
    transform: ({ value }) => value * 2,
  })
  @property({ type: Number })
  public value = 3;

  protected override render() {
    return html`${this.value}`;
  }
}

const coercedTag = defineCE(CoercedFixtureElement);
const coercedTagName = unsafeStatic(coercedTag);
const reversedTag = defineCE(ReversedOrderFixtureElement);
const reversedTagName = unsafeStatic(reversedTag);

describe('coercedProperty decorator', () => {
  let element: CoercedFixtureElement;

  beforeEach(async () => {
    element = await fixture(html`<${coercedTagName}></${coercedTagName}>`);
  });

  it('transforms the field initializer without firing onChange', () => {
    expect(element.value).to.equal(10);
    expect(element.changes).to.be.empty;
  });

  it('transforms property sets and fires onChange with the previous value', () => {
    element.value = 42;
    expect(element.value).to.equal(10);

    element.value = -5;
    expect(element.value).to.equal(0);

    // 42 coerces to the stored 10, which is not a change.
    expect(element.changes).to.eql([{ value: 0, previous: 10 }]);
  });

  it('does not fire onChange when the value is set again', () => {
    element.value = 4;
    element.value = 4;

    expect(element.changes).to.eql([{ value: 4, previous: 10 }]);
  });

  it('fires onChange when the same array is set again', () => {
    const list = [1];
    element.list = list;
    list.push(2);
    element.list = list;

    expect(element.listChanges).to.equal(2);
  });

  it('transforms attribute-driven sets', async () => {
    element.setAttribute('value', '99');
    await elementUpdated(element);

    expect(element.value).to.equal(10);
  });

  it('keeps the property reactive and reflecting', async () => {
    element.value = 7;
    await elementUpdated(element);

    expect(element.renderRoot.textContent).to.equal('7');
    expect(element.getAttribute('value')).to.equal('7');
  });

  it('wraps an already installed Lit accessor when the order is reversed', async () => {
    const reversed = await fixture<ReversedOrderFixtureElement>(
      html`<${reversedTagName}></${reversedTagName}>`
    );

    expect(reversed.value).to.equal(6);

    reversed.value = 5;
    await elementUpdated(reversed);

    expect(reversed.value).to.equal(10);
    expect(reversed.renderRoot.textContent).to.equal('10');
  });
});
