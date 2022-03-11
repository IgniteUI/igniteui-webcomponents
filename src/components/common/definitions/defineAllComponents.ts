import IgcAvatarComponent from '../../avatar/avatar';
import IgcBadgeComponent from '../../badge/badge';
import IgcButtonComponent from '../../button/button';
import IgcIconButtonComponent from '../../button/icon-button';
import IgcCalendarComponent from '../../calendar/calendar';
import IgcCardComponent from '../../card/card';
import IgcCardActionsComponent from '../../card/card.actions';
import IgcCardContentComponent from '../../card/card.content';
import IgcCardHeaderComponent from '../../card/card.header';
import IgcCardMediaComponent from '../../card/card.media';
import IgcCheckboxComponent from '../../checkbox/checkbox';
import IgcCircularProgressComponent from '../../progress/circular-progress';
import IgcSwitchComponent from '../../checkbox/switch';
import IgcFormComponent from '../../form/form';
import IgcIconComponent from '../../icon/icon';
import IgcInputComponent from '../../input/input';
import IgcLinearProgressComponent from '../../progress/linear-progress';
import IgcListComponent from '../../list/list';
import IgcListHeaderComponent from '../../list/list-header';
import IgcListItemComponent from '../../list/list-item';
import IgcNavDrawerComponent from '../../nav-drawer/nav-drawer';
import IgcNavDrawerHeaderItemComponent from '../../nav-drawer/nav-drawer-header-item';
import IgcNavDrawerItemComponent from '../../nav-drawer/nav-drawer-item';
import IgcNavbarComponent from '../../navbar/navbar';
import IgcRadioGroupComponent from '../../radio-group/radio-group';
import IgcRadioComponent from '../../radio/radio';
import IgcRippleComponent from '../../ripple/ripple';
import IgcRangeSliderComponent from '../../slider/range-slider';
import IgcSliderComponent from '../../slider/slider';
import IgcSnackbarComponent from '../../snackbar/snackbar';
import IgcToastComponent from '../../toast/toast';
import IgcSliderLabelComponent from '../../slider/slider-label';
import { defineComponents } from './defineComponents';
import IgcCircularGradientComponent from '../../progress/circular-gradient';

const allComponents: CustomElementConstructor[] = [
  IgcAvatarComponent,
  IgcBadgeComponent,
  IgcButtonComponent,
  IgcIconButtonComponent,
  IgcCalendarComponent,
  IgcCardActionsComponent,
  IgcCardContentComponent,
  IgcCardHeaderComponent,
  IgcCardMediaComponent,
  IgcCardComponent,
  IgcCheckboxComponent,
  IgcSwitchComponent,
  IgcFormComponent,
  IgcIconComponent,
  IgcInputComponent,
  IgcListHeaderComponent,
  IgcListItemComponent,
  IgcListComponent,
  IgcNavDrawerHeaderItemComponent,
  IgcNavDrawerItemComponent,
  IgcNavDrawerComponent,
  IgcNavbarComponent,
  IgcRadioComponent,
  IgcRadioGroupComponent,
  IgcRippleComponent,
  IgcSliderComponent,
  IgcToastComponent,
  IgcSliderLabelComponent,
  IgcRangeSliderComponent,
  IgcCircularProgressComponent,
  IgcLinearProgressComponent,
  IgcCircularGradientComponent,
  IgcSnackbarComponent,
];

export const defineAllComponents = () => {
  defineComponents(...allComponents);
};
