import { noChange } from 'lit';
import {
  type AttributePart,
  Directive,
  type DirectiveParameters,
  type PartInfo,
  PartType,
  directive,
} from 'lit/directive.js';

export interface PartMapInfo {
  readonly [name: string]: boolean | null | undefined;
}

class PartMapDirective extends Directive {
  private _previousParts?: Set<string>;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (
      partInfo.type !== PartType.ATTRIBUTE ||
      partInfo.name !== 'part' ||
      (partInfo.strings?.length as number) > 0
    ) {
      throw new Error(
        '`partMap() can only be used in the `part` attribute and must be the only part in the attribute.'
      );
    }
  }

  public override render(partMapInfo: PartMapInfo): string {
    return Object.keys(partMapInfo)
      .filter((key) => partMapInfo[key])
      .join(' ');
  }

  public override update(
    part: AttributePart,
    [partMapInfo]: DirectiveParameters<this>
  ) {
    const partList = part.element.part;

    if (this._previousParts === undefined) {
      this._previousParts = new Set();

      for (const name in partMapInfo) {
        if (partMapInfo[name]) {
          partList.add(name);
          this._previousParts.add(name);
        }
      }

      return this.render(partMapInfo);
    }

    for (const name of this._previousParts) {
      if (!(name in partMapInfo) || !partMapInfo[name]) {
        partList.remove(name);
        this._previousParts.delete(name);
      }
    }

    for (const name in partMapInfo) {
      const value = !!partMapInfo[name];
      if (value && !this._previousParts.has(name)) {
        partList.add(name);
        this._previousParts.add(name);
      }
    }

    return noChange;
  }
}

/**
 * Similar to Lit's {@link https://lit.dev/docs/templates/directives/#classmap | `classMap`} and
 * {@link https://lit.dev/docs/templates/directives/#stylemap | `styleMap`} but for `part` attributes.
 */
export const partMap = directive(PartMapDirective);
export type { PartMapDirective };
