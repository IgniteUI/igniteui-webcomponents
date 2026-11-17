import type { IResourceStrings } from 'igniteui-i18n-core';
import { isString } from '../utils/types.js';

/**
 * Maps the deprecated resource keys of a component to the keys of the core
 * library.
 */
export type ResourceMap = ReadonlyMap<string, string>;

/** Converts core resource strings to the deprecated shape via `resourceMap`. */
export function convertToIgcResource<T extends object>(
  resource: IResourceStrings,
  resourceMap: ResourceMap
): T {
  const result = {} as T;

  for (const [igcKey, coreKey] of resourceMap) {
    if (igcKey in resource) {
      result[igcKey as keyof T] = resource[
        igcKey as keyof IResourceStrings
      ] as T[keyof T];
    } else if (coreKey in resource) {
      const value = resource[coreKey as keyof IResourceStrings];
      if (isString(value)) {
        result[igcKey as keyof T] = value as T[keyof T];
      }
    }
  }

  return result;
}

/** Converts the deprecated shape to core resource strings via `resourceMap`. */
function convertToCoreResource<T extends object>(
  resource: T,
  resourceMap: ResourceMap
): IResourceStrings {
  const result: IResourceStrings = {};

  for (const [igcKey, coreKey] of resourceMap) {
    if (coreKey in resource) {
      result[coreKey as keyof IResourceStrings] = resource[
        coreKey as keyof T
      ] as string;
    } else {
      const value = resource[igcKey as keyof T];
      if (isString(value)) {
        result[coreKey as keyof IResourceStrings] = value;
      }
    }
  }

  return result;
}

/**
 * Returns `value` with both the deprecated and the core keys of `resourceMap`,
 * so that a component can read either shape.
 */
export function mixResourceStrings<T extends object>(
  value: T,
  resourceMap?: ResourceMap
): T {
  return resourceMap
    ? (Object.assign(
        {},
        value,
        convertToCoreResource(value, resourceMap),
        convertToIgcResource(value, resourceMap)
      ) as T)
    : value;
}
