export interface PartNameInfo {
  readonly [name: string]: string | boolean | number;
}

export const partNameMap = (partNameInfo: PartNameInfo) => {
  return Object.keys(partNameInfo)
    .filter((key) => partNameInfo[key])
    .join(' ');
};

export const clamp = (number: number, min: number, max: number) => {
  return Math.max(min, Math.min(number, max));
};
