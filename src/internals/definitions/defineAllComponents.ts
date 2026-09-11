import IgcAccordionComponent from '../../components/accordion/accordion.js';
import IgcAvatarComponent from '../../components/avatar/avatar.js';
import IgcBadgeComponent from '../../components/badge/badge.js';
import IgcBannerComponent from '../../components/banner/banner.js';
import IgcButtonGroupComponent from '../../components/button-group/button-group.js';
import IgcToggleButtonComponent from '../../components/button-group/toggle-button.js';
import IgcButtonComponent from '../../components/button/button.js';
import IgcIconButtonComponent from '../../components/button/icon-button.js';
import IgcCalendarComponent from '../../components/calendar/calendar.js';
import IgcCardActionsComponent from '../../components/card/card.actions.js';
import IgcCardContentComponent from '../../components/card/card.content.js';
import IgcCardHeaderComponent from '../../components/card/card.header.js';
import IgcCardComponent from '../../components/card/card.js';
import IgcCardMediaComponent from '../../components/card/card.media.js';
import IgcCarouselIndicatorComponent from '../../components/carousel/carousel-indicator.js';
import IgcCarouselSlideComponent from '../../components/carousel/carousel-slide.js';
import IgcCarouselComponent from '../../components/carousel/carousel.js';
import IgcChatComponent from '../../components/chat/chat.js';
import IgcCheckboxComponent from '../../components/checkbox/checkbox.js';
import IgcSwitchComponent from '../../components/checkbox/switch.js';
import IgcChipComponent from '../../components/chip/chip.js';
import IgcColorPickerComponent from '../../components/color-picker/color-picker.js';
import IgcComboComponent from '../../components/combo/combo.js';
import IgcDatePickerComponent from '../../components/date-picker/date-picker.js';
import IgcDateRangePickerComponent from '../../components/date-range-picker/date-range-picker.js';
import IgcDateTimeInputComponent from '../../components/date-time-input/date-time-input.js';
import IgcDialogComponent from '../../components/dialog/dialog.js';
import IgcDividerComponent from '../../components/divider/divider.js';
import IgcDropdownGroupComponent from '../../components/dropdown/dropdown-group.js';
import IgcDropdownHeaderComponent from '../../components/dropdown/dropdown-header.js';
import IgcDropdownItemComponent from '../../components/dropdown/dropdown-item.js';
import IgcDropdownComponent from '../../components/dropdown/dropdown.js';
import IgcExpansionPanelComponent from '../../components/expansion-panel/expansion-panel.js';
import IgcFileInputComponent from '../../components/file-input/file-input.js';
import IgcHighlightComponent from '../../components/highlight/highlight.js';
import IgcIconComponent from '../../components/icon/icon.js';
import IgcInputComponent from '../../components/input/input.js';
import IgcListHeaderComponent from '../../components/list/list-header.js';
import IgcListItemComponent from '../../components/list/list-item.js';
import IgcListComponent from '../../components/list/list.js';
import IgcMaskInputComponent from '../../components/mask-input/mask-input.js';
import IgcNavDrawerHeaderItemComponent from '../../components/nav-drawer/nav-drawer-header-item.js';
import IgcNavDrawerItemComponent from '../../components/nav-drawer/nav-drawer-item.js';
import IgcNavDrawerComponent from '../../components/nav-drawer/nav-drawer.js';
import IgcNavbarComponent from '../../components/navbar/navbar.js';
import IgcCircularGradientComponent from '../../components/progress/circular-gradient.js';
import IgcCircularProgressComponent from '../../components/progress/circular-progress.js';
import IgcLinearProgressComponent from '../../components/progress/linear-progress.js';
import IgcQrCodeComponent from '../../components/qr-code/qr-code.js';
import IgcRadioGroupComponent from '../../components/radio-group/radio-group.js';
import IgcRadioComponent from '../../components/radio/radio.js';
import IgcRatingSymbolComponent from '../../components/rating/rating-symbol.js';
import IgcRatingComponent from '../../components/rating/rating.js';
import IgcRippleComponent from '../../components/ripple/ripple.js';
import IgcSelectGroupComponent from '../../components/select/select-group.js';
import IgcSelectHeaderComponent from '../../components/select/select-header.js';
import IgcSelectItemComponent from '../../components/select/select-item.js';
import IgcSelectComponent from '../../components/select/select.js';
import IgcRangeSliderComponent from '../../components/slider/range-slider.js';
import IgcSliderLabelComponent from '../../components/slider/slider-label.js';
import IgcSliderComponent from '../../components/slider/slider.js';
import IgcSnackbarComponent from '../../components/snackbar/snackbar.js';
import IgcSplitterComponent from '../../components/splitter/splitter.js';
import IgcStepComponent from '../../components/stepper/step.js';
import IgcStepperComponent from '../../components/stepper/stepper.js';
import IgcTabComponent from '../../components/tabs/tab.js';
import IgcTabsComponent from '../../components/tabs/tabs.js';
import IgcTextareaComponent from '../../components/textarea/textarea.js';
import IgcThemeProviderComponent from '../../components/theme-provider/theme-provider.js';
import IgcTileManagerComponent from '../../components/tile-manager/tile-manager.js';
import IgcTileComponent from '../../components/tile-manager/tile.js';
import IgcToastComponent from '../../components/toast/toast.js';
import IgcTooltipComponent from '../../components/tooltip/tooltip.js';
import IgcTreeItemComponent from '../../components/tree/tree-item.js';
import IgcTreeComponent from '../../components/tree/tree.js';
import IgcVirtualScrollComponent from '../../components/virtualization/virtualization.js';
import { defineComponents } from './defineComponents.js';
import type { IgniteComponent } from './register.js';

const allComponents: IgniteComponent[] = [
  IgcThemeProviderComponent,
  IgcAvatarComponent,
  IgcAccordionComponent,
  IgcBadgeComponent,
  IgcBannerComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcToggleButtonComponent,
  IgcButtonGroupComponent,
  IgcCalendarComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCardComponent,
  IgcCarouselComponent,
  IgcCarouselIndicatorComponent,
  IgcCarouselSlideComponent,
  IgcChatComponent,
  IgcCheckboxComponent,
  IgcChipComponent,
  IgcColorPickerComponent,
  IgcFileInputComponent,
  IgcComboComponent,
  IgcDatePickerComponent,
  IgcDateRangePickerComponent,
  IgcDropdownComponent,
  IgcDropdownGroupComponent,
  IgcDropdownHeaderComponent,
  IgcDropdownItemComponent,
  IgcDialogComponent,
  IgcDividerComponent,
  IgcSwitchComponent,
  IgcExpansionPanelComponent,
  IgcHighlightComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcListComponent,
  IgcMaskInputComponent,
  IgcNavDrawerHeaderItemComponent,
  IgcNavDrawerItemComponent,
  IgcNavDrawerComponent,
  IgcNavbarComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcRatingComponent,
  IgcRatingSymbolComponent,
  IgcRippleComponent,
  IgcSelectGroupComponent,
  IgcSelectHeaderComponent,
  IgcSelectItemComponent,
  IgcSelectComponent,
  IgcTreeComponent,
  IgcTreeItemComponent,
  IgcSliderComponent,
  IgcToastComponent,
  IgcSliderLabelComponent,
  IgcRangeSliderComponent,
  IgcTabsComponent,
  IgcTabComponent,
  IgcCircularProgressComponent,
  IgcLinearProgressComponent,
  IgcCircularGradientComponent,
  IgcSnackbarComponent,
  IgcDateTimeInputComponent,
  IgcSplitterComponent,
  IgcStepperComponent,
  IgcStepComponent,
  IgcTextareaComponent,
  IgcTileComponent,
  IgcTileManagerComponent,
  IgcTooltipComponent,
  IgcQrCodeComponent,
  IgcVirtualScrollComponent,
];

export function defineAllComponents() {
  defineComponents(...allComponents);
}
