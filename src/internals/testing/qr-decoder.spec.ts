import {
  prepareZXingModule,
  type ReadResult,
  readBarcodes,
} from 'zxing-wasm/reader';

/** Loads the zxing decoder from the package, not from its default CDN. */
export function prepareQrDecoder(): void {
  prepareZXingModule({
    overrides: {
      locateFile: (path: string, prefix: string) =>
        path.endsWith('.wasm')
          ? '/node_modules/zxing-wasm/dist/reader/zxing_reader.wasm'
          : prefix + path,
    },
  });
}

/** Returns the first QR code that the decoder reads from `image`. */
export async function readQr(
  image: Blob | ImageData
): Promise<ReadResult | undefined> {
  const [result] = await readBarcodes(image, {
    formats: ['QRCode'],
    maxNumberOfSymbols: 1,
  });
  return result;
}

/**
 * Draws a module matrix with 4 pixels for each module and a quiet zone of 4 modules, and
 * returns the bytes that the decoder reads from it.
 */
export async function readQrMatrix(
  matrix: boolean[][]
): Promise<Uint8Array | undefined> {
  const scale = 4;
  const side = (matrix.length + 8) * scale;
  const context = new OffscreenCanvas(side, side).getContext('2d')!;

  context.fillStyle = '#fff';
  context.fillRect(0, 0, side, side);
  context.fillStyle = '#000';

  for (const [row, modules] of matrix.entries()) {
    for (const [col, dark] of modules.entries()) {
      if (dark) {
        context.fillRect((col + 4) * scale, (row + 4) * scale, scale, scale);
      }
    }
  }

  return (await readQr(context.getImageData(0, 0, side, side)))?.bytes;
}
