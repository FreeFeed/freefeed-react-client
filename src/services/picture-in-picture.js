/**
 * @returns {boolean} True if Picture-in-Picture is supported, false otherwise.
 */
export function isPiPSupported() {
  return !!document.pictureInPictureEnabled;
}

/**
 * @returns {boolean} True if Document Picture-in-Picture is supported, false otherwise.
 */
export function isDocumentPiPSupported() {
  return 'documentPictureInPicture' in globalThis;
}

/**
 * Opens a Picture-in-Picture window with the specified content and dimensions.
 *
 * @param {string} src The source URL of the content to display in PiP.
 * @param {number} width The initial width of the PiP window.
 * @param {number} height The initial height of the PiP window.
 * @returns {Promise<boolean>} True if the PiP window was successfully opened, false otherwise.
 */
export async function openEmbedPiP(src, width, height) {
  const maxArea = (window.screen.width * window.screen.height) / 16;
  const area = width * height;
  if (area > maxArea) {
    const scale = Math.sqrt(maxArea / area);
    width = Math.floor(width * scale);
    height = Math.floor(height * scale);
  }

  try {
    const pipWindow = await documentPictureInPicture.requestWindow({
      preferInitialWindowPlacement: true,
      width,
      height,
    });
    pipWindow.document.body.style.margin = '0';
    pipWindow.document.body.style.overflow = 'hidden';
    const iframe = pipWindow.document.createElement('iframe');
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    iframe.src = '/pip-embed.html?src=' + encodeURIComponent(src);
    pipWindow.document.body.appendChild(iframe);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  return false;
}
