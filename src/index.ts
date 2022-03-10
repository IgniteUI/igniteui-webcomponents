// Components

export { default as IgcAvatarComponent } from './components/avatar/avatar';
export { default as IgcBadgeComponent } from './components/badge/badge';
export { default as IgcButtonComponent } from './components/button/button';
export { IgcButtonBaseComponent } from './components/button/button-base';
export { default as IgcIconButtonComponent } from './components/button/icon-button';
export { default as IgcCalendarComponent } from './components/calendar/calendar';
export { IgcCalendarBaseComponent } from './components/calendar/common/calendar-base';
export {
  DateRangeDescriptor,
  DateRangeType,
} from './components/calendar/common/calendar.model';
export { default as IgcCardComponent } from './components/card/card';
export { default as IgcCardActionsComponent } from './components/card/card.actions';
export { default as IgcCardContentComponent } from './components/card/card.content';
export { default as IgcCardHeaderComponent } from './components/card/card.header';
export { default as IgcCardMediaComponent } from './components/card/card.media';
export { default as IgcCheckboxComponent } from './components/checkbox/checkbox';
export { IgcCheckboxBaseComponent } from './components/checkbox/checkbox-base';
export { default as IgcSwitchComponent } from './components/checkbox/switch';
export { defineAllComponents } from './components/common/definitions/defineAllComponents';
export { defineComponents } from './components/common/definitions/defineComponents';
export { IgcCalendarResourceStrings } from './components/common/i18n/calendar.resources';
export { SizableMixin } from './components/common/mixins/sizable';
export { default as IgcFormComponent } from './components/form/form';
export { default as IgcIconComponent } from './components/icon/icon';
// utility stuff
export {
  registerIcon,
  registerIconFromText,
} from './components/icon/icon.registry';
export { default as IgcInputComponent } from './components/input/input';
export { IgcInputBaseComponent } from './components/input/input-base';
export { default as IgcListComponent } from './components/list/list';
export { default as IgcListHeaderComponent } from './components/list/list-header';
export { default as IgcListItemComponent } from './components/list/list-item';
export { default as IgcNavDrawerComponent } from './components/nav-drawer/nav-drawer';
export { default as IgcNavDrawerHeaderItemComponent } from './components/nav-drawer/nav-drawer-header-item';
export { default as IgcNavDrawerItemComponent } from './components/nav-drawer/nav-drawer-item';
export { default as IgcNavbarComponent } from './components/navbar/navbar';
export { default as IgcRadioGroupComponent } from './components/radio-group/radio-group';
export { default as IgcRadioComponent } from './components/radio/radio';
export { default as IgcRatingComponent } from './components/rating/rating';
export { default as IgcRatingSymbolComponent } from './components/rating/rating-symbol';
export { default as IgcRippleComponent } from './components/ripple/ripple';
export {
  default as IgcRangeSliderComponent,
  IgcRangeSliderValue,
} from './components/slider/range-slider';
export { default as IgcSliderComponent } from './components/slider/slider';
export { IgcSliderBaseComponent } from './components/slider/slider-base';
export { default as IgcSliderLabelComponent } from './components/slider/slider-label';
export { configureTheme } from './theming/config';
