import { IgcAvatarComponent } from './src/components/avatar/avatar.js';
import { IgcBadgeComponent } from './src/components/badge/badge.js';
import { IgcButtonComponent } from './src/components/button/button.js';
import { IgcLinkButtonComponent } from './src/components/button/link-button.js';
import { IgcRadioComponent } from './src/components/radio/radio.js';
import { IgniteuiWebcomponents } from './src/IgniteuiWebcomponents.js';

window.customElements.define('igniteui-webcomponents', IgniteuiWebcomponents);
window.customElements.define('igc-avatar', IgcAvatarComponent);
window.customElements.define('igc-badge', IgcBadgeComponent);
window.customElements.define('igc-button', IgcButtonComponent);
window.customElements.define('igc-link-button', IgcLinkButtonComponent);
window.customElements.define('igc-radio', IgcRadioComponent);
