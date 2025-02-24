export const maxEditingPreviewWidth = 400;
export const maxEditingPreviewHeight = 175;
export const minEditingPreviewWidth = 60;
export const minEditingPreviewHeight = 60;

export function fitIntoBox(att, boxWidth, boxHeight, upscale = false) {
  const [width, height] = [att.previewWidth ?? att.width, att.previewHeight ?? att.height];
  if (!upscale) {
    boxWidth = Math.min(boxWidth, width);
    boxHeight = Math.min(boxHeight, height);
  }
  const wRatio = width / boxWidth;
  const hRatio = height / boxHeight;

  if (wRatio > hRatio) {
    return { width: boxWidth, height: Math.round(height / wRatio) };
  }

  return { width: Math.round(width / hRatio), height: boxHeight };
}
