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
import IgcSwitchComponent from '../../checkbox/switch';
import IgcFormComponent from '../../form/form';
import IgcIconComponent from '../../icon/icon';
import IgcInputComponent from '../../input/input';
import IgcListComponent from '../../list/list';
import IgcListHeaderComponent from '../../list/list-header';
import IgcListItemComponent from '../../list/list-item';
import IgcNavDrawerComponent from '../../nav-drawer/nav-drawer';
import IgcNavDrawerHeaderItemComponent from '../../nav-drawer/nav-drawer-header-item';
import IgcNavDrawerItemComponent from '../../nav-drawer/nav-drawer-item';
import IgcNavbarComponent from '../../navbar/navbar';
import IgcRadioGroupComponent from '../../radio-group/radio-group';
import IgcRadioComponent from '../../radio/radio';
import IgcRatingComponent from '../../rating/rating';
import IgcRippleComponent from '../../ripple/ripple';
import IgcRangeSliderComponent from '../../slider/range-slider';
import IgcSliderComponent from '../../slider/slider';
import { defineComponents } from './defineComponents';

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
  IgcRatingComponent,
  IgcRippleComponent,
  IgcSliderComponent,
  IgcRangeSliderComponent,
];

export const defineAllComponents = () => {
  defineComponents(...allComponents);
};
