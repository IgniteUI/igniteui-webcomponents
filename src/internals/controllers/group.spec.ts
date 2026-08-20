import { defineCE, expect, fixture, html } from '@open-wc/testing';
import { LitElement } from 'lit';
import {
  createGroupRegistry,
  type GroupMemberController,
  type GroupRegistry,
} from './group.js';

interface GroupTestElement extends LitElement {
  name: string;
  value: number;
  groupSum: number;
  group: GroupMemberController<GroupTestElement>;
}

describe('Group registry', () => {
  let tag: string;
  let registry: GroupRegistry<GroupTestElement, number>;
  let container: HTMLElement;

  before(() => {
    registry = createGroupRegistry<GroupTestElement, number>({
      keyOf: (host) => host.name,
      deriveState: (members) =>
        members.reduce((sum, member) => sum + member.value, 0),
    });

    tag = defineCE(
      class extends LitElement {
        public name = '';
        public value = 0;
        public groupSum = Number.NaN;

        public readonly group = registry.attach(this, (sum: number) => {
          this.groupSum = sum;
        });
      }
    );
  });

  function createMember(name: string, value: number): GroupTestElement {
    const element = document.createElement(tag) as GroupTestElement;
    element.name = name;
    element.value = value;
    container.append(element);
    return element;
  }

  beforeEach(async () => {
    container = await fixture(html`<div></div>`);
  });

  it('should group members by key and sync the derived state to each one', () => {
    const [a, b] = [createMember('first', 1), createMember('first', 2)];
    const other = createMember('second', 10);

    expect(a.groupSum).to.equal(3);
    expect(b.groupSum).to.equal(3);
    expect(other.groupSum).to.equal(10);
  });

  it('should report the members of a group in DOM order', () => {
    const b = createMember('group', 2);
    const a = createMember('group', 1);
    container.prepend(a);

    expect(registry.membersOf(b)).to.eql([a, b]);
    expect(registry.membersOf(a)).to.eql([a, b]);
  });

  it('should keep a member with an empty key on its own', () => {
    const loner = createMember('', 5);
    createMember('', 7);

    expect(registry.membersOf(loner)).to.eql([loner]);
    expect(loner.groupSum).to.equal(5);
  });

  it('should re-sync the remaining members when one disconnects', () => {
    const a = createMember('leave', 1);
    const b = createMember('leave', 2);
    expect(a.groupSum).to.equal(3);

    b.remove();
    expect(a.groupSum).to.equal(1);
    expect(registry.membersOf(a)).to.eql([a]);
  });

  it('should move a member between groups when its key changes', () => {
    const a = createMember('from', 1);
    const b = createMember('from', 2);
    const c = createMember('to', 4);

    b.name = 'to';
    b.group.updateMembership();

    expect(registry.membersOf(a)).to.eql([a]);
    expect(registry.membersOf(b)).to.eql([b, c]);
    expect(b.groupSum).to.equal(6);
    expect(c.groupSum).to.equal(6);
  });

  it('should ignore stale entries of members that changed key without an update', () => {
    const a = createMember('stale', 1);
    const b = createMember('stale', 2);

    // The entry moves on the next membership update; reads must not see it.
    b.name = 'elsewhere';

    expect(registry.membersOf(a)).to.eql([a]);
  });

  it('should scope groups to the root node', () => {
    const inDocument = createMember('scoped', 1);

    const shadowHost = document.createElement('div');
    container.append(shadowHost);
    const shadow = shadowHost.attachShadow({ mode: 'open' });
    const inShadow = document.createElement(tag) as GroupTestElement;
    inShadow.name = 'scoped';
    inShadow.value = 2;
    shadow.append(inShadow);

    expect(registry.membersOf(inDocument)).to.eql([inDocument]);
    expect(registry.membersOf(inShadow)).to.eql([inShadow]);
  });

  it('should recompute the group state on demand via sync', () => {
    const a = createMember('sum', 1);
    const b = createMember('sum', 2);

    b.value = 40;
    a.group.sync();

    expect(a.groupSum).to.equal(41);
    expect(b.groupSum).to.equal(41);
  });
});
