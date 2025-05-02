// Components
export { default as IgcAvatarComponent } from './components/avatar/avatar.js';
export { default as IgcAccordionComponent } from './components/accordion/accordion.js';
export { default as IgcBadgeComponent } from './components/badge/badge.js';
export { default as IgcBannerComponent } from './components/banner/banner.js';
export { default as IgcButtonComponent } from './components/button/button.js';
export { default as IgcButtonGroupComponent } from './components/button-group/button-group.js';
export { default as IgcCalendarComponent } from './components/calendar/calendar.js';
export { default as IgcCardComponent } from './components/card/card.js';
export { default as IgcCardActionsComponent } from './components/card/card.actions.js';
export { default as IgcCardContentComponent } from './components/card/card.content.js';
export { default as IgcCardHeaderComponent } from './components/card/card.header.js';
export { default as IgcCardMediaComponent } from './components/card/card.media.js';
export { default as IgcCarouselComponent } from './components/carousel/carousel.js';
export { default as IgcCarouselIndicatorComponent } from './components/carousel/carousel-indicator.js';
export { default as IgcCarouselSlideComponent } from './components/carousel/carousel-slide.js';
export { default as IgcChatComponent } from './components/chat/chat.js';
export { default as IgcCheckboxComponent } from './components/checkbox/checkbox.js';
export { default as IgcCircularProgressComponent } from './components/progress/circular-progress.js';
export { default as IgcCircularGradientComponent } from './components/progress/circular-gradient.js';
export { default as IgcChipComponent } from './components/chip/chip.js';
export { default as IgcComboComponent } from './components/combo/combo.js';
export { default as IgcDatePickerComponent } from './components/date-picker/date-picker.js';
export { default as IgcDateTimeInputComponent } from './components/date-time-input/date-time-input.js';
export { default as IgcDialogComponent } from './components/dialog/dialog.js';
export { default as IgcDividerComponent } from './components/divider/divider.js';
export { default as IgcDropdownComponent } from './components/dropdown/dropdown.js';
export { default as IgcDropdownGroupComponent } from './components/dropdown/dropdown-group.js';
export { default as IgcDropdownHeaderComponent } from './components/dropdown/dropdown-header.js';
export { default as IgcDropdownItemComponent } from './components/dropdown/dropdown-item.js';
export { default as IgcFileInputComponent } from './components/file-input/file-input.js';
export { default as IgcSelectComponent } from './components/select/select.js';
export { default as IgcSelectGroupComponent } from './components/select/select-group.js';
export { default as IgcSelectHeaderComponent } from './components/select/select-header.js';
export { default as IgcSelectItemComponent } from './components/select/select-item.js';
export { default as IgcExpansionPanelComponent } from './components/expansion-panel/expansion-panel.js';
export { default as IgcIconComponent } from './components/icon/icon.js';
export { default as IgcIconButtonComponent } from './components/button/icon-button.js';
export { default as IgcInputComponent } from './components/input/input.js';
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
export { default as IgcTileComponent } from './components/tile-manager/tile.js';
export { default as IgcTileManagerComponent } from './components/tile-manager/tile-manager.js';
export { default as IgcToastComponent } from './components/toast/toast.js';
export { default as IgcToggleButtonComponent } from './components/button-group/toggle-button.js';
export { default as IgcSwitchComponent } from './components/checkbox/switch.js';
export { default as IgcTextareaComponent } from './components/textarea/textarea.js';
export { default as IgcTreeComponent } from './components/tree/tree.js';
export { default as IgcTreeItemComponent } from './components/tree/tree-item.js';
export { default as IgcStepperComponent } from './components/stepper/stepper.js';
export { default as IgcStepComponent } from './components/stepper/step.js';
export { default as IgcTooltipComponent } from './components/tooltip/tooltip.js';

// definitions
export { defineComponents } from './components/common/definitions/defineComponents.js';
export { defineAllComponents } from './components/common/definitions/defineAllComponents.js';

// icon registration
export {
  registerIcon,
  registerIconFromText,
  setIconRef,
} from './components/icon/icon.registry.js';

// theming configuration
export { configureTheme } from './theming/config.js';

// localization objects
export {
  IgcCalendarResourceStringEN,
  type IgcCalendarResourceStrings,
} from './components/common/i18n/calendar.resources.js';

// Event maps
export type { IgcBannerComponentEventMap } from './components/banner/banner.js';
export type { IgcButtonGroupComponentEventMap } from './components/button-group/button-group.js';
export type { IgcCalendarComponentEventMap } from './components/calendar/types.js';
export type { IgcCarouselComponentEventMap } from './components/carousel/carousel.js';
export type { IgcCheckboxComponentEventMap } from './components/checkbox/checkbox-base.js';
export type { IgcCheckboxComponentEventMap as IgcSwitchComponentEventMap } from './components/checkbox/checkbox-base.js';
export type { IgcChipComponentEventMap } from './components/chip/chip.js';
export type { IgcComboComponentEventMap } from './components/combo/types.js';
export type { IgcDatePickerComponentEventMap } from './components/date-picker/date-picker.js';
export type { IgcDateTimeInputComponentEventMap } from './components/date-time-input/date-time-input.js';
export type { IgcDialogComponentEventMap } from './components/dialog/dialog.js';
export type { IgcDropdownComponentEventMap } from './components/dropdown/dropdown.js';
export type { IgcExpansionPanelComponentEventMap } from './components/expansion-panel/expansion-panel.js';
export type { IgcInputComponentEventMap } from './components/input/input-base.js';
export type { IgcInputComponentEventMap as IgcMaskInputComponentEventMap } from './components/input/input-base.js';
export type { IgcInputComponentEventMap as IgcFileInputComponentEventMap } from './components/input/input-base.js';
export type { IgcRadioComponentEventMap } from './components/radio/radio.js';
export type { IgcRatingComponentEventMap } from './components/rating/rating.js';
export type { IgcSelectComponentEventMap } from './components/select/select.js';
export type { IgcSliderComponentEventMap } from './components/slider/slider.js';
export type { IgcRangeSliderComponentEventMap } from './components/slider/range-slider.js';
export type { IgcSnackbarComponentEventMap } from './components/snackbar/snackbar.js';
export type { IgcStepperComponentEventMap } from './components/stepper/stepper.common.js';
export type { IgcTabsComponentEventMap } from './components/tabs/tabs.js';
export type { IgcTextareaComponentEventMap } from './components/textarea/textarea.js';
export type { IgcTileComponentEventMap } from './components/tile-manager/tile.js';
export type { IgcTreeComponentEventMap } from './components/tree/tree.common.js';
export type { IgcTooltipComponentEventMap } from './components/tooltip/tooltip.js';

// Public types
export type * from './components/types.js';
export type { IgcTileChangeStateEventArgs } from './components/tile-manager/tile.js';
export type {
  CalendarActiveView,
  CalendarHeaderOrientation,
  CalendarSelection,
  DateRangeDescriptor,
  WeekDays,
} from './components/calendar/types.js';
export { DateRangeType } from './components/calendar/types.js';
export type { IgcCheckboxChangeEventArgs } from './components/checkbox/checkbox-base.js';
export { DatePart } from './components/date-time-input/date-util.js';
export type { DatePartDeltas } from './components/date-time-input/date-util.js';
export type { PopoverPlacement } from './components/popover/popover.js';
export type { IgcRadioChangeEventArgs } from './components/radio/radio.js';
export type { IgcRangeSliderValueEventArgs } from './components/slider/range-slider.js';
export type {
  IgcActiveStepChangingEventArgs,
  IgcActiveStepChangedEventArgs,
} from './components/stepper/stepper.common.js';
export type { IgcTreeSelectionEventArgs } from './components/tree/tree.common.js';
export type {
  ComboItemTemplate,
  ComboTemplateProps,
  FilteringOptions,
  GroupingDirection,
  IgcComboChangeEventArgs,
} from './components/combo/types.js';
export type { IconMeta } from './components/icon/registry/types.js';
