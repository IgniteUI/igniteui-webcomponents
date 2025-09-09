import { adoptStyles, type LitElement } from 'lit';
import { last } from '../common/util.js';
import IgcTooltipComponent from '../tooltip/tooltip.js';
import type IgcChatMessageComponent from './chat-message.js';
import type { IgcMessageAttachment } from './types.js';

let actionsTooltip: IgcTooltipComponent;

export type ChatAcceptedFileTypes = {
  extensions: Set<string>;
  mimeTypes: Set<string>;
  wildcardTypes: Set<string>;
};

export const ChatFileTypeIcons = new Map(
  Object.entries({
    css: 'file_generic',
    csv: 'file_generic',
    doc: 'file_generic',
    docx: 'file_generic',
    htm: 'file_generic',
    html: 'file_generic',
    js: 'file_generic',
    json: 'file_json',
    pdf: 'file_generic',
    rtf: 'file_generic',
    svg: 'file_generic',
    txt: 'file_generic',
    url: 'file_link',
    xls: 'file_generic',
    xlsx: 'file_json',
    xml: 'file_link',
    zip: 'file_generic',
    default: 'file_generic',
  })
);

export function parseAcceptedFileTypes(
  fileTypes: string
): ChatAcceptedFileTypes {
  const types = fileTypes.split(',').map((each) => each.trim().toLowerCase());
  return {
    extensions: new Set(types.filter((t) => t.startsWith('.'))),
    mimeTypes: new Set(
      types.filter((t) => !t.startsWith('.') && !t.endsWith('/*'))
    ),
    wildcardTypes: new Set(
      types.filter((t) => t.endsWith('/*')).map((t) => t.slice(0, -2))
    ),
  };
}

export function isAcceptedFileType(
  file: File,
  accepted: ChatAcceptedFileTypes | null
): boolean {
  if (!(accepted && file)) {
    return true;
  }

  const { extensions, mimeTypes, wildcardTypes } = accepted;
  const fileType = file.type.toLowerCase();
  const fileExtension = `.${last(file.name.split('.'))?.toLowerCase()}`;
  const [fileBaseType] = fileType.split('/');

  return (
    extensions.has(fileExtension) ||
    mimeTypes.has(fileType) ||
    wildcardTypes.has(fileBaseType)
  );
}

export function getChatAcceptedFiles(
  event: DragEvent,
  accepted: ChatAcceptedFileTypes | null
): File[] {
  return Array.from(event.dataTransfer?.files ?? []).filter((file) =>
    isAcceptedFileType(file, accepted)
  );
}

export function getIconName(fileType?: string) {
  return fileType?.startsWith('image') ? 'attach_image' : 'attach_document';
}

export function createAttachmentURL(attachment: IgcMessageAttachment): string {
  if (attachment.file) {
    return URL.createObjectURL(attachment.file);
  }

  return attachment.url || '';
}

export function getFileExtension(name: string): string {
  const parts = name.split('.');
  return parts.length > 1 ? last(parts) : '';
}

export function showChatActionsTooltip(target: Element, message: string): void {
  if (!actionsTooltip) {
    actionsTooltip = document.createElement(IgcTooltipComponent.tagName);
    actionsTooltip.hideTriggers = 'pointerleave,click,blur';
    actionsTooltip.hideDelay = 100;
    document.body.appendChild(actionsTooltip);
  }
  actionsTooltip.message = message;
  actionsTooltip.show(target);
}

// REVIEW: Maybe put that behind a configuration flag as this is nasty.
export function chatMessageAdoptPageStyles(
  message: IgcChatMessageComponent
): void {
  const sheets: CSSStyleSheet[] = [];

  for (const sheet of document.styleSheets) {
    try {
      const constructed = new CSSStyleSheet();
      for (const rule of sheet.cssRules) {
        constructed.insertRule(rule.cssText);
      }
      sheets.push(constructed);
    } catch {}
  }

  const ctor = message.constructor as typeof LitElement;
  adoptStyles(message.shadowRoot!, [...ctor.elementStyles, ...sheets]);
}
