/**
 * @param {{ url: string }} param0
 * @returns {boolean}
 */
export function canShowPdf({ url }) {
  try {
    const urlObj = new URL(url);
    const path = decodeURIComponent(urlObj.pathname);
    return /\.pdf$/i.test(path);
  } catch {
    return false;
  }
}

export function PdfPreview({ url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="pdf-preview">
      <img
        className="pdf-preview__image"
        src={`https://image.thum.io/get/pdfSource/width/600/page/1/${url}`}
        alt="PDF preview"
      />
      <div className="pdf-preview__icon"></div>
    </a>
  );
}
