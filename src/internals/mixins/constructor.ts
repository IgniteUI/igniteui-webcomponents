import type { LitElement } from 'lit';

export type Constructor<T = object> = new (...args: any[]) => T;

export type AbstractConstructor<T = object> = abstract new (
  ...args: any[]
) => T;

/** A mixin base that keeps the public statics of `LitElement`. */
export type LitElementConstructor = Constructor<LitElement> &
  Omit<typeof LitElement, 'prototype'>;
