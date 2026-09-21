/**
 * Names dependencies the module of a component must also load, but does not
 * appear to depend on.
 *
 * @param _additionalDependencies - The names of the additional dependencies.
 */
export function blazorAdditionalDependencies(_additionalDependencies: string) {
  return (clazz: any) => {
    return clazz;
  };
}
