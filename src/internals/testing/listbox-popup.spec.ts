import { elementUpdated, expect, fixture } from '@open-wc/testing';
import type { TemplateResult } from 'lit';
import { spy } from 'sinon';
import type { IgcComboBoxBaseLikeComponent } from '../bases/combo-box.js';
import type { IgcBaseOptionLikeComponent } from '../bases/option.js';
import {
  arrowDown,
  enterKey,
  escapeKey,
  tabKey,
} from '../controllers/key-bindings.js';
import {
  decideListboxIntent,
  type ListboxIntent,
} from '../controllers/listbox-popup.js';
import { simulateClick, simulateKeyboard } from './simulate.spec.js';

type ListboxHost = Omit<IgcComboBoxBaseLikeComponent, 'emitEvent'> & {
  readonly items: IgcBaseOptionLikeComponent[];
  readonly selectedItem: IgcBaseOptionLikeComponent | null;
  readonly value?: string;
  disabled?: boolean;
  navigateTo(index: number): unknown;
  emitEvent(name: string, init?: CustomEventInit): boolean;
};

const KEYS: Partial<Record<ListboxIntent, string>> = {
  move: arrowDown,
  enter: enterKey,
  tab: tabKey,
  escape: escapeKey,
};

/**
 * Tests that the host applies the popup rules of `decideListboxIntent` to its
 * keys and item clicks. `template` renders the host with at least two enabled
 * items and no selection. With `hasValue`, the host `value` follows the
 * selected item. With `disabled`, a disabled host ignores all keys.
 */
export function runListboxPopupTests(
  template: TemplateResult,
  {
    closedKeys,
    hasValue = false,
    disabled = false,
  }: { closedKeys: boolean; hasValue?: boolean; disabled?: boolean }
): void {
  describe('Listbox popup rules', () => {
    if (disabled) {
      for (const intent of ['move', 'enter', 'tab', 'escape'] as const) {
        for (const open of [true, false]) {
          it(`${intent} while disabled with ${JSON.stringify({ open })} does nothing`, async () => {
            const host = await fixture<ListboxHost>(template);

            if (open) {
              await host.show();
            }
            host.navigateTo(0);
            host.disabled = true;
            await elementUpdated(host);

            const openBefore = host.open;
            const activeBefore = host.items.find((item) => item.active);
            const eventSpy = spy(host, 'emitEvent');

            simulateKeyboard(host, KEYS[intent]!);
            await elementUpdated(host);

            expect(host.open, 'open').to.equal(openBefore);
            expect(host.selectedItem, 'selected item').to.be.null;
            expect(
              host.items.find((item) => item.active),
              'active item'
            ).to.equal(activeBefore);
            expect(eventSpy.calledWith('igcChange'), 'igcChange').to.be.false;
          });
        }
      }
    }

    const intents: ListboxIntent[] = ['move', 'pick', 'enter', 'tab', 'escape'];

    for (const intent of intents) {
      for (const open of [true, false]) {
        for (const keepOpenOnSelect of [false, true]) {
          for (const hasItem of [true, false]) {
            // ArrowDown always finds an enabled item, and a closed list takes no click.
            if (
              (intent === 'move' && !hasItem) ||
              (intent === 'pick' && !open)
            ) {
              continue;
            }

            const state = { open, keepOpenOnSelect, closedKeys, hasItem };

            it(`${intent} with ${JSON.stringify(state)}`, async () => {
              const host = await fixture<ListboxHost>(template);
              host.keepOpenOnSelect = keepOpenOnSelect;

              if (open) {
                await host.show();
              }

              // Enter and Tab act on the active item; Escape keeps it.
              if (hasItem && intent !== 'move' && intent !== 'pick') {
                host.navigateTo(0);
              }

              const target = intent === 'pick' ? host.items[1] : host.items[0];
              if (intent === 'pick' && !hasItem) {
                target.disabled = true;
              }

              await elementUpdated(host);

              const activeBefore = host.items.find((item) => item.active);
              const eventSpy = spy(host, 'emitEvent');

              if (intent === 'pick') {
                simulateClick(target);
              } else {
                simulateKeyboard(host, KEYS[intent]!);
              }
              await elementUpdated(host);

              const outcome = decideListboxIntent(intent, state);
              const expectedOpen = !!outcome.open || (open && !outcome.close);
              const expectedActive =
                outcome.activate || outcome.commit ? target : activeBefore;

              const expectedSelected = outcome.commit ? target : null;

              expect(host.open, 'open').to.equal(expectedOpen);
              expect(host.selectedItem, 'selected item').to.equal(
                expectedSelected
              );
              expect(
                host.items.filter((item) => item.selected),
                'selected flags'
              ).to.have.members(expectedSelected ? [expectedSelected] : []);
              expect(
                host.items.filter((item) => item.active),
                'active flags'
              ).to.have.members(expectedActive ? [expectedActive] : []);

              if (hasValue) {
                expect(host.value, 'value').to.equal(expectedSelected?.value);
              }
              expect(eventSpy.calledWith('igcChange'), 'igcChange').to.equal(
                !!outcome.commit
              );
            });
          }
        }
      }
    }
  });
}
