import { css } from 'lit';

export const expansionPanelStyles = css`
  .expansionPanel {
    font-size: 24px;
    border: 2px solid lightgray;
    border-radius: 5px;
    padding: 10px;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .igx-expansion-panel {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .igx-expansion-panel__header-inner {
    display: flex;
    align-items: center;
    padding: $panel-padding;
    cursor: pointer;

    &:focus,
    &:active {
      //background: var-get($theme, 'header-focus-background');
      outline: transparent;
    }
  }

  .igx-expansion-panel__title-wrapper {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex: 1 0 0%;
    overflow: hidden;
  }

  slot[name='subTitle'] {
    font-size: 15px;
  }
  :host {
    font-family: var(--igc-font-family);
  }
  :host([open]) [part~='content'] {
    overflow: hidden;
    padding: 15px;
    background: #f5f3f0;
  }
  :host([indicator-alignment='start']) [part~='indicator'] {
    margin-inline-end: 0.5rem;
  }
  :host([indicator-alignment='end']) [part~='indicator'] {
    order: 2;
    margin-inline-start: 0.5rem;
  }
`;
