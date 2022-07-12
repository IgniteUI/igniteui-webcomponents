import { ElementPart } from 'lit';
import { Directive, PartInfo, PartType } from 'lit/directive.js';
import { ElementClipOptions } from '../types';
import { clamp } from '../util';

export default class ClipDirective extends Directive {
  private host: HTMLElement;

  constructor(partInfo: PartInfo) {
    super(partInfo);

    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error(
        'The `clip` directive must be attached to an element tag.'
      );
    }

    this.host = (partInfo as ElementPart).element as HTMLElement;
  }

  protected clipSymbol({
    width,
    clip,
    direction = 'forward',
    rtl = false,
    exact = false,
    matcher = clip,
  }: ElementClipOptions) {
    const progress = width - clip;
    const exclusive = progress === 0 || width === matcher ? 0 : 1;
    const selection = exact ? exclusive : progress;
    const activate = (p: number) => clamp(p * 100, 0, 100);
    const forward = `inset(0 ${activate(
      !rtl ? selection : 1 - selection
    )}% 0 0)`;
    const backward = `inset(0 0 0 ${activate(
      !rtl ? 1 - selection : selection
    )}%)`;

    switch (direction) {
      case 'backward':
        this.host.style.clipPath = !rtl ? backward : forward;
        break;
      case 'forward':
      default:
        this.host.style.clipPath = !rtl ? forward : backward;
    }
  }

  public render(options: ElementClipOptions) {
    this.clipSymbol(options);
  }
}
