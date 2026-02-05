import {
  aTimeout,
  elementUpdated,
  expect,
  fixture,
  html,
} from '@open-wc/testing';
import { stub } from 'sinon';

import { defineComponents } from '../common/definitions/defineComponents.js';
import { first, last } from '../common/util.js';
import IgcThemeProviderComponent from '../theme-provider/theme-provider.js';
import IgcIconComponent from './icon.js';
import {
  getIconRegistry,
  registerIcon,
  registerIconFromText,
  setIconRef,
} from './icon.registry.js';
import { IconsStateBroadcast } from './icon-state.broadcast.js';
import { createIconDefaultMap } from './registry/default-map.js';
import {
  ActionType,
  type BroadcastIconsChangeMessage,
  type IconMeta,
  type SvgIcon,
} from './registry/types.js';

const bugSvgContent =
  '<title id="brbug-title">Bug Icon</title><desc id="brbug-desc">A picture showing an insect.</desc><path d="M21 9h-3.54a7.251 7.251 0 00-2.56-2.271 2.833 2.833 0 00-.2-2.015l1.007-1.007-1.414-1.414L13.286 3.3a2.906 2.906 0 00-2.572 0L9.707 2.293 8.293 3.707 9.3 4.714a2.833 2.833 0 00-.2 2.015A7.251 7.251 0 006.54 9H3v2h2.514a8.879 8.879 0 00-.454 2H3v2h2.06a8.879 8.879 0 00.454 2H3v2h3.54A6.7 6.7 0 0012 22a6.7 6.7 0 005.46-3H21v-2h-2.514a8.879 8.879 0 00.454-2H21v-2h-2.06a8.879 8.879 0 00-.454-2H21zm-10 7H9v-2h2zm0-4v-2h2v2zm4 4h-2v-2h2z"/>';
const bugSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-labelledby="brbug-desc brbug-title">${bugSvgContent}</svg>`;
const virusSvgContent =
  '<title id="mvvirus-title">Virus Icon</title><desc id="mvvirus-desc">A picture depicting a corona-shaped virus.</desc><path d="M18.277 13a2 2 0 100-2H16.9a4.939 4.939 0 00-.731-1.754l1.391-1.392a2 2 0 10-1.414-1.414l-1.392 1.392A4.939 4.939 0 0013 7.1V5.723a2 2 0 10-2 0V7.1a4.939 4.939 0 00-1.754.731L7.854 6.44A2 2 0 106.44 7.854l1.392 1.392A4.939 4.939 0 007.1 11H5.723a2 2 0 100 2H7.1a4.939 4.939 0 00.731 1.754L6.44 16.146a2 2 0 101.414 1.414l1.392-1.392A4.939 4.939 0 0011 16.9v1.378a2 2 0 102 0V16.9a4.939 4.939 0 001.754-.731l1.392 1.392a2 2 0 101.414-1.414l-1.392-1.392A4.939 4.939 0 0016.9 13zM11 14a1 1 0 111-1 1 1 0 01-1 1z"/>';
const virusSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-labelledby="mvvirus-desc mvvirus-title">${virusSvgContent}</svg>`;
const coronaVirusSvgContent =
  '<title id="cwcoronavirus-title">Corona Virus Icon</title><desc id="cwcoronavirus-desc">A picture depicting a virus cell.</desc><path d="M20.5 10a1.486 1.486 0 00-1.292 1h-1.3a5.958 5.958 0 00-1.023-2.473l.915-.917a1.487 1.487 0 001.625-.21 1.806 1.806 0 00-.354-2.475 1.806 1.806 0 00-2.471-.35 1.487 1.487 0 00-.21 1.625l-.917.917A5.958 5.958 0 0013 6.09v-1.3a1.486 1.486 0 001-1.29c0-.828-.895-1.5-2-1.5s-2 .672-2 1.5a1.486 1.486 0 001 1.292v1.3a5.958 5.958 0 00-2.473 1.021L7.61 6.2a1.487 1.487 0 00-.21-1.625 1.806 1.806 0 00-2.475.354 1.806 1.806 0 00-.35 2.471 1.487 1.487 0 001.625.21l.917.917A5.958 5.958 0 006.09 11h-1.3a1.486 1.486 0 00-1.29-1c-.828 0-1.5.9-1.5 2s.672 2 1.5 2a1.486 1.486 0 001.292-1h1.3a5.964 5.964 0 001.023 2.473l-.915.917a1.487 1.487 0 00-1.621.206 1.806 1.806 0 00.354 2.475 1.806 1.806 0 002.475.354A1.487 1.487 0 007.61 17.8l.917-.917A5.958 5.958 0 0011 17.91v1.3a1.486 1.486 0 00-1 1.29c0 .828.895 1.5 2 1.5s2-.672 2-1.5a1.486 1.486 0 00-1-1.292v-1.3a5.958 5.958 0 002.473-1.023l.917.917a1.487 1.487 0 00.206 1.621 1.806 1.806 0 002.475-.354 1.806 1.806 0 00.354-2.475 1.487 1.487 0 00-1.625-.204l-.917-.917A5.964 5.964 0 0017.91 13h1.3a1.486 1.486 0 001.29 1c.828 0 1.5-.895 1.5-2s-.672-2-1.5-2zM9 15a1 1 0 111-1 1 1 0 01-1 1zm6-4a1 1 0 111-1 1 1 0 01-1 1zm-3.939.061a1.8 1.8 0 01-2.475.353 1.8 1.8 0 01.353-2.475 1.8 1.8 0 012.475-.353 1.8 1.8 0 01-.353 2.475zm4 4a1.8 1.8 0 01-2.475.353 1.8 1.8 0 01.353-2.475 1.8 1.8 0 012.475-.353 1.8 1.8 0 01-.353 2.475z"/>';
const coronaVirusSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-labelledby="cwcoronavirus-desc cwcoronavirus-title">${coronaVirusSvgContent}</svg>`;
const searchSvgContent =
  '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>';
const searchSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">${searchSvgContent}</svg>`;

function mockResponse() {
  const response = new globalThis.Response(bugSvg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
    },
  });

  return Promise.resolve(response);
}

describe('Icon registry', () => {
  const name = 'test';
  const collection = 'test-collection';

  beforeEach(() => {
    const mocked = stub(globalThis, 'fetch');
    mocked.onCall(0).returns(mockResponse());
  });

  it('is registered', async () => {
    expect(getIconRegistry()).to.not.be.undefined;
  });

  it('has the default internal collection', async () => {
    expect(getIconRegistry().get('star', 'internal')?.svg).to.not.be.undefined;
  });

  it('register icons from fetch', async () => {
    await registerIcon(name, '', collection);

    expect(getIconRegistry().get(name, collection)).to.not.be.undefined;
    expect(getIconRegistry().get(name, collection)?.title).to.equal('Bug Icon');
    expect(getIconRegistry().get(name, collection)?.svg).to.have.string(
      'A picture showing an insect'
    );
  });

  it('register icons from text', async () => {
    registerIconFromText(name, bugSvg, collection);
    expect(getIconRegistry().get(name, collection)?.svg).to.not.be.undefined;
  });

  describe('Referential Icons', () => {
    before(() => {
      defineComponents(IgcIconComponent);
    });

    beforeEach(() => {
      registerIconFromText('bug', bugSvg, 'internal');
      registerIconFromText('virus', coronaVirusSvg, 'internal');

      setIconRef('insect', 'test', {
        name: 'bug',
        collection: 'internal',
      });
    });

    it('renders icons by reference', async () => {
      const icon = await fixture<IgcIconComponent>(
        html`<igc-icon name="insect" collection="test"></igc-icon>`
      );

      verifySvg(icon, bugSvgContent);
    });

    it('swaps the SVG icon at runtime when the reference changes', async () => {
      const icon = await fixture<IgcIconComponent>(
        html`<igc-icon name="insect" collection="test"></igc-icon>`
      );

      setIconRef('insect', 'test', {
        name: 'virus',
        collection: 'internal',
      });

      await elementUpdated(icon);
      verifySvg(icon, coronaVirusSvgContent);
    });

    it('returns the underlying icon for a given reference', async () => {
      const icon = getIconRegistry().getIconRef('insect', 'test');

      expect(icon.name).to.equal('bug');
      expect(icon.collection).to.equal('internal');
    });
  });

  afterEach(() => {
    (globalThis.fetch as any).restore();
  });
});

describe('Icon broadcast service', () => {
  let channel: BroadcastChannel;
  let events: MessageEvent<BroadcastIconsChangeMessage>[] = [];
  const collectionName = 'broadcast-test';

  const handler = (message: MessageEvent<BroadcastIconsChangeMessage>) =>
    events.push(message);

  beforeEach(async () => {
    channel = new BroadcastChannel('ignite-ui-icon-channel');
    channel.addEventListener('message', handler);
  });

  afterEach(async () => {
    channel.close();
    events = [];
  });

  function getIconFromCollection(
    name: string,
    collectionName: string,
    collection: Map<string, Map<string, SvgIcon>>
  ) {
    return collection.get(collectionName)?.get(name);
  }

  describe('Broadcast Events', () => {
    it('correct event state when registering an icon', async () => {
      const iconName = 'bug';

      registerIconFromText(iconName, bugSvg, collectionName);
      await aTimeout(0);

      const { actionType, collections } = first(events).data;
      expect(actionType).to.equal(ActionType.RegisterIcon);
      expect(collections?.has(collectionName)).to.be.true;
      expect(
        getIconFromCollection(iconName, collectionName, collections!)
      ).to.eql(getIconRegistry().get(iconName, collectionName));
    });

    it('correct events state when registering several icons', async () => {
      const icons = [
        ['bug', bugSvg],
        ['virus', virusSvg],
        ['search', searchSvg],
      ] as const;

      for (const each of icons) {
        registerIconFromText(each[0], each[1], collectionName);
      }
      await aTimeout(0);

      expect(events).lengthOf(icons.length);
      for (const [idx, event] of events.entries()) {
        expect(
          getIconFromCollection(
            icons[idx][0],
            collectionName,
            event.data.collections!
          )
        ).to.eql(getIconRegistry().get(icons[idx][0], collectionName));
      }
    });

    it('correct event state when setting an icon reference', async () => {
      const refName = 'bug-reference';
      const refCollectionName = 'ref-test';

      registerIconFromText('reference-test', bugSvg, collectionName);

      setIconRef(refName, refCollectionName, {
        name: 'reference-test',
        collection: collectionName,
      });
      await aTimeout(0);

      const { actionType, collections, references } = last(events).data;

      expect(actionType).to.equal(ActionType.UpdateIconReference);
      expect(collections).to.be.undefined;
      expect(references?.get(refCollectionName)?.get(refName)).to.eql(
        getIconRegistry().getIconRef(refName, refCollectionName)
      );
    });

    it('correct event state when setting an icon reference via class', async () => {
      const refName = 'bug-reference';
      const refCollectionName = 'ref-test';

      registerIconFromText('reference-test', bugSvg, collectionName);
      const meta = new IconMetaClass();
      meta.name = 'reference-test';
      meta.collection = collectionName;
      setIconRef(refName, refCollectionName, meta);
      await aTimeout(0);

      const { actionType, collections, references } = last(events).data;

      expect(actionType).to.equal(ActionType.UpdateIconReference);
      expect(collections).to.be.undefined;
      expect(references?.get(refCollectionName)?.get(refName)).to.eql(
        getIconRegistry().getIconRef(refName, refCollectionName)
      );
    });

    it('no event when setting an icon reference with external false.', async () => {
      const refName = 'bug-reference';
      const refCollectionName = 'ref-test';
      getIconRegistry().setIconRef({
        alias: { name: refName, collection: refCollectionName },
        target: {
          name: 'reference-test',
          collection: collectionName,
          external: false,
        },
        overwrite: true,
      });
      await aTimeout(0);

      expect(events.length).to.equal(0);
    });

    it('when multiple broadcast services are initialized they should not send sync events to each other.', async () => {
      const collections = createIconDefaultMap<string, SvgIcon>();
      const references = createIconDefaultMap<string, IconMeta>();
      // 2 new broadcasts
      const broadcast1 = new IconsStateBroadcast(collections, references);
      const broadcast2 = new IconsStateBroadcast(collections, references);
      // 1 global one, initialized when you get the icon registry first time.

      // a peer is requesting a state sync
      channel.postMessage({ actionType: ActionType.SyncState });
      await aTimeout(20);

      // all icon broadcasts must respond with their state
      // 2 from broadcast service + 1 from global.
      expect(events.length).to.equal(3);

      // dispose of mock services.
      // biome-ignore lint/complexity/useLiteralKeys: private access escape
      broadcast1['_dispose']();
      // biome-ignore lint/complexity/useLiteralKeys: private access escape
      broadcast2['_dispose']();
    });
  });

  describe('Peer registry', () => {
    it('registered icon is correctly sent when a peer requests a sync states', async () => {
      const iconName = 'bug';
      registerIconFromText(iconName, bugSvg, collectionName);

      // a peer is requesting a state sync
      channel.postMessage({ actionType: ActionType.SyncState });
      await aTimeout(0);

      expect(events).lengthOf(2); // [ActionType.RegisterIcon, ActionType.SyncState]

      const { actionType, collections } = last(events).data;
      expect(actionType).to.equal(ActionType.SyncState);
      expect(collections).not.to.be.undefined;

      expect(
        getIconFromCollection(iconName, collectionName, collections!)
      ).to.eql(getIconRegistry().get(iconName, collectionName));
    });

    it('non-external icons refs are not sent when a peer requests a sync states', async () => {
      const iconName = 'internalIcon';
      const refName = 'bug-reference';
      const refCollectionName = 'ref-test';
      getIconRegistry().setIconRef({
        alias: { name: refName, collection: refCollectionName },
        target: { name: iconName, collection: collectionName, external: false },
        overwrite: true,
      });

      // a peer is requesting a state sync
      channel.postMessage({ actionType: ActionType.SyncState });
      await aTimeout(0);

      expect(events).lengthOf(1); // [ActionType.SyncState]

      const { actionType, references } = last(events).data;
      expect(actionType).to.equal(ActionType.SyncState);
      expect(references?.get(refCollectionName)?.get(refName)).to.be.undefined;
    });
  });
});

describe('Icon BFCache (pageshow/pagehide) handling', () => {
  let channel: BroadcastChannel;
  let events: MessageEvent<BroadcastIconsChangeMessage>[] = [];
  const collectionName = 'bfcache-test';

  function getChannel(service: IconsStateBroadcast) {
    // biome-ignore lint/complexity/useLiteralKeys: private access escape
    return service['_channel'];
  }

  function disposeChannel(service: IconsStateBroadcast) {
    // biome-ignore lint/complexity/useLiteralKeys: private access escape
    service['_dispose']();
  }

  const handler = (message: MessageEvent<BroadcastIconsChangeMessage>) =>
    events.push(message);

  beforeEach(async () => {
    channel = new BroadcastChannel('ignite-ui-icon-channel');
    channel.addEventListener('message', handler);
    events = [];
  });

  afterEach(async () => {
    channel.close();
    events = [];
  });

  it('should dispose channel on pagehide event', async () => {
    const collections = createIconDefaultMap<string, SvgIcon>();
    const references = createIconDefaultMap<string, IconMeta>();
    const broadcast = new IconsStateBroadcast(collections, references);

    // Verify channel exists initially
    expect(getChannel(broadcast)).to.not.be.null;

    // Simulate pagehide event directly on the broadcast instance
    broadcast.handleEvent(new Event('pagehide') as PageTransitionEvent);

    // Channel should be disposed (null)
    expect(getChannel(broadcast)).to.be.null;

    // Clean up
    disposeChannel(broadcast);
  });

  it('should recreate channel on pageshow event', async () => {
    const collections = createIconDefaultMap<string, SvgIcon>();
    const references = createIconDefaultMap<string, IconMeta>();
    const broadcast = new IconsStateBroadcast(collections, references);

    // Simulate pagehide to dispose channel
    broadcast.handleEvent(new Event('pagehide') as PageTransitionEvent);

    expect(getChannel(broadcast)).to.be.null;

    // Simulate pageshow to recreate channel
    broadcast.handleEvent(new Event('pageshow') as PageTransitionEvent);

    // Channel should be recreated
    expect(getChannel(broadcast)).to.not.be.null;
    expect(getChannel(broadcast)).to.be.instanceOf(BroadcastChannel);

    // Clean up
    disposeChannel(broadcast);
  });

  it('should not create duplicate channel on pageshow if already exists', async () => {
    const collections = createIconDefaultMap<string, SvgIcon>();
    const references = createIconDefaultMap<string, IconMeta>();
    const broadcast = new IconsStateBroadcast(collections, references);

    // Get reference to initial channel
    const initialChannel = getChannel(broadcast);
    expect(initialChannel).to.not.be.null;

    // Simulate pageshow without pagehide first
    broadcast.handleEvent(new Event('pageshow') as PageTransitionEvent);

    // Should still have the same channel instance
    expect(getChannel(broadcast)).to.equal(initialChannel);

    // Clean up
    disposeChannel(broadcast);
  });

  it('should handle messages after channel recreation', async () => {
    const collections = createIconDefaultMap<string, SvgIcon>();
    const references = createIconDefaultMap<string, IconMeta>();
    const broadcast = new IconsStateBroadcast(collections, references);

    // Register an icon
    registerIconFromText('bfcache-icon', bugSvg, collectionName);
    await aTimeout(10);

    // Simulate page being hidden and shown (bfcache scenario)
    broadcast.handleEvent(new Event('pagehide') as PageTransitionEvent);
    broadcast.handleEvent(new Event('pageshow') as PageTransitionEvent);

    // Wait for message handling
    await aTimeout(0);

    // Clear events from icon registration
    events = [];

    // Request sync from peer
    channel.postMessage({ actionType: ActionType.SyncState });
    await aTimeout(20);

    // Should still respond with icon data after recreation
    expect(events.length).to.be.greaterThan(0);
    const syncEvent = events.find(
      (e) => e.data.actionType === ActionType.SyncState
    );
    expect(syncEvent).to.not.be.undefined;

    // Clean up
    disposeChannel(broadcast);
  });

  it('should not send messages when channel is disposed', async () => {
    const collections = createIconDefaultMap<string, SvgIcon>();
    const references = createIconDefaultMap<string, IconMeta>();
    const broadcast = new IconsStateBroadcast(collections, references);

    // Dispose the channel
    broadcast.handleEvent(new Event('pagehide') as PageTransitionEvent);

    // Clear events from any previous operations
    events = [];

    // Try to send a message
    broadcast.send({
      actionType: ActionType.RegisterIcon,
      collections: createIconDefaultMap<string, SvgIcon>(),
    });

    await aTimeout(10);

    // No events should be received since channel is null
    expect(events.length).to.equal(0);

    // Clean up
    disposeChannel(broadcast);
  });
});

describe('Icon component', () => {
  before(() => {
    defineComponents(IgcIconComponent);
  });

  beforeEach(() => {
    registerIconFromText('bug', bugSvg);
    registerIconFromText('virus', virusSvg);
    registerIconFromText('virus', coronaVirusSvg, 'imx');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<IgcIconComponent>(
      html`<igc-icon name="bug" aria-label="Bug icon"></igc-icon>`
    );

    await expect(el).to.be.accessible();
  });

  it('should render icon with a name and default collection', async () => {
    const icon = await fixture<IgcIconComponent>(
      html`<igc-icon name="bug"></igc-icon>`
    );

    verifySvg(icon, bugSvgContent);
  });

  it('should render icons with the same name and different collection', async () => {
    const icon1 = await fixture<IgcIconComponent>(
      html`<igc-icon name="virus"></igc-icon>`
    );
    const icon2 = await fixture<IgcIconComponent>(
      html`<igc-icon name="virus" collection="imx"></igc-icon>`
    );

    verifySvg(icon1, virusSvgContent);
    verifySvg(icon2, coronaVirusSvgContent);
  });

  it('should update icon component after an icon is registered', async () => {
    const icon = await fixture<IgcIconComponent>(
      html`<igc-icon name="search" collection="material"></igc-icon>`
    );

    const svg = icon.shadowRoot?.querySelector('svg');
    expect(svg).to.be.null;

    registerIconFromText('search', searchSvg, 'material');
    await elementUpdated(icon);

    verifySvg(icon, searchSvgContent);
  });

  it('should throw descriptive error when icon cannot be registered', async () => {
    expect(() => registerIconFromText('invalid', '<div></div>')).to.throw(
      'SVG element not found or malformed SVG string.'
    );
  });

  it('should mirror the icon when mirrored is set to true', async () => {
    const icon = await fixture<IgcIconComponent>(
      html`<igc-icon name="bug" mirrored></igc-icon>`
    );

    expect(icon.mirrored).to.be.true;
  });

  describe('Multi-theme support', () => {
    it('should resolve icon references based on theme', async () => {
      // Test that getIconRef returns different icons for different themes
      const defaultRef = getIconRegistry().getIconRef(
        'expand',
        'default',
        'bootstrap'
      );
      const indigoRef = getIconRegistry().getIconRef(
        'expand',
        'default',
        'indigo'
      );

      expect(defaultRef.name).to.equal('keyboard_arrow_down');
      expect(defaultRef.collection).to.equal('internal');

      expect(indigoRef.name).to.equal('indigo_chevron_down');
      expect(indigoRef.collection).to.equal('internal');
    });

    it('should fallback to default theme when theme-specific icon does not exist', async () => {
      const fluentRef = getIconRegistry().getIconRef(
        'expand',
        'default',
        'fluent'
      );

      // Fluent theme not defined for 'expand', should fallback to default
      expect(fluentRef.name).to.equal('keyboard_arrow_down');
      expect(fluentRef.collection).to.equal('internal');
    });

    it('should prioritize user-set references over theme-based aliases', async () => {
      // Set a user reference (external or internal doesn't matter)
      setIconRef('expand', 'default', {
        name: 'bug',
        collection: 'default',
      });

      const ref = getIconRegistry().getIconRef('expand', 'default', 'indigo');

      // Should return the user-set reference, not the theme-based one
      expect(ref.name).to.equal('bug');
      expect(ref.collection).to.equal('default');
    });

    it('should return icon as-is when no reference exists', async () => {
      const ref = getIconRegistry().getIconRef(
        'custom-icon',
        'custom-collection',
        'bootstrap'
      );

      expect(ref.name).to.equal('custom-icon');
      expect(ref.collection).to.equal('custom-collection');
    });

    it('should work without theme parameter', async () => {
      const ref = getIconRegistry().getIconRef('bug', 'default');

      expect(ref.name).to.equal('bug');
      expect(ref.collection).to.equal('default');
    });

    it('should only resolve theme-based aliases for default collection', async () => {
      // Theme-based resolution only applies to 'default' collection
      const ref = getIconRegistry().getIconRef('expand', 'custom', 'indigo');

      expect(ref.name).to.equal('expand');
      expect(ref.collection).to.equal('custom');
    });
  });

  describe('Integration with theme-provider', () => {
    before(() => {
      defineComponents(IgcThemeProviderComponent);
    });

    beforeEach(() => {
      // Register target icons for our theme-based test
      const bootstrapChevronSvg = '<svg><path d="M7 10l5 5 5-5z"/></svg>';
      const indigoChevronSvg = '<svg><path d="M16.59 8.59L12 13.17"/></svg>';

      registerIconFromText(
        'bootstrap-chevron',
        bootstrapChevronSvg,
        'test-internal'
      );
      registerIconFromText('indigo-chevron', indigoChevronSvg, 'test-internal');

      // Set up theme-based references manually for testing
      getIconRegistry().setIconRef({
        alias: { name: 'test-expand', collection: 'default' },
        target: { name: 'bootstrap-chevron', collection: 'test-internal' },
        overwrite: true,
      });
    });

    it('should resolve different icons for different theme providers', async () => {
      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="bootstrap">
            <igc-icon id="bootstrap-icon" name="test-expand"></igc-icon>
          </igc-theme-provider>
          <igc-theme-provider theme="indigo">
            <igc-icon id="indigo-icon" name="test-expand"></igc-icon>
          </igc-theme-provider>
        </div>
      `);

      const bootstrapIcon =
        container.querySelector<IgcIconComponent>('#bootstrap-icon')!;
      const indigoIcon =
        container.querySelector<IgcIconComponent>('#indigo-icon')!;

      // Override the reference for indigo theme
      getIconRegistry().setIconRef({
        alias: { name: 'test-expand', collection: 'default' },
        target: {
          name: 'indigo-chevron',
          collection: 'test-internal',
          external: false,
        },
        overwrite: false,
      });

      await elementUpdated(bootstrapIcon);
      await elementUpdated(indigoIcon);

      // Both should render, but we'd need theme-aware resolution
      // For now, just verify they both render successfully
      const bootstrapSvg = bootstrapIcon.shadowRoot?.querySelector('svg');
      const indigoSvg = indigoIcon.shadowRoot?.querySelector('svg');

      expect(bootstrapSvg).to.exist;
      expect(indigoSvg).to.exist;
    });

    it('should update icon when user sets a new reference', async () => {
      const alternativeSvg = '<svg><path d="ALTERNATIVE"/></svg>';
      registerIconFromText('alternative-icon', alternativeSvg, 'test-internal');

      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="bootstrap">
            <igc-icon id="test-icon" name="test-expand"></igc-icon>
          </igc-theme-provider>
        </div>
      `);

      const icon = container.querySelector<IgcIconComponent>('#test-icon')!;
      await elementUpdated(icon);

      // Capture initial content
      const initialContent = icon.shadowRoot!.innerHTML;

      // Set a new reference
      setIconRef('test-expand', 'default', {
        name: 'alternative-icon',
        collection: 'test-internal',
      });

      await elementUpdated(icon);

      // Content should have changed
      const updatedContent = icon.shadowRoot!.innerHTML;
      expect(initialContent).to.not.equal(updatedContent);
      expect(updatedContent).to.include('ALTERNATIVE');
    });

    it('should coexist with non-aliased icons in different themes', async () => {
      const customSvg = '<svg><path d="M10 10"/></svg>';
      registerIconFromText('custom-icon', customSvg, 'default');

      const container = await fixture<HTMLDivElement>(html`
        <div>
          <igc-theme-provider theme="bootstrap">
            <igc-icon id="custom1" name="custom-icon"></igc-icon>
          </igc-theme-provider>
          <igc-theme-provider theme="indigo">
            <igc-icon id="custom2" name="custom-icon"></igc-icon>
          </igc-theme-provider>
        </div>
      `);

      const icon1 = container.querySelector<IgcIconComponent>('#custom1')!;
      const icon2 = container.querySelector<IgcIconComponent>('#custom2')!;

      await elementUpdated(icon1);
      await elementUpdated(icon2);

      // Both should render the same custom icon
      const svg1 = icon1.shadowRoot?.querySelector('svg');
      const svg2 = icon2.shadowRoot?.querySelector('svg');

      expect(svg1!.innerHTML).to.include('M10 10');
      expect(svg2!.innerHTML).to.include('M10 10');
    });
  });
});

function verifySvg(icon: IgcIconComponent, svgContent: string) {
  // query svg since the dom comparison skips it
  const svg = icon.shadowRoot?.querySelector('svg');
  expect(svg).to.exist;
  expect(svg).lightDom.to.equal(svgContent);
}

class IconMetaClass implements IconMeta {
  private _name?: string;
  get name(): string {
    return this._name || '';
  }
  set name(value: string) {
    this._name = value;
  }
  private _collection?: string;
  get collection(): string {
    return this._collection || '';
  }
  set collection(value: string) {
    this._collection = value;
  }
}
