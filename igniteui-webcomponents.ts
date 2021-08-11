import { IgcAvatarComponent } from './src/components/avatar/avatar.js';
import { IgcBadgeComponent } from './src/components/badge/badge.js';
import { IgcButtonComponent } from './src/components/button/button.js';
import { IgcFormComponent } from './src/components/form/form.js';
import { IgcLinkButtonComponent } from './src/components/button/link-button.js';
import { IgcIconComponent } from './src/components/icon/icon.js';
import { IgcRadioComponent } from './src/components/radio/radio.js';
import { IgcRadioGroupComponent } from './src/components/radio-group/radio-group.js';
import { IgniteuiWebcomponents } from './src/IgniteuiWebcomponents.js';

window.customElements.define('igniteui-webcomponents', IgniteuiWebcomponents);
window.customElements.define('igc-avatar', IgcAvatarComponent);
window.customElements.define('igc-badge', IgcBadgeComponent);
window.customElements.define('igc-button', IgcButtonComponent);
window.customElements.define('igc-form', IgcFormComponent);
window.customElements.define('igc-link-button', IgcLinkButtonComponent);
window.customElements.define('igc-icon', IgcIconComponent);
window.customElements.define('igc-radio', IgcRadioComponent);
window.customElements.define('igc-radio-group', IgcRadioGroupComponent);
