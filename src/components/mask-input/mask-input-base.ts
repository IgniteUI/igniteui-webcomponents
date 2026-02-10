import { property, state } from 'lit/decorators.js';
import { blazorDeepImport } from '../common/decorators/blazorDeepImport.js';
import { IgcInputBaseComponent } from '../input/input-base.js';
import type { RangeTextSelectMode, SelectionRangeDirection } from '../types.js';
import { MaskParser } from './mask-parser.js';

export type MaskSelection = {
  start: number;
  end: number;
};

@blazorDeepImport
export abstract class IgcMaskInputBaseComponent extends IgcInputBaseComponent {
  //#region Internal state and properties

  protected readonly _parser = new MaskParser();

  protected _maskSelection: MaskSelection = { start: 0, end: 0 };
  protected _compositionStart = 0;

  @state()
  protected _focused = false;

  @state()
  protected _maskedValue = '';

  protected get _inputSelection(): MaskSelection {
    return {
      start: this._input?.selectionStart || 0,
      end: this._input?.selectionEnd || 0,
    };
  }

  //#endregion

  //#region Public attributes and properties

  /**
   * Makes the control a readonly field.
   *
   * @attr readonly
   * @default false
   */
  @property({ type: Boolean, reflect: true })
  public readOnly = false;

  /**
   * The masked pattern of the component.
   *
   * @attr
   * @default 'CCCCCCCCCC'
   */
  @property()
  public set mask(value: string) {
    this._parser.mask = value;
  }

  public get mask(): string {
    return this._parser.mask;
  }

  /**
   * The prompt symbol to use for unfilled parts of the mask pattern.
   *
   * @attr
   * @default '_'
   */
  @property()
  public set prompt(value: string) {
    this._parser.prompt = value;
  }

  public get prompt(): string {
    return this._parser.prompt;
  }

  //#endregion

  //#region Event handlers

  protected async _handleInput({
    inputType,
    isComposing,
  }: InputEvent): Promise<void> {
    const value = this._input?.value ?? '';
    const { start, end } = this._maskSelection;
    const deletePosition = this._parser.getNextNonLiteralPosition(end) + 1;
    this._setTouchedState();

    switch (inputType) {
      case 'deleteContentForward':
        this._updateInput('', { start, end: deletePosition });
        await this.updateComplete;
        return this._input?.setSelectionRange(deletePosition, deletePosition);

      case 'deleteContentBackward':
        if (isComposing) return;
        return this._updateInput('', {
          start: this._parser.getPreviousNonLiteralPosition(
            this._inputSelection.start + 1
          ),
          end,
        });

      case 'deleteByCut':
        return this._updateInput('', this._maskSelection);

      case 'insertText':
        return this._updateInput(
          value.substring(start, this._inputSelection.end),
          this._maskSelection
        );

      case 'insertFromPaste':
        return this._updateInput(
          value.substring(start, this._inputSelection.end),
          {
            start,
            end: this._inputSelection.start,
          }
        );

      case 'insertFromDrop':
        return this._updateInput(
          value.substring(this._inputSelection.start, this._inputSelection.end),
          { ...this._inputSelection }
        );

      // Potential browser auto-fill behavior
      case undefined:
      case '':
        return this._updateInput(
          this._parser.parse(value.substring(start, this._inputSelection.end)),
          {
            start,
            end: this._inputSelection.end,
          }
        );
    }
  }

  protected _setMaskSelection(): void {
    this._maskSelection = this._inputSelection;
  }

  protected _handleCompositionStart(): void {
    this._compositionStart = this._inputSelection.start;
  }

  protected _handleCompositionEnd({ data }: CompositionEvent): void {
    this._updateInput(data, {
      start: this._compositionStart,
      end: this._inputSelection.end,
    });
  }

  protected _handleClick(): void {
    const { selectionStart: start, selectionEnd: end } = this._input ?? {
      selectionStart: 0,
      selectionEnd: 0,
    };

    // Clicking at the end of the input field will select the entire mask
    if (start === end && start === this._maskedValue.length) {
      this.select();
    }
  }

  //#endregion

  //#region Internal methods

  protected abstract _updateSetRangeTextValue(): void;
  protected abstract _updateInput(text: string, range: MaskSelection): void;

  //#endregion

  //#region Public methods

  /* blazorSuppress */
  /** Sets the text selection range of the control */
  public setSelectionRange(
    start?: number,
    end?: number,
    direction: SelectionRangeDirection = 'none'
  ): void {
    this._input?.setSelectionRange(start ?? null, end ?? null, direction);
    this._maskSelection = { start: start ?? 0, end: end ?? 0 };
  }

  /* blazorSuppress */
  /** Replaces the selected text in the control and re-applies the mask */
  public setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode?: RangeTextSelectMode
  ): void {
    const current = this._inputSelection;
    const _start = start ?? current.start;
    const _end = end ?? current.end;

    const result = this._parser.replace(
      this._maskedValue || this._parser.emptyMask,
      replacement,
      _start,
      _end
    );
    this._maskedValue = this._parser.apply(this._parser.parse(result.value));
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

  //#endregion
}
