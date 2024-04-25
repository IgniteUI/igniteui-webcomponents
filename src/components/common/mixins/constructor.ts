export type Constructor<T = object> = new (...args: any[]) => T;

export type AbstractConstructor<T = object> = abstract new (
  ...args: any[]
) => T;
