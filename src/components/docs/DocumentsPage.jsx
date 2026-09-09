import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getDocument, getDocumentTree, createDocument, updateDocument, deleteDocument } from '../../redux/action-creators';
import DocumentList from './DocumentList';
import DocumentView from './DocumentView';

const SAMPLE = '# Welcome to Documents\n\nClick any paragraph to edit it in place.\n\n## Getting started\n\nClick any paragraph, heading or list item below to **edit it in place**. Press ⌘⏎ to save, Esc to cancel.\n\n---\n\n## Text formatting\n\n**Bold** and _italic_ text, `inline code`.\n\n> Blockquotes help highlight content.\n\n## Lists\n\n- Bullet lists\n  - Nested items\n- [x] Task lists\n\n1. Numbered lists\n\n## Code\n\n```js\nfunction hello(n) {\n  return `Hello, ${n}!`;\n}\n```\n\n## Table\n\n| Feature | Supported |\n|---------|-----------|\n| Tables  | ✓         |\n\n## Mermaid\n\n```mermaid\ngraph LR\n  A[Start] --> B{Edit?}\n  B -->|Yes| C[Click]\n```\n\n---\n\n**Click anything above to start editing.**';

const SAMPLE_DOC = { id: '__sample__', title: 'Getting Started', slug: 'getting-started', body: SAMPLE, tags: ['help'], createdBy: null };

export default function DocumentsPage() {
  const dispatch = useDispatch();
  const [selectedId, setSelectedId] = useState(null);
  const [editingNew, setEditingNew] = useState(false);
  const [showSample, setShowSample] = useState(true);
  const [treeKey, setTreeKey] = useState(0); // triggers tree refresh

  const documentData = useSelector((state) => state.documentGetData);
  const createData = useSelector((state) => state.documentCreateData);

  useEffect(() => { if (treeKey > 0) dispatch(getDocumentTree()); }, [treeKey, dispatch]);

  useEffect(() => {
    if (createData?.id) { setSelectedId(createData.id); setShowSample(false); dispatch(getDocument(createData.id)); }
  }, [createData, dispatch]);

  useEffect(() => {
    if (selectedId && !editingNew && !showSample) dispatch(getDocument(selectedId));
  }, [selectedId, editingNew, showSample, dispatch]);

  const refresh = useCallback(() => setTreeKey((k) => k + 1), []);

  const handleCreate = useCallback(() => { setEditingNew(true); setSelectedId(null); setShowSample(false); }, []);
  const handleSelect = useCallback((id) => { setSelectedId(id); setEditingNew(false); setShowSample(false); }, []);

  const handleSave = useCallback((params) => {
    if (editingNew || showSample || selectedId === '__sample__') {
      dispatch(createDocument({ ...params, title: params.title || 'Untitled' }));
      setEditingNew(false);
    } else {
      dispatch(updateDocument({ docId: selectedId, ...params }));
    }
    refresh();
  }, [selectedId, editingNew, showSample, dispatch, refresh]);

  const handleDelete = useCallback((id) => {
    if (window.confirm('Delete this document?')) {
      dispatch(deleteDocument(id));
      refresh();
      setSelectedId(null);
      setShowSample(true);
    }
  }, [dispatch, refresh]);

  const isLoading = selectedId && selectedId !== '__sample__' && !documentData;

  return (
    <div className="documents-page">
      <DocumentList onSelect={handleSelect} onCreate={handleCreate} selectedId={selectedId} refreshKey={treeKey} />
      <div className="documents-page-section">
        {editingNew ? (
          <DocumentView onSave={handleSave} onDelete={null} document={{ title: '', slug: '', body: '', tags: [], id: null, createdBy: null }} />
        ) : showSample ? (
          <DocumentView onSave={handleSave} onDelete={null} document={SAMPLE_DOC} />
        ) : isLoading ? (
          <div className="documents-loading">Loading...</div>
        ) : selectedId && documentData ? (
          <DocumentView onSave={handleSave} onDelete={handleDelete} document={documentData} />
        ) : (
          <div className="documents-welcome"><h2>Documents</h2><p>Select a document or create a new one.</p></div>
        )}
      </div>
    </div>
  );
}