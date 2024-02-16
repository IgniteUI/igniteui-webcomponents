// Components
export { default as IgcAvatarComponent } from './components/avatar/avatar.js';
export { default as IgcAccordionComponent } from './components/accordion/accordion.js';
export { default as IgcBadgeComponent } from './components/badge/badge.js';
export { default as IgcButtonComponent } from './components/button/button.js';
export { default as IgcButtonGroupComponent } from './components/button-group/button-group.js';
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
export { default as IgcComboComponent } from './components/combo/combo.js';
export { default as IgcDatepickerComponent } from './components/date-picker/date-picker.js';
export { default as IgcDateTimeInputComponent } from './components/date-time-input/date-time-input.js';
export { default as IgcDialogComponent } from './components/dialog/dialog.js';
export { default as IgcDropdownComponent } from './components/dropdown/dropdown.js';
export { default as IgcDropdownGroupComponent } from './components/dropdown/dropdown-group.js';
export { default as IgcDropdownHeaderComponent } from './components/dropdown/dropdown-header.js';
export { default as IgcDropdownItemComponent } from './components/dropdown/dropdown-item.js';
export { default as IgcSelectComponent } from './components/select/select.js';
export { default as IgcSelectGroupComponent } from './components/select/select-group.js';
export { default as IgcSelectHeaderComponent } from './components/select/select-header.js';
export { default as IgcSelectItemComponent } from './components/select/select-item.js';
export { default as IgcExpansionPanelComponent } from './components/expansion-panel/expansion-panel.js';
export { default as IgcIconComponent } from './components/icon/icon.js';
export { default as IgcIconButtonComponent } from './components/button/icon-button.js';
export { default as IgcInputComponent } from './components/input/input.js';
export { default as IgcFormComponent } from './components/form/form.js';
export { default as IgcLinearProgressComponent } from './components/progress/linear-progress.js';
export { default as IgcListComponent } from './components/list/list.js';
export { default as IgcListHeaderComponent } from './components/list/list-header.js';
export { default as IgcListItemComponent } from './components/list/list-item.js';
export { default as IgcMaskInputComponent } from './components/mask-input/mask-input.js';
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
export { default as IgcTabsComponent } from './components/tabs/tabs.js';
export { default as IgcTabComponent } from './components/tabs/tab.js';
export { default as IgcTabPanelComponent } from './components/tabs/tab-panel.js';
export { default as IgcToastComponent } from './components/toast/toast.js';
export { default as IgcToggleButtonComponent } from './components/button-group/toggle-button.js';
export { default as IgcSwitchComponent } from './components/checkbox/switch.js';
export { default as IgcTextareaComponent } from './components/textarea/textarea.js';
export { default as IgcTreeComponent } from './components/tree/tree.js';
export { default as IgcTreeItemComponent } from './components/tree/tree-item.js';
export { default as IgcStepperComponent } from './components/stepper/stepper.js';
export { default as IgcStepComponent } from './components/stepper/step.js';

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
export { IgcCalendarResourceStringEN } from './components/common/i18n/calendar.resources.js';

// Types
export type { DateRangeDescriptor } from './components/calendar/common/calendar.model.js';
export { DateRangeType } from './components/calendar/common/calendar.model.js';
export type {
  DatePart,
  DatePartDeltas,
} from './components/date-time-input/date-util.js';
export type { IgcRangeSliderValue } from './components/slider/range-slider.js';
export type {
  IgcActiveStepChangingArgs,
  IgcActiveStepChangedArgs,
} from './components/stepper/stepper.common.js';
export type {
  ComboItemTemplate,
  IgcComboChangeEventArgs,
} from './components/combo/types.js';
