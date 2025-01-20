type ScrollState = { x: number; y: number };

class ScrollBehavior {
  private _element: HTMLElement;
  private _state: ScrollState = { x: 0, y: 0 };

  public get state(): ScrollState {
    return { ...this._state };
  }

  public get currentState(): ScrollState {
    const { scrollHeight, scrollWidth } = getScrollableParent(this._element);
    return { x: scrollWidth, y: scrollHeight };
  }

  public get scrollContainer(): HTMLElement {
    return getScrollableParent(this._element);
  }

  constructor(element: HTMLElement) {
    this._element = element;
  }

  public saveCurrentState(): void {
    const { scrollHeight, scrollWidth } = getScrollableParent(this._element);
    Object.assign(this._state, { x: scrollWidth, y: scrollHeight });
  }

  public scrollBy(config: ScrollToOptions): void {
    this.scrollContainer.scrollBy(config);
  }
}

// REVIEW: Questionable
function getScrollableParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement;

  while (parent) {
    const { overflow } = getComputedStyle(parent);
    if (/auto|scroll/.test(overflow)) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return document.documentElement;
}

export function addScrollBehavior(element: HTMLElement): ScrollBehavior {
  return new ScrollBehavior(element);
}
