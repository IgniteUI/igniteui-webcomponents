export type Direction = 'ltr' | 'rtl' | 'auto';

export interface ElementClipOptions {
  width: number;
  clip: number;
  direction?: 'forward' | 'backward';
  rtl?: boolean;
  exact?: boolean;
  matcher?: number;
}
