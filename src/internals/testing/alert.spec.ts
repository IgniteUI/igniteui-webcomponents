import { expect, fixture, html, nextFrame } from '@open-wc/testing';
import { type SinonFakeTimers, spy, useFakeTimers } from 'sinon';
import type { IgcBaseAlertLikeComponent } from '../bases/alert.js';
import { isPopoverOpen } from '../utils/dom.js';
import { simulatePointerEnter, simulatePointerLeave } from './simulate.spec.js';

/** Renders `count` components in a container with the given inline style. */
async function createAlerts(tagName: string, style = '', count = 1) {
  const container = await fixture<HTMLElement>(
    html`<div style=${style}></div>`
  );
  const alerts = Array.from({ length: count }, (_, i) => {
    const alert = document.createElement(tagName) as IgcBaseAlertLikeComponent;
    alert.textContent = `Message ${i + 1}`;
    return container.appendChild(alert);
  });

  await Promise.all(alerts.map((alert) => alert.updateComplete));
  return { container, alerts };
}

/** Returns whether `inner` is inside `outer`, in the bottom half of it. */
function isAtBottomOf(inner: Element, outer: Element): boolean {
  const a = inner.getBoundingClientRect();
  const b = outer.getBoundingClientRect();

  return (
    a.left > b.left &&
    a.right < b.right &&
    a.top > b.top + b.height / 2 &&
    a.bottom <= b.bottom
  );
}

/**
 * Tests the display time and the `container` positioning that the toast and
 * the snackbar share through `IgcBaseAlertLikeComponent`.
 */
export function runAlertTests(tagName: string): void {
  describe('Alert behavior', () => {
    let alert: IgcBaseAlertLikeComponent;
    let clock: SinonFakeTimers;

    describe('display time', () => {
      beforeEach(async () => {
        clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        ({
          alerts: [alert],
        } = await createAlerts(tagName));
        alert.displayTime = 400;
      });

      afterEach(() => {
        clock.restore();
      });

      it('`show()` on an open component starts the display time again', async () => {
        const hide = spy(alert, 'hide');
        await alert.show();

        await clock.tickAsync(300);
        expect(await alert.show()).to.be.false;

        await clock.tickAsync(300);
        expect(hide).not.called;

        await clock.tickAsync(100);
        expect(hide).calledOnce;
      });

      it('waits while the pointer is in the component', async () => {
        const hide = spy(alert, 'hide');
        await alert.show();

        simulatePointerEnter(alert);
        await clock.tickAsync(800);
        expect(hide).not.called;

        simulatePointerLeave(alert);
        await clock.tickAsync(399);
        expect(hide).not.called;

        await clock.tickAsync(1);
        expect(hide).calledOnce;
      });

      it('runs again after a close while the pointer is in the component', async () => {
        await alert.show();
        simulatePointerEnter(alert);

        await alert.hide();
        const hide = spy(alert, 'hide');
        await alert.show();

        await clock.tickAsync(400);
        expect(hide).calledOnce;
      });

      it('shows again with a full display time after a move while the pointer is in it', async () => {
        await alert.show();
        simulatePointerEnter(alert);

        const hide = spy(alert, 'hide');
        const { container } = await createAlerts(tagName);
        container.append(alert);
        await alert.updateComplete;
        expect(isPopoverOpen(alert)).to.be.true;

        await clock.tickAsync(399);
        expect(hide).not.called;

        await clock.tickAsync(1);
        expect(hide).calledOnce;
      });

      it('waits while a component removed during the fade-in is detached', async () => {
        const hide = spy(alert, 'hide');
        const parent = alert.parentElement!;
        const showing = alert.show();
        alert.remove();
        await showing;

        await clock.tickAsync(800);
        expect(hide).not.called;

        parent.append(alert);
        await alert.updateComplete;
        expect(isPopoverOpen(alert)).to.be.true;

        await clock.tickAsync(400);
        expect(hide).calledOnce;
      });
    });

    describe('fade-out', () => {
      beforeEach(async () => {
        clock = useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        ({
          alerts: [alert],
        } = await createAlerts(tagName));
        alert.displayTime = 400;
        await alert.show();
      });

      afterEach(() => {
        clock.restore();
      });

      it('`show()` keeps the component open and starts the display time again', async () => {
        const hiding = alert.hide();
        expect(await alert.show()).to.be.true;
        expect(await hiding).to.be.false;
        expect(alert.open).to.be.true;
        expect(isPopoverOpen(alert)).to.be.true;

        const hide = spy(alert, 'hide');
        await clock.tickAsync(399);
        expect(hide).not.called;

        await clock.tickAsync(1);
        expect(hide).calledOnce;
      });

      it('`toggle()` keeps the component open', async () => {
        const hiding = alert.hide();
        expect(await alert.toggle()).to.be.true;
        expect(await hiding).to.be.false;
        expect(isPopoverOpen(alert)).to.be.true;
      });

      it('`hide()` after `show()` during the fade-out fades the component out', async () => {
        void alert.hide();
        void alert.show();
        const hiding = alert.hide();

        await nextFrame();
        await nextFrame();
        expect(isPopoverOpen(alert)).to.be.true;

        expect(await hiding).to.be.true;
        expect(isPopoverOpen(alert)).to.be.false;
      });

      it('`hide()` does not start the fade-out again', async () => {
        const hiding = alert.hide();
        expect(await alert.hide()).to.be.false;
        expect(await hiding).to.be.true;
        expect(alert.open).to.be.false;
        expect(isPopoverOpen(alert)).to.be.false;
      });
    });

    describe('container positioning', () => {
      const anchorOf = (element: HTMLElement) =>
        element.style.getPropertyValue('position-anchor');

      it('anchors to the container with an anchor name', async () => {
        const {
          container,
          alerts: [alert],
        } = await createAlerts(tagName);
        alert.positioning = 'container';
        await alert.show();

        expect(anchorOf(alert)).to.match(/^--/);
        expect(container.style.getPropertyValue('anchor-name')).to.equal(
          anchorOf(alert)
        );

        await alert.hide();

        expect(anchorOf(alert)).to.be.empty;
        expect(container.style.getPropertyValue('anchor-name')).to.be.empty;
      });

      it('shares the container with another component', async () => {
        const {
          container,
          alerts: [first, second],
        } = await createAlerts(tagName, '', 2);
        first.positioning = second.positioning = 'container';
        const anchorNames = () =>
          container.style.getPropertyValue('anchor-name');

        await Promise.all([first.show(), second.show()]);
        expect(anchorNames()).to.equal(
          `${anchorOf(first)}, ${anchorOf(second)}`
        );

        await first.hide();
        expect(anchorNames()).to.equal(anchorOf(second));

        await second.hide();
        expect(anchorNames()).to.be.empty;
      });

      it('uses a container with anchor names of its own as the source', async () => {
        const {
          container,
          alerts: [alert],
        } = await createAlerts(
          tagName,
          'anchor-name: --page; margin: 100px; height: 300px'
        );
        alert.positioning = 'container';
        await alert.show();

        expect(anchorOf(alert)).to.be.empty;
        expect(container.style.getPropertyValue('anchor-name')).to.equal(
          '--page'
        );
        expect(isAtBottomOf(alert, container)).to.be.true;
      });

      it('uses a container that gets anchor names of its own as the source', async () => {
        const { container, alerts } = await createAlerts(
          tagName,
          'margin: 100px; height: 300px',
          2
        );
        for (const alert of alerts) {
          alert.positioning = 'container';
        }
        await Promise.all(alerts.map((alert) => alert.show()));

        container.setAttribute(
          'style',
          'anchor-name: --page; margin: 100px; height: 300px'
        );
        await nextFrame();

        expect(container.style.getPropertyValue('anchor-name')).to.equal(
          '--page'
        );
        for (const alert of alerts) {
          expect(anchorOf(alert)).to.be.empty;
          expect(isPopoverOpen(alert)).to.be.true;
          expect(isAtBottomOf(alert, container)).to.be.true;
        }

        await Promise.all(alerts.map((alert) => alert.hide()));
        expect(container.style.getPropertyValue('anchor-name')).to.equal(
          '--page'
        );
      });

      it('applies the anchor again after a new `style` attribute', async () => {
        const {
          container,
          alerts: [alert],
        } = await createAlerts(tagName, 'margin: 100px; height: 300px');
        alert.positioning = 'container';
        await alert.show();
        const name = anchorOf(alert);
        expect(name).to.match(/^--/);

        container.setAttribute('style', 'margin: 100px; height: 320px');
        alert.setAttribute('style', '');
        await nextFrame();

        expect(container.style.getPropertyValue('anchor-name')).to.equal(name);
        expect(anchorOf(alert)).to.equal(name);
        expect(isAtBottomOf(alert, container)).to.be.true;
      });

      it('places the component in the container', async () => {
        const {
          container,
          alerts: [alert],
        } = await createAlerts(tagName, 'margin: 100px; height: 300px');
        alert.positioning = 'container';
        await alert.show();

        expect(isAtBottomOf(alert, container)).to.be.true;
      });

      it('uses the host as the source in a shadow root', async () => {
        const host = await fixture<HTMLElement>(
          html`<div style="margin: 100px; height: 300px"></div>`
        );
        const alert = host
          .attachShadow({ mode: 'open' })
          .appendChild(
            document.createElement(tagName) as IgcBaseAlertLikeComponent
          );
        alert.textContent = 'Message';
        alert.positioning = 'container';
        await alert.show();

        expect(anchorOf(alert)).to.be.empty;
        expect(host.style.getPropertyValue('anchor-name')).to.be.empty;
        expect(isAtBottomOf(alert, host)).to.be.true;
      });
    });
  });
}
