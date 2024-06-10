import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { spy } from 'sinon';

import { defineComponents } from '../common/definitions/defineComponents.js';
import IgcBannerComponent from './banner.js';

describe('Banner', () => {
  before(() => {
    defineComponents(IgcBannerComponent);
  });

  const createDefaultBanner = () => html`
    <igc-banner> You are currently offline. </igc-banner>
  `;

  const createSlottedBanner = () => html`
    <igc-banner>
      <igc-icon slot="prefix"></igc-icon>
      Build <strong>123</strong> completed!
      <div slot="actions">
        <igc-button>OK 1</igc-button>
        <igc-button>View log</igc-button>
      </div>
    </igc-banner>
  `;

  let banner: IgcBannerComponent;

  beforeEach(async () => {
    banner = await fixture<IgcBannerComponent>(createDefaultBanner());
  });

  const DIFF_OPTIONS = {
    ignoreTags: ['igc-button'],
    ignoreAttributes: ['inert'],
  };

  const BUTTON_DIFF_OPTIONS = ['variant', 'size', 'style'];

  describe('Initialization Tests', () => {
    it('passes the a11y audit', async () => {
      await expect(banner).to.be.accessible();
      await expect(banner).shadowDom.to.be.accessible();
    });

    it('is correctly initialized with its default component state', () => {
      expect(banner.open).to.be.false;
      expect(banner.dir).to.be.empty;
    });

    it('should render a default action button', () => {
      const button = banner.shadowRoot!.querySelector('igc-button');

      expect(button).not.to.be.null;
      expect(button).dom.to.equal(`<igc-button type="button">OK</igc-button>`, {
        ignoreAttributes: BUTTON_DIFF_OPTIONS,
      });
    });

    it('is correctly rendered both in shown/hidden states', async () => {
      expect(banner.open).to.be.false;

      expect(banner).dom.to.equal(
        '<igc-banner>You are currently offline.</igc-banner>'
      );
      expect(banner).shadowDom.to.equal(
        `<div part="base" inert>
          <div part="spacer">
            <div part="message">
              <div part="illustration">
                <slot name="prefix"></slot>
              </div>
              <div part="content">
                <slot></slot>
              </div>
            </div>
            <div part="actions">
              <slot name="actions">
                <igc-button type="button">OK</igc-button>
              </slot>
            </div>
          </div>
        </div>`,
        {
          ignoreAttributes: BUTTON_DIFF_OPTIONS,
        }
      );

      banner.show();
      await elementUpdated(banner);

      expect(banner).dom.to.equal(
        '<igc-banner open>You are currently offline.</igc-banner>'
      );
      expect(banner).shadowDom.to.equal(
        `<div part="base">
          <div part="spacer">
            <div part="message">
              <div part="illustration">
                <slot name="prefix"></slot>
              </div>
              <div part="content">
                <slot></slot>
              </div>
            </div>
            <div part="actions">
              <slot name="actions">
                <igc-button type="button">OK</igc-button>
              </slot>
            </div>
          </div>
        </div>`,
        {
          ignoreAttributes: BUTTON_DIFF_OPTIONS,
        }
      );
    });

    it('should correctly render slotted content', async () => {
      banner = await fixture<IgcBannerComponent>(createSlottedBanner());

      const prefix = banner.querySelector('igc-icon');
      const actions = banner.querySelector('div');

      expect(prefix).not.to.be.null;
      expect(actions).not.to.be.null;

      expect(actions?.children[0]).dom.to.equal(
        '<igc-button>OK 1</igc-button>',
        {
          ignoreAttributes: [...BUTTON_DIFF_OPTIONS, 'type'],
        }
      );

      expect(actions?.children[1]).dom.to.equal(
        '<igc-button>View log</igc-button>',
        {
          ignoreAttributes: [...BUTTON_DIFF_OPTIONS, 'type'],
        }
      );
    });
  });

  describe('Methods` Tests', () => {
    it('calls `show` method successfully', async () => {
      expect(banner.open).to.be.false;

      banner.show();
      await elementUpdated(banner);

      expect(banner.open).to.be.true;
      expect(banner).dom.to.equal(
        '<igc-banner open>You are currently offline.</igc-banner>',
        DIFF_OPTIONS
      );
    });

    it('calls `hide` method successfully', async () => {
      expect(banner.open).to.be.false;

      banner.open = true;
      await elementUpdated(banner);

      expect(banner).dom.to.equal(
        '<igc-banner open>You are currently offline.</igc-banner>',
        DIFF_OPTIONS
      );

      banner.hide();
      await elementUpdated(banner);

      expect(banner.open).to.be.false;
      expect(banner).dom.to.equal(
        '<igc-banner>You are currently offline.</igc-banner>',
        DIFF_OPTIONS
      );
    });

    it('calls `toggle` method successfully', async () => {
      expect(banner.open).to.be.false;

      banner.toggle();
      await elementUpdated(banner);

      expect(banner.open).to.be.true;
      expect(banner).dom.to.equal(
        '<igc-banner open>You are currently offline.</igc-banner>',
        DIFF_OPTIONS
      );

      banner.toggle();
      await elementUpdated(banner);

      expect(banner.open).to.be.false;
      expect(banner).dom.to.equal(
        '<igc-banner>You are currently offline.</igc-banner>',
        DIFF_OPTIONS
      );
    });
  });

  describe('Action Tests', () => {
    it('should close the banner when clicking the default button', async () => {
      expect(banner.open).to.be.false;

      banner.show();
      await elementUpdated(banner);

      expect(banner.open).to.be.true;

      const button = banner.shadowRoot!.querySelector('igc-button');

      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(banner);

      expect(banner.open).to.be.false;
    });

    it('should emit correct event sequence for the default action button', async () => {
      const eventSpy = spy(banner, 'emitEvent');

      expect(banner.open).to.be.false;

      banner.show();
      await elementUpdated(banner);

      expect(banner.open).to.be.true;

      const button = banner.shadowRoot!.querySelector('igc-button');

      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(banner);

      expect(eventSpy.callCount).to.equal(2);
      expect(eventSpy.firstCall).calledWith('igcClosing', {
        cancelable: true,
      });
      expect(eventSpy.secondCall).calledWith('igcClosed');
      expect(banner.open).to.be.false;
    });

    it('can cancel `igcClosing` event', async () => {
      const eventSpy = spy(banner, 'emitEvent');
      const button = banner.shadowRoot!.querySelector('igc-button');

      banner.addEventListener('igcClosing', (event) => {
        event.preventDefault();
      });

      banner.show();
      await elementUpdated(banner);

      expect(banner.open).to.be.true;

      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await elementUpdated(banner);

      expect(eventSpy).calledWith('igcClosing');
      expect(eventSpy).not.calledWith('igcClosed');
      expect(banner.open).to.be.true;
    });
  });
});
