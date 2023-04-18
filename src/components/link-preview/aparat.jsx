import FoldableContent from './helpers/foldable-content';

const APARAT_RE = /^https:\/\/?(?:www\.)?aparat\.com\/v\/([^/]+)/i;

export function canShowURL(url) {
  return APARAT_RE.test(url);
}

export default function AparatPreview({ url }) {
  const videoId = APARAT_RE.exec(url);

  return (
    <FoldableContent>
      <div className="link-preview-content">
        <iframe
          src={`https://www.aparat.com/video/video/embed/videohash/${videoId[1]}/vt/frame?titleShow=true`}
          allowFullScreen={true}
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
        />
      </div>
    </FoldableContent>
  );
}
