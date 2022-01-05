import { useEffect, useState } from 'react';

const GOOGLE_DOCS_RE =
  /^https?:\/\/(?:docs\.google\.com\/(document|spreadsheets|presentation)\/d\/|(drive)\.google\.com\/(?:file\/d\/|open\?id=))([\w-]+)/i;

export function canShowURL(url) {
  return GOOGLE_DOCS_RE.test(url);
}

const defaultAspectRatio = 2.2;
const maxAspectRatio = 1.5;

export default function GoogleDocsPreview({ url }) {
  const [, t1, t2, id] = GOOGLE_DOCS_RE.exec(url);
  const type = t1 || t2;

  const [aspectRatio, setAspectRatio] = useState(defaultAspectRatio);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => (setPreview(img.src), setAspectRatio(img.width / img.height));
    img.onerror = () => setError(true);
    const imgWidth = 500 * zoomRate(type);
    img.src = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
      id,
    )}&authuser=0&sz=w${imgWidth}`;
  }, [id, type]);

  if (error) {
    return null;
  }

  return (
    <div className="google-docs-preview link-preview-content">
      <div className={`google-docs-label ${type}`} />
      <a
        className="google-docs-inner"
        href={url}
        target="_blank"
        style={{
          backgroundSize: `${zoomRate(type) * 100}%`,
          backgroundImage: preview ? `url(${preview})` : null,
          paddingBottom: `${
            100 / (aspectRatio >= maxAspectRatio ? aspectRatio : defaultAspectRatio)
          }%`,
          backgroundPosition: `center ${55 * aspectRatio * (zoomRate(type) - 1)}%`,
        }}
      />
    </div>
  );
}

function zoomRate(type) {
  if (type === 'document') {
    return 1.2;
  }
  if (type === 'spreadsheets') {
    return 1.1;
  }
  return 1;
}
