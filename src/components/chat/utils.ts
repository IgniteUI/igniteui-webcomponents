import { lastOf } from '#internals/utils/arrays.js';
import { getOrInsertComputed } from '#internals/utils/objects.js';
import type { IgcChatMessageAttachment } from './types.js';

export type ChatAcceptedFileTypes = {
  extensions: Set<string>;
  mimeTypes: Set<string>;
  wildcardTypes: Set<string>;
};

export const ChatFileTypeIcons = new Map(
  Object.entries({
    css: 'file_css',
    csv: 'file_csv',
    doc: 'file_doc',
    docx: 'file_doc',
    htm: 'file_htm',
    html: 'file_html',
    js: 'file_js',
    json: 'file_json',
    pdf: 'file_pdf',
    rtf: 'file_rtf',
    svg: 'file_svg',
    txt: 'file_txt',
    url: 'file_link',
    xls: 'file_xls',
    xlsx: 'file_xls',
    xml: 'file_xml',
    zip: 'file_zip',
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

function isAcceptedFileType(
  file: File,
  accepted: ChatAcceptedFileTypes | null
): boolean {
  if (!(accepted && file)) {
    return true;
  }

  const { extensions, mimeTypes, wildcardTypes } = accepted;
  const fileType = file.type.toLowerCase();
  const fileExtension = `.${lastOf(file.name.split('.'))?.toLowerCase()}`;
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
  // `getAsFile()` is null during `dragenter`, and such a file counts as accepted.
  return Array.from(event.dataTransfer?.items ?? [])
    .filter((item) => item.kind === 'file')
    .map((item) => item.getAsFile()!)
    .filter((file) => isAcceptedFileType(file, accepted));
}

export function getIconName(fileType?: string) {
  return fileType?.startsWith('image') ? 'attach_image' : 'attach_document';
}

const fileURLs = new WeakMap<File, string>();

/** The object URL of `file`, created once. */
export function getFileURL(file: File): string {
  return getOrInsertComputed(fileURLs, file, URL.createObjectURL);
}

/** Revokes the object URL of `file`, if {@link getFileURL} created one. */
export function revokeFileURL(file: File): void {
  const url = fileURLs.get(file);

  if (url) {
    URL.revokeObjectURL(url);
    fileURLs.delete(file);
  }
}

export function createAttachmentURL(
  attachment: IgcChatMessageAttachment
): string {
  if (attachment.file) {
    return getFileURL(attachment.file);
  }

  return attachment.url || '';
}

/** The extension of a file name, or an empty string. Accepts a missing name from untyped data. */
export function getFileExtension(name?: string): string {
  const parts = name?.split('.') ?? [];
  return parts.length > 1 ? lastOf(parts) : '';
}

export function isImageAttachment(
  attachment: IgcChatMessageAttachment | File
): boolean {
  if (attachment instanceof File) {
    return attachment.type.startsWith('image/');
  }

  return Boolean(
    attachment.type === 'image' || attachment.file?.type.startsWith('image/')
  );
}
