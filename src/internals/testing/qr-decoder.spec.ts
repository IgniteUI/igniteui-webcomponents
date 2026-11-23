import { prepareZXingModule } from 'zxing-wasm/reader';

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
