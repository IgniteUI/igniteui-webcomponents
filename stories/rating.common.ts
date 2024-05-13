import { bacteria, bandage } from '@igniteui/material-icons-extended';
import { html, svg } from 'lit';

const heartSVG = svg`
<?xml version="1.0" ?>
<svg
  viewBox="0 0 24 24"
  xmlns="http://www.w3.org/2000/svg"
  width="100%"
  height="100%"
>
  <defs>
    <style>
      .cls-1 {
        fill: #da3380;
      }
      .cls-2 {
        fill: #f55fa6;
      }
      .cls-3 {
        fill: #6c2e7c;
      }
    </style>
  </defs>
  <g id="Icons">
    <path
      class="cls-1"
      d="M23,8c0,5-3,10-11,14C4,18,1,13,1,8a5.823,5.823,0,0,1,.37-2.05A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95,5.823,5.823,0,0,1,23,8Z"
    />
    <path
      class="cls-2"
      d="M22.63,5.95c-.96,3.782-3.9,7.457-9.7,10.567a1.984,1.984,0,0,1-1.864,0c-5.8-3.11-8.738-6.785-9.7-10.567A5.989,5.989,0,0,1,12,4.69,5.989,5.989,0,0,1,22.63,5.95Z"
    />
  </g>
  <g data-name="Layer 4" id="Layer_4">
    <path
      class="cls-3"
      d="M17,1a6.98,6.98,0,0,0-5,2.1A7,7,0,0,0,0,8c0,4.16,2,10.12,11.553,14.9a1,1,0,0,0,.894,0C22,18.12,24,12.16,24,8A7.008,7.008,0,0,0,17,1ZM12,20.878C5.363,17.447,2,13.116,2,8a5,5,0,0,1,9.167-2.761,1.038,1.038,0,0,0,1.666,0A5,5,0,0,1,22,8C22,13.116,18.637,17.447,12,20.878Z"
    />
  </g>
</svg>
`;

export default {
  icons: [bacteria, bandage],
  svg: heartSVG,
  emoji: ['😣', '😔', '😐', '🙂', '😆'].map(
    (each) =>
      html`<igc-rating-symbol>
        <div>${each}</div>
        <div slot="empty">${each}</div>
      </igc-rating-symbol>`
  ),
  hoverListener: (e: CustomEvent) => {
    const labels = [
      'Select a value',
      'Terrible',
      'Bad',
      'Meh',
      'Great',
      'Superb',
    ];

    document.getElementById('selection')!.textContent = `${
      labels[Math.ceil(e.detail)] ?? 'Unknown'
    }`;
  },
  renderSymbols: (items: number, renderer: () => unknown) =>
    Array.from({ length: items }, () => renderer()),
};
