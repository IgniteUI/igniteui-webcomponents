// Components
export { default as IgcAvatarComponent } from './components/avatar/avatar.js';
export { default as IgcBadgeComponent } from './components/badge/badge.js';
export { default as IgcButtonComponent } from './components/button/button.js';
export { default as IgcCalendarComponent } from './components/calendar/calendar.js';
export { default as IgcCardComponent } from './components/card/card.js';
export { default as IgcCardActionsComponent } from './components/card/card.actions.js';
export { default as IgcCardContentComponent } from './components/card/card.content.js';
export { default as IgcCardHeaderComponent } from './components/card/card.header.js';
export { default as IgcCardMediaComponent } from './components/card/card.media.js';
export { default as IgcCheckboxComponent } from './components/checkbox/checkbox.js';
export { default as IgcCircularProgressComponent } from './components/progress/circular-progress.js';
export { default as IgcCircularGradientComponent } from './components/progress/circular-gradient.js';
export { default as IgcChipComponent } from './components/chip/chip.js';
export { default as IgcDropdownComponent } from './components/dropdown/dropdown.js';
export { default as IgcDropdownGroupComponent } from './components/dropdown/dropdown-group.js';
export { default as IgcDropdownHeaderComponent } from './components/dropdown/dropdown-header.js';
export { default as IgcDropdownItemComponent } from './components/dropdown/dropdown-item.js';
export { default as IgcIconComponent } from './components/icon/icon.js';
export { default as IgcIconButtonComponent } from './components/button/icon-button.js';
export { default as IgcInputComponent } from './components/input/input.js';
export { default as IgcFormComponent } from './components/form/form.js';
export { default as IgcLinearProgressComponent } from './components/progress/linear-progress.js';
export { default as IgcListComponent } from './components/list/list.js';
export { default as IgcListHeaderComponent } from './components/list/list-header.js';
export { default as IgcListItemComponent } from './components/list/list-item.js';
export { default as IgcNavDrawerComponent } from './components/nav-drawer/nav-drawer.js';
export { default as IgcNavDrawerHeaderItemComponent } from './components/nav-drawer/nav-drawer-header-item.js';
export { default as IgcNavDrawerItemComponent } from './components/nav-drawer/nav-drawer-item.js';
export { default as IgcNavbarComponent } from './components/navbar/navbar.js';
export { default as IgcRadioGroupComponent } from './components/radio-group/radio-group.js';
export { default as IgcRadioComponent } from './components/radio/radio.js';
export { default as IgcRatingComponent } from './components/rating/rating.js';
export { default as IgcRatingSymbolComponent } from './components/rating/rating-symbol.js';
export { default as IgcRippleComponent } from './components/ripple/ripple.js';
export { default as IgcRangeSliderComponent } from './components/slider/range-slider.js';
export { default as IgcSnackbarComponent } from './components/snackbar/snackbar.js';
export { default as IgcSliderComponent } from './components/slider/slider.js';
export { default as IgcSliderLabelComponent } from './components/slider/slider-label.js';
export { default as IgcTabsComponent } from './components/tabs/tabs';
export { default as IgcTabComponent } from './components/tabs/tab';
export { default as IgcTabPanelComponent } from './components/tabs/tab-panel';
export { default as IgcToastComponent } from './components/toast/toast.js';
export { default as IgcSwitchComponent } from './components/checkbox/switch.js';

// definitions
export { defineComponents } from './components/common/definitions/defineComponents.js';
export { defineAllComponents } from './components/common/definitions/defineAllComponents.js';

// icon registration
export {
  registerIcon,
  registerIconFromText,
} from './components/icon/icon.registry.js';

// theming configuration
export { configureTheme } from './theming/config.js';

// localization objects
export { IgcCalendarResourceStrings } from './components/common/i18n/calendar.resources.js';

// Types
export {
  DateRangeDescriptor,
  DateRangeType,
} from './components/calendar/common/calendar.model.js';
export { IgcRangeSliderValue } from './components/slider/range-slider.js';

// Base classes
// TODO(rkaraivanov): Revise these exports
export { SizableMixin } from './components/common/mixins/sizable.js';
export { IgcCheckboxBaseComponent } from './components/checkbox/checkbox-base.js';
export { IgcInputBaseComponent } from './components/input/input-base.js';
export { IgcSliderBaseComponent } from './components/slider/slider-base.js';
export { IgcButtonBaseComponent } from './components/button/button-base.js';
export { IgcCalendarBaseComponent } from './components/calendar/common/calendar-base.js';
