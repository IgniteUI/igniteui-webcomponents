import { property, state } from 'lit/decorators.js';

import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { IgcInputBaseComponent } from '../input/input-base.js';
import type { RangeTextSelectMode, SelectionRangeDirection } from '../types.js';
import { MaskParser } from './mask-parser.js';

export type MaskRange = {
  start: number;
  end: number;
};

@blazorDeepImport
export abstract class IgcMaskInputBaseComponent extends IgcInputBaseComponent {
  protected parser = new MaskParser();
  protected selection: MaskRange = { start: 0, end: 0 };
  protected compositionStart = 0;

  @state()
  protected focused = false;

  @state()
  protected maskedValue = '';

  @state()
  protected _mask = '';

  /** The prompt symbol to use for unfilled parts of the mask. */
  @property()
  public prompt!: string;

  protected get inputSelection(): MaskRange {
    return {
      start: this.input.selectionStart || 0,
      end: this.input.selectionEnd || 0,
    };
  }

  protected get emptyMask(): string {
    return this.parser.apply();
  }

  public override connectedCallback() {
    super.connectedCallback();

    this._mask = this._mask || this.parser.mask;
    this.prompt = this.prompt || this.parser.prompt;
  }

  /** Selects all text within the input. */
  public select() {
    this.input.select();
  }

  protected handleInput({ inputType, isComposing }: InputEvent) {
    const EMPTY = '';
    const value = this.input.value;
    const { start, end } = this.selection;
    const deleteEnd = this.parser.getNextNonLiteralPosition(end) + 1;

    switch (inputType) {
      case 'deleteContentForward':
        this.updateInput(EMPTY, { start, end: deleteEnd });
        return this.updateComplete.then(() =>
          this.input.setSelectionRange(deleteEnd, deleteEnd)
        );

      case 'deleteContentBackward':
        if (isComposing) return;
        return this.updateInput(EMPTY, {
          start: this.parser.getPreviousNonLiteralPosition(
            this.inputSelection.start
          ),
          end,
        });

      case 'deleteByCut':
        return this.updateInput(EMPTY, this.selection);

      case 'insertText':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          this.selection
        );

      case 'insertFromPaste':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          {
            start,
            end: this.inputSelection.start,
          }
        );

      case 'insertFromDrop':
        return this.updateInput(
          value.substring(this.inputSelection.start, this.inputSelection.end),
          { ...this.inputSelection }
        );
    }
  }

  protected handleKeydown({ key }: KeyboardEvent) {
    if (!key) {
      return;
    }
    this.selection = this.inputSelection;
  }

  protected handleCut() {
    this.selection = this.inputSelection;
  }

  protected handleDragStart() {
    this.selection = this.inputSelection;
  }

  protected handleCompositionStart() {
    this.compositionStart = this.inputSelection.start;
  }

  protected handleCompositionEnd({ data }: CompositionEvent) {
    this.updateInput(data, {
      start: this.compositionStart,
      end: this.inputSelection.end,
    });
  }

  protected handleClick() {
    const { selectionStart: start, selectionEnd: end } = this.input;

    // Clicking at the end of the input field will select the entire mask
    if (start === end && start === this.maskedValue.length) {
      this.select();
    }
  }

  /* blazorSuppress */
  public override setSelectionRange(
    start: number,
    end: number,
    direction?: SelectionRangeDirection
  ): void {
    super.setSelectionRange(start, end, direction);
    this.selection = { start, end };
  }

  /* blazorSuppress */
  /** Replaces the selected text in the control and re-applies the mask */
  public override setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ) {
    const current = this.inputSelection;
    const _start = start ?? current.start;
    const _end = end ?? current.end;

    const result = this.parser.replace(
      this.maskedValue || this.emptyMask,
      replacement,
      _start,
      _end
    );
    this.maskedValue = this.parser.apply(this.parser.parse(result.value));
    this._updateSetRangeTextValue();

    this.updateComplete.then(() => {
      switch (selectMode) {
        case 'select':
          this.setSelectionRange(_start, _end);
          break;
        case 'start':
          this.setSelectionRange(_start, _start);
          break;
        case 'end':
          this.setSelectionRange(_end, _end);
          break;
        default:
          this.setSelectionRange(current.start, current.end);
      }
    });
  }

  protected abstract _updateSetRangeTextValue(): void;
  protected abstract updateInput(string: string, range: MaskRange): void;
}
