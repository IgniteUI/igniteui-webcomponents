export type Constructor<T = {}> = new (...args: any[]) => T;

export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;
