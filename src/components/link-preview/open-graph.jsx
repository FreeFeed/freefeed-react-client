import { useEffect, useState } from 'react';

export default function OpenGraphPreview({ url }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (url.startsWith(window.location.origin)) {
      return;
    }
    async function fetchData() {
      const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');

      const metaContent = (property) =>
        doc.querySelector(`meta[property="${property}"]`)?.getAttribute('content');

      const [title, description, image, source] = [
        'og:title',
        'og:description',
        'og:image',
        'og:site_name',
      ].map(metaContent);
      setData({ title, description, image, source });
    }
    fetchData();
  }, [url]);
  if (!data || data.title === undefined) {
    return null;
  }

  return (
    <div className="opengraph-preview">
      {data.image && <img className="opengraph-image" src={data.image} alt={data.title} />}
      <div>
        <div className="opengraph-title">{data.title}</div>
        <div className="opengraph-description">{data.description}</div>
        <div className="opengraph-source">{data.source}</div>
      </div>
    </div>
  );
}
