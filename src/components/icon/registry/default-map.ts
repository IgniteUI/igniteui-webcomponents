/* blazorSuppress */
export class DefaultMap<T, U> {
  private _defaultValue: () => U;
  private _map = new Map<T, U>();

  constructor(defaultValue: () => U) {
    this._defaultValue = defaultValue;
  }

  public getOrCreate(key: T) {
    if (!this._map.has(key)) {
      this._map.set(key, this._defaultValue());
    }

    return this._map.get(key) as U;
  }

  public get(key: T) {
    return this._map.get(key);
  }

  public set(key: T, value: U) {
    this._map.set(key, value);
  }

  public has(key: T) {
    return this._map.has(key);
  }

  forEach(callback: (value: U, key: T, map: Map<T, U>) => void) {
    this._map.forEach(callback);
  }
}
