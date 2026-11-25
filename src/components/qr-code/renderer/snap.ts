/**
 * Returns the transform that puts each module of a code of `side` modules on whole pixels of an
 * image of `pixels`, with the spare pixels in the quiet zone. Below 1 pixel per module, it returns
 * `undefined`.
 */
export function snapToPixels(
  pixels: number,
  side: number,
  margin: number
): { transform: string; scale: number } | undefined {
  const modules = side + 2 * margin;
  let modulePixels = Math.floor(pixels / modules);

  // A fractional margin needs whole pixels on both sides.
  if (2 * Math.ceil(margin * modulePixels) + modulePixels * side > pixels) {
    modulePixels--;
  }

  if (!Number.isFinite(modulePixels) || modulePixels < 1) {
    return undefined;
  }

  const start = Math.floor((pixels - modulePixels * side) / 2);
  const scale = (modulePixels * modules) / pixels;
  const offset = (side * (start - modulePixels * margin)) / pixels;

  return { transform: `translate(${offset} ${offset}) scale(${scale})`, scale };
}
