import { ReactiveControllerHost } from 'lit';
import IgcComboComponent from './combo.js';

export type Keys<T> = keyof T;
export type Values<T> = T[keyof T];

export interface ComboRecordMeta {
  header: boolean;
}

export type ComboRecord<T extends object> = T & ComboRecordMeta;

export type ComboHost<T extends object> = ReactiveControllerHost &
  IgcComboComponent<T>;
