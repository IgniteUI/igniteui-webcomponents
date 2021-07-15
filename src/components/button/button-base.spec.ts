import {
  elementUpdated,
  expect,
  fixture,
  html,
  oneEvent,
} from '@open-wc/testing';
import '../../../igniteui-webcomponents'; // Obligatory
import { IgcButtonBaseComponent } from './button-base';
import { IgcButtonComponent } from './button';

const DIFF_OPTIONS = { ignoreChildren: ['button'], ignoreAttributes: ['part'] };
export const DEFAULT_CLASSES = 'native';
export const classValue = (changeableValue: string) => {
  return `${changeableValue} ${DEFAULT_CLASSES}`;
};

describe('ButtonBase component', () => {
  let el: IgcButtonBaseComponent;
  beforeEach(async () => {
    el = await fixture<IgcButtonComponent>(html`<igc-button />`);
  });

  it('is created with the proper default values', async () => {
    expect(el.disabled).to.equal(false);
    expect(el.variant).to.equal('flat');
    expect(el.dir).to.equal('');

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large flat`)}"/>`,
      DIFF_OPTIONS
    );
  });

  it('changes size property values successfully', async () => {
    el.size = 'medium';
    expect(el.size).to.equal('medium');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`medium flat`)}"/>`,
      DIFF_OPTIONS
    );

    el.size = 'small';
    expect(el.size).to.equal('small');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`small flat`)}"/>`,
      DIFF_OPTIONS
    );

    el.size = 'large';
    expect(el.size).to.equal('large');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large flat`)}"/>`,
      DIFF_OPTIONS
    );
  });

  it('sets disabled property successfully', async () => {
    el.disabled = true;
    expect(el.disabled).to.be.true;
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`disabled large flat`)}" disabled/>`,
      DIFF_OPTIONS
    );

    el.disabled = false;
    expect(el.disabled).to.be.false;
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large flat`)}"/>`,
      DIFF_OPTIONS
    );
  });

  it('sets variant property successfully', async () => {
    el.variant = 'raised';
    expect(el.variant).to.equal('raised');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large raised`)}"/>`,
      DIFF_OPTIONS
    );

    el.variant = 'outlined';
    expect(el.variant).to.equal('outlined');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large outlined`)}"/>`,
      DIFF_OPTIONS
    );

    el.variant = 'fab';
    expect(el.variant).to.equal('fab');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large fab`)}"/>`,
      DIFF_OPTIONS
    );

    el.variant = 'flat';
    expect(el.variant).to.equal('flat');
    await elementUpdated(el);

    expect(el).shadowDom.to.equal(
      `<button class="${classValue(`large flat`)}"/>`,
      DIFF_OPTIONS
    );
  });

  it.only('should focus/blur the wrapped native element when the methods are called', async () => {
    const igcFocus = oneEvent(el, 'igcFocus');
    el.focus();
    const focusPayload = await igcFocus;

    const btn = el.shadowRoot?.children[0];
    expect(el.shadowRoot?.activeElement).to.equal(btn);
    expect(focusPayload.detail).not.to.be.null;

    const igcBlur = oneEvent(el, 'igcBlur');
    el.blur();

    const blurPayload = await igcBlur;
    expect(blurPayload.detail).not.to.be.null;
    expect(el.shadowRoot?.activeElement).to.be.null;
  });
});
