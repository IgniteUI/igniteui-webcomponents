/**
 * Indicates additional dependencies that should be loaded by the module of a component, even if they don't appear to be dependencies.
 * @param _additionalDependencies an alternate member name to use.
 */
export function blazorAdditionalDependencies(_additionalDependencies: string) {
  return (clazz: any) => {
    return clazz;
  };
}
