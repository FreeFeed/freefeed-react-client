import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Icon } from '../fontawesome-icons';
import { faSave, faTrashAlt, faCode, faDownload, faUpload, faCopy, faLink } from '@fortawesome/free-solid-svg-icons';
import { parseMarkdown } from '../../docs/lib/index';
import { blockHtml } from '../../docs/lib/block-html';
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function DocumentView({ document: doc, onSave, onDelete }) {
  const currentUser = useSelector((state) => state.user);
  const createStatus = useSelector((state) => state.documentCreate);
  const updateStatus = useSelector((state) => state.documentUpdate);

  const userDefaultVis = currentUser?.isPrivate === '1' ? 'private'
    : currentUser?.isProtected === '1' ? 'protected' : 'public';

  const [title, setTitle] = useState(doc.title);
  const [slug, setSlug] = useState(doc.slug);
  const [body, setBody] = useState(doc.body || '');
  const [tags, setTags] = useState(doc.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState(doc.visibility || userDefaultVis);
  const [showTags, setShowTags] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [editStart, setEditStart] = useState(-1);
  const [editEnd, setEditEnd] = useState(-1);
  const [editValue, setEditValue] = useState('');
  const [editMinH, setEditMinH] = useState(40);
  const taRef = useRef(null);
  const bodyRef = useRef(null);
  const fileInputRef = useRef(null);

  const isNew = !doc.id || doc.id === '__sample__';
  const isOwner = doc.createdBy && currentUser && currentUser.id === doc.createdBy;
  const canEdit = isNew || isOwner;
  const markDirty = useCallback(() => setDirty(true), []);
  const username = doc.createdByUsername || (doc.createdBy && currentUser?.username);
  const documentsUrl = username ? `/docs/${username}/${slug}` : `/docs/${slug}`;

  const handleAddTag = useCallback((t) => {
    const tag = t.trim().toLowerCase();
    if (tag && !tags.includes(tag)) { setTags([...tags, tag]); markDirty(); }
  }, [tags, markDirty]);

  useEffect(() => {
    setTitle(doc.title);
    setSlug(doc.slug);
    setBody(doc.body || '');
    setTags(doc.tags || []);
    setVisibility(doc.visibility || userDefaultVis);
    setShowSource(false); setDirty(false);
    setEditStart(-1); setEditEnd(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id, doc.title, doc.slug, doc.body, doc.tags, doc.visibility]);

  useEffect(() => {
    if (!title.trim() && body) {
      const m = body.match(/^#\s+(.+)$/m);
      if (m) setTitle(m[1].trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el || showSource) return;
    const handler = (e) => {
      const cb = e.target.closest('.doc-task-check');
      if (!cb) return;
      e.preventDefault();
      const blockEl = cb.closest('[data-start]');
      if (!blockEl) return;
      const start = parseInt(blockEl.dataset.start, 10);
      const end = parseInt(blockEl.dataset.end, 10);
      if (isNaN(start) || isNaN(end)) return;
      const lines = body.split('\n');
      for (let j = start; j < end; j++) {
        const line = lines[j];
        const idx = line.indexOf('- [');
        if (idx >= 0) {
          const close = line.indexOf(']', idx);
          if (close >= 0) {
            const checked = line[idx + 3] === 'x' ? ' ' : 'x';
            lines[j] = line.slice(0, idx + 3) + checked + line.slice(idx + 4);
            setBody(lines.join('\n')); markDirty(); break;
          }
        }
      }
    };
    el.addEventListener('click', handler);
    return () => el.removeEventListener('click', handler);
  }, [body, showSource, markDirty]);

  const startBlockEdit = useCallback((block, e) => {
    if (!canEdit) return;
    if (e?.target?.tagName === 'INPUT' && e.target.type === 'checkbox') return;
    const lines = body.split('\n');
    setEditStart(block.start); setEditEnd(block.end);
    setEditValue(lines.slice(block.start, block.end).join('\n'));
    if (e) { const h = e.currentTarget.offsetHeight; if (h > 0) setEditMinH(h); }
    setTimeout(() => { if (taRef.current) { taRef.current.focus(); taRef.current.setSelectionRange(taRef.current.value.length, taRef.current.value.length); } }, 0);
  }, [body, canEdit]);

  const finishEdit = useCallback((save) => {
    if (editStart < 0) return;
    if (save && editValue) {
      const newLines = editValue.replace(/\n+$/, '').split('\n');
      const lines = body.split('\n');
      lines.splice(editStart, editEnd - editStart, ...newLines);
      setBody(lines.join('\n')); markDirty();
    }
    setEditStart(-1); setEditEnd(-1); setEditValue('');
  }, [editStart, editEnd, editValue, body, markDirty]);

  const handleEditKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { e.stopPropagation(); finishEdit(false); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); finishEdit(true); }
  }, [finishEdit]);

  const handleSave = useCallback(() => {
    const saveTitle = title.trim() || 'Untitled';
    onSave({ title: saveTitle, slug, body, tags, visibility, isPublished: true });
  }, [title, slug, body, tags, visibility, onSave]);

  const handleExportMd = useCallback(() => {
    const blob = new Blob([body], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (title || 'document').replace(/[^a-z0-9_-]/gi, '_') + '.md';
    a.click(); URL.revokeObjectURL(url);
  }, [body, title]);

  const handleCopyBody = useCallback(() => { navigator.clipboard.writeText(body).catch(() => {}); }, [body]);
  const handleCopyUrl = useCallback(() => { navigator.clipboard.writeText(`${window.location.origin}${documentsUrl}`).catch(() => {}); }, [documentsUrl]);

  const handleImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setBody(text);
      const headingMatch = text.match(/^#\s+(.+)$/m);
      const baseName = file.name.replace(/\.(md|markdown)$/i, '');
      const source = headingMatch?.[1]?.trim() || baseName;
      const auto = source.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-').substring(0, 200) || 'imported';
      setSlug(auto);
      setTitle(headingMatch?.[1]?.trim() || baseName || 'Imported');
      markDirty();
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [markDirty]);

  const docData = useMemo(() => parseMarkdown(body), [body]);
  const blocks = docData.blocks;
  const isEditing = editStart >= 0;
  const showTimestamps = doc.id && doc.id !== '__sample__' && (doc.createdAt || doc.updatedAt);
  const saveErrorMsg = (isNew ? createStatus : updateStatus).errorText;

  return (
    <div className="doc-view">
      <div className="doc-view-head">
        {canEdit ? (
          <input className="doc-head-title" value={title} onChange={(e) => { setTitle(e.target.value); markDirty(); }} placeholder="Document title" />
        ) : (
          <h2 className="doc-view-title">{title}</h2>
        )}
        <div className="doc-view-actions">
          {canEdit && (
            <>
              <button className="btn btn-xs btn-link" onClick={() => setShowSource(!showSource)}><Icon icon={faCode} /></button>
              {dirty && <button className="btn btn-sm btn-primary" onClick={handleSave}><Icon icon={faSave} /> Save</button>}
              {onDelete && <button className="btn btn-sm btn-danger" onClick={() => onDelete(doc.id)}><Icon icon={faTrashAlt} /></button>}
            </>
          )}
        </div>
      </div>

      {saveErrorMsg && <div className="alert alert-danger" style={{ margin: 0, borderRadius: 0 }}>{saveErrorMsg}</div>}

      {showTimestamps && (
        <div className="doc-view-meta-line">
          {doc.createdAt && <span className="doc-view-ts">Created {formatDate(doc.createdAt)}</span>}
          {doc.updatedAt && doc.updatedAt !== doc.createdAt && <span className="doc-view-ts">Updated {formatDate(doc.updatedAt)}</span>}
        </div>
      )}

      <div className="doc-view-toolbar">
        <button className="btn btn-xs btn-link" onClick={handleCopyBody} title="Copy markdown"><Icon icon={faCopy} /> Copy</button>
        <button className="btn btn-xs btn-link" onClick={handleExportMd} title="Download .md"><Icon icon={faDownload} /> Export</button>
        {canEdit && (
          <>
            <button className="btn btn-xs btn-link" onClick={() => fileInputRef.current?.click()}><Icon icon={faUpload} /> Import</button>
            <input ref={fileInputRef} type="file" accept=".md,.markdown,text/markdown" style={{ display: 'none' }} onChange={handleImportFile} />
          </>
        )}

        {canEdit && (
          <div className="doc-slug-inline">
            <span className="doc-slug-label">/docs/{username || '…'}/</span>
            <input className="form-control input-sm doc-slug-input" value={slug}
              onChange={(e) => { setSlug(e.target.value.replace(/[^a-zA-Z0-9\u0400-\u04FF-]/g, '').substring(0, 200)); markDirty(); }}
              placeholder="slug" />
          </div>
        )}

        {canEdit && (
          <select className="form-control input-sm doc-vis-select" value={visibility} onChange={(e) => { setVisibility(e.target.value); markDirty(); }}>
            <option value="public">Public</option>
            <option value="protected">Protected</option>
            <option value="private">Private</option>
          </select>
        )}

        {!canEdit && visibility !== 'public' && <span className="label label-warning">{visibility}</span>}

        {canEdit && (
          <button className="btn btn-xs btn-link" onClick={() => setShowTags(!showTags)} title="Edit tags">
            {tags.length > 0 ? tags.map((t) => `#${t}`).join(' ') : '+ tags'}
          </button>
        )}

        {doc.id !== '__sample__' && (
          <button className="btn btn-xs btn-link" onClick={handleCopyUrl} title="Copy URL"><Icon icon={faLink} /> URL</button>
        )}
        {doc.id !== '__sample__' && (
          <a className="doc-view-toolbar-url" href={documentsUrl} target="_blank" rel="noopener">{documentsUrl}</a>
        )}
      </div>

      {showTags && canEdit && (
        <div className="doc-view-settings">
          <div className="doc-view-settings-inner">
            <div className="doc-setting-group">
              <label>Tags</label>
              <div className="doc-tags-edit">
                {tags.map((t) => (
                  <span key={t} className="label label-primary">
                    {t}
                    <button className="doc-tag-x" onClick={() => { setTags(tags.filter((x) => x !== t)); markDirty(); }}>&times;</button>
                  </span>
                ))}
                <div className="doc-tag-add">
                  <input className="form-control input-sm" value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); if (tagInput.trim()) { handleAddTag(tagInput); setTagInput(''); } } }}
                    placeholder="Add tag..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="doc-view-body" ref={showSource ? null : bodyRef}>
        {showSource ? (
          <textarea className="doc-source-textarea" value={body} onChange={(e) => { setBody(e.target.value); markDirty(); }} spellCheck />
        ) : blocks.length === 0 ? (
          <div className="doc-block doc-block-empty doc-block-clickable" onClick={() => { if (canEdit) setShowSource(true); }}>
            {canEdit ? 'Empty document \u2014 click here to start writing\u2026' : 'Empty document'}
          </div>
        ) : (
          blocks.map((block, i) => {
            const isThisEditing = isEditing && block.start === editStart && block.end === editEnd;
            if (isThisEditing) {
              return (
                <div key={i} className="doc-block doc-block-editing">
                  <textarea ref={taRef} className="doc-block-textarea" value={editValue} style={editStart >= 0 ? { minHeight: editMinH + 'px' } : undefined}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => finishEdit(true)}
                    onKeyDown={handleEditKeyDown} spellCheck />
                </div>
              );
            }
            const html = blockHtml(block);
            if (block.type === 'hr') {
              return <div key={i} className="doc-block doc-block-hr" data-start={block.start} data-end={block.end} onClick={(e) => startBlockEdit(block, e)}><hr /></div>;
            }
            const isEmpty = block.type === 'paragraph' && block.lines.length === 1 && block.lines[0].trim() === '';
            return (
              <div key={i}
                className={`doc-block${isEmpty ? ' doc-block-empty' : ''}${canEdit ? ' doc-block-clickable' : ''}`}
                data-start={block.start} data-end={block.end}
                onClick={(e) => startBlockEdit(block, e)}
                title={canEdit ? 'Click to edit' : undefined}
                dangerouslySetInnerHTML={{ __html: html }} />
            );
          })
        )}
      </div>

      {canEdit && !showSource && !isEditing && blocks.length > 0 && (
        <div className="doc-view-footer">
          <button className="btn btn-xs btn-link" onClick={() => {
            const zws = '\u200B'; const lines = body === '' ? [zws] : body.split('\n').concat('', zws);
            setBody(lines.join('\n')); markDirty();
          }}>+ Add paragraph</button>
        </div>
      )}
    </div>
  );
}