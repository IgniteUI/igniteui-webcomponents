import { property, state } from 'lit/decorators.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { blazorSuppress } from '../common/decorators/blazorSuppress.js';
import { IgcInputBaseComponent } from '../input/input-base.js';
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

  // TODO: Remove after date-time input implementation
  protected handleInvalid() {
    this.invalid = true;
  }

  @blazorSuppress()
  public override setSelectionRange(
    start: number,
    end: number,
    direction?: 'backward' | 'forward' | 'none'
  ): void {
    super.setSelectionRange(start, end, direction);
    this.selection = { start, end };
  }

  protected abstract updateInput(string: string, range: MaskRange): void;
}
