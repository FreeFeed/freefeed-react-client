/**
 * Convert 'image/png' blob to 'image/jpeg' blob if:
 * 1) The PNG size is more than 50 KiB and
 * 2) JPEG size is less than half the PNG size.
 *
 * The returning promise is never failed and returns
 * either JPEG or the original PNG.
 *
 * @param {Blob} blob
 * @returns {Promise<Blob>}
 */
export async function makeJpegIfNeeded(blob) {
  if (blob.type !== 'image/png' || blob.size < 50 * 1024) {
    return blob;
  }

  const src = window.URL.createObjectURL(blob);
  try {
    const image = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('Cannot load image'));
      image.src = src;
    });

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    jpeg.name = blob.name.replace(/\.png$/, '.jpg');

    if (jpeg.size < blob.size / 2) {
      return jpeg;
    }
  } catch (e) {
    // skip any errors
  } finally {
    window.URL.revokeObjectURL(src);
  }
  return blob;
}
