import { useEffect, useMemo, useState } from 'react';
import { useNouter } from '../../services/nouter';
import { getPublicDocument } from '../../services/api';
import { parseMarkdown } from '../../docs/lib/index';
import { blockHtml } from '../../docs/lib/block-html';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function renderDoc(body) {
  const doc = parseMarkdown(body);
  return doc.blocks.map((b) => blockHtml(b)).join('\n');
}

export default function PublicDocumentView() {
  const { params } = useNouter();
  const slug = params?.slug;
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;
    setError(null);
    setData(null);
    getPublicDocument({ slug, username: params?.username })
      .then((r) => {
        if (r.status === 200) return r.json();
        if (r.status === 404) throw new Error('Document not found');
        throw new Error('Failed to load document');
      })
      .then((json) => setData(json.documents))
      .catch((e) => setError(e.message));
  }, [slug]);

  const html = useMemo(() => (data ? renderDoc(data.body || '') : ''), [data]);

  if (error) {
    return (
      <div className="documents-welcome">
        <h2>Document not found</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="documents-loading">Loading...</div>;
  }

  return (
    <div className="doc-view">
      <div className="doc-view-head">
        <h2 className="doc-view-title">{data.title}</h2>
        <div className="doc-view-actions">
          {data.createdByUsername && (
            <a href="/documents" className="label label-default" style={{ textDecoration: 'none' }}>
              by {data.createdByUsername}
            </a>
          )}
        </div>
      </div>
      {(data.createdAt || data.updatedAt) && (
        <div className="doc-view-meta-line">
          {data.createdAt && <span className="doc-view-ts">Created {formatDate(data.createdAt)}</span>}
          {data.updatedAt && data.updatedAt !== data.createdAt && (
            <span className="doc-view-ts">Updated {formatDate(data.updatedAt)}</span>
          )}
        </div>
      )}
      <div className="doc-view-body">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}