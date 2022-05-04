import { property, state } from 'lit/decorators.js';
import { IgcInputBaseComponent } from '../input/input-base';
import { MaskParser } from './mask-parser';
interface MaskSelection {
  start: number;
  end: number;
}

export abstract class IgcMaskInputBaseComponent extends IgcInputBaseComponent {
  protected parser = new MaskParser();
  protected selection: MaskSelection = { start: 0, end: 0 };
  protected compositionStart = 0;

  @state()
  protected hasFocus = false;

  @state()
  protected maskedValue = '';

  /** The mask pattern to apply on the input. */
  @property()
  public mask!: string;

  /** The prompt symbol to use for unfilled parts of the mask. */
  @property()
  public prompt!: string;

  /** The direction attribute of the control. */
  @property({ reflect: true })
  public override dir: 'ltr' | 'rtl' | 'auto' = 'auto';

  /** Controls the validity of the control. */
  @property({ reflect: true, type: Boolean })
  public invalid = false;

  protected get inputSelection(): MaskSelection {
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

    this.mask = this.mask || this.parser.mask;
    this.prompt = this.prompt || this.parser.prompt;
  }

  /**
   * Sets a custom validation message for the control.
   * As long as `message` is not empty, the control is considered invalid.
   */
  public setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.invalid = !this.input.checkValidity();
  }

  /** Selects all text within the input. */
  public select() {
    this.input.select();
  }

  protected handleInput({ inputType, isComposing }: InputEvent) {
    const value = this.input.value;
    const start = this.selection.start;
    let end = this.selection.end;

    switch (inputType) {
      case 'deleteContentForward':
        this.updateInput('', start, (end = start === end ? ++end : end));
        return this.updateComplete.then(() =>
          this.input.setSelectionRange(end, end)
        );

      case 'deleteContentBackward':
        if (isComposing) return;
        return this.updateInput('', this.inputSelection.start, end);

      case 'deleteByCut':
        return this.updateInput('', start, end);

      case 'insertText':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          start,
          end
        );

      case 'insertFromPaste':
        return this.updateInput(
          value.substring(start, this.inputSelection.end),
          start,
          this.inputSelection.start
        );

      case 'insertFromDrop':
        // return this.updateInput(
        //   value.substring(this.inputSelection.start, this.inputSelection.end),
        //   this.inputSelection.start,
        //   this.inputSelection.end
        // );
        return this.insertFromDrop(this.input.value);
    }
  }

  protected handleKeydown(e: KeyboardEvent) {
    if (!e.key) {
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
    const start = this.compositionStart,
      end = this.inputSelection.end;
    this.updateInput(data, start, end);
  }

  protected handleInvalid() {
    this.invalid = true;
  }

  public override setSelectionRange(
    start: number,
    end: number,
    direction?: 'backward' | 'forward' | 'none'
  ): void {
    super.setSelectionRange(start, end, direction);
    this.selection = { start, end };
  }

  protected abstract updateInput(
    part: string,
    start: number,
    finish: number
  ): void;
  protected abstract insertFromDrop(value: string): void;
}
