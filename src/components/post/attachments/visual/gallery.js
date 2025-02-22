/**
 * @typedef {{width: number, height: number}[]} GalleryRow
 */

import { fitIntoBox } from './geometry';

export const gap = 8;
const previewArea = 250 ** 2; // px^2
export const singleImagePreviewArea = 400 ** 2; // px^2, 16:9 with 300px height
const maxHeight = 330;
const minSize = 40; // Minimum size of image placeholder side
const maxStretch = 1.5; // Maximum average stretch on a line
const stretchGap = 20;

export function getSingleImageSize(att, containerWidth) {
  const { width, height } = fitIntoBox(att, containerWidth, maxHeight);

  const area = width * height;
  if (area < singleImagePreviewArea) {
    return {
      width: Math.max(width, minSize),
      height: Math.max(height, minSize),
    };
  }
  const ratio = Math.sqrt(singleImagePreviewArea / area);

  return {
    width: Math.max(Math.round(width * ratio), minSize),
    height: Math.max(Math.round(height * ratio), minSize),
  };
}

/**
 * @param {{width: number, height: number}[]} imageSizes
 * @param {number} containerWidth
 * @param {number} desiredArea
 * @returns {GalleryRow}
 */
export function getGallerySizes(imageSizes, containerWidth) {
  let start = 0;
  const lines = [];
  while (start < imageSizes.length) {
    const line = getGalleryLine(imageSizes.slice(start), containerWidth);
    lines.push(line);
    if (line.items.length === 0) {
      // Prevent infinite loop
      throw new Error('Empty gallery line');
    }
    start += line.items.length;
  }
  return lines;
}

/**
 * @param {{width: number, height: number}[]} imageSizes
 * @param {number} containerWidth
 * @param {number} maxHeight
 * @param {number} gap
 * @param {number} desiredArea
 * @returns {GalleryRow}
 */
function getGalleryLine(imageSizes, containerWidth) {
  if (containerWidth < Math.sqrt(previewArea)) {
    // A very narrow container (or just the first render), leave only the first item
    const { width, height } = fitIntoBox(imageSizes[0], containerWidth, maxHeight);
    return {
      items: [{ width: Math.max(width, minSize), height: Math.max(height, minSize) }],
      stretched: true,
    };
  }

  let bestQuality = Infinity;
  let bestHeight = maxHeight;
  let results;
  for (let n = 1; n <= imageSizes.length; n++) {
    results = imageSizes.slice(0, n);
    const availableWidth = containerWidth - (n - 1) * gap;

    const height = findRowHeight(results, availableWidth, maxHeight, minSize);

    let quality = Infinity;
    const resultsWidth = getRowWidths(results, height);
    if (resultsWidth <= availableWidth) {
      const avgArea = (resultsWidth * height) / n;
      quality =
        Math.abs(Math.log(avgArea / previewArea)) +
        Math.abs((resultsWidth - availableWidth) / Math.sqrt(previewArea));
    }

    if (quality < bestQuality) {
      bestQuality = quality;
      bestHeight = height;
    } else {
      results.pop();
      break;
    }
  }

  let items = getRowSizes(results, bestHeight);
  const width = items.reduce((sum, it) => sum + it.width, 0);
  let stretched = width > containerWidth - gap * (items.length - 1) - stretchGap;

  const stretch = (width * bestHeight) / items.length / previewArea;
  if (stretch > maxStretch) {
    const height = bestHeight / Math.sqrt(stretch);
    items = getRowSizes(results, height);
    stretched = false;
  }

  return {
    items,
    stretched,
  };
}

/**
 * @param {{width: number, height: number}[]} imageSizes
 * @param {number} height
 * @returns {{width: number, height: number}[]}
 */
function getRowSizes(imageSizes, height) {
  return imageSizes.map((it) => {
    if (it.height <= height) {
      return { width: Math.max(it.width, minSize), height: Math.max(it.height, minSize) };
    }
    return { width: Math.max((it.width * height) / it.height, minSize), height };
  });
}

/**
 * @param {{width: number, height: number}[]} imageSizes
 * @param {number} height
 * @returns {number}
 */
function getRowWidths(imageSizes, height) {
  return getRowSizes(imageSizes, height).reduce((sum, it) => sum + it.width, 0);
}

function findRowHeight(imageSizes, availableWidth, maxHeight, minHeight) {
  // First try with maxHeight
  if (getRowWidths(imageSizes, maxHeight) <= availableWidth) {
    return maxHeight;
  }

  // Next try with binary search
  let low = minHeight;
  let high = maxHeight;

  while (low + 1 < high) {
    const mid = Math.floor((low + high) / 2);
    if (getRowWidths(imageSizes, mid) <= availableWidth) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return low;
}
