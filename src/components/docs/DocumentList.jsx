import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Icon } from '../fontawesome-icons';
import {
  faFile,
  faFolder,
  faFolderOpen,
  faPlus,
  faTag,
  faChevronRight,
  faChevronDown,
  faBars,
} from '@fortawesome/free-solid-svg-icons';

import { getDocumentTree } from '../../redux/action-creators';
import { Throbber } from '../throbber';

function TreeItem({ node, depth, selectedId, onSelect }) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children?.length > 0;

  useEffect(() => {
    if (node.id === selectedId) {
      setExpanded(true);
    }
  }, [node.id, selectedId]);

  return (
    <div className="doc-tree-item" style={{ paddingLeft: `${8 + depth * 16}px` }}>
      {hasChildren ? (
        <button className="doc-tree-toggle" onClick={() => setExpanded(!expanded)}>
          <Icon icon={expanded ? faChevronDown : faChevronRight} />
        </button>
      ) : (
        <span className="doc-tree-toggle doc-tree-toggle-spacer" />
      )}
      <button
        className={`doc-tree-label${node.id === selectedId ? ' active' : ''}`}
        onClick={() => onSelect(node.id)}
        title={node.title}
      >
        <Icon icon={hasChildren ? (expanded ? faFolderOpen : faFolder) : faFile} />
        <span className="doc-tree-label-text">{node.title}</span>
        {node.tags?.slice(0, 1).map((t) => (
          <span key={t} className="label label-default doc-tree-tag">{t}</span>
        ))}
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function DocumentList({ onSelect, onCreate, selectedId, refreshKey }) {
  const dispatch = useDispatch();
  const treeStatus = useSelector((state) => state.documentsTree);
  const treeData = useSelector((state) => state.documentsTreeData);
  const [showTree, setShowTree] = useState(false);
  const panelRef = useRef(null);

  // Refresh tree whenever the Browse panel opens
  useEffect(() => {
    if (showTree) dispatch(getDocumentTree());
  }, [showTree, dispatch]);

  // Also refresh when refreshKey increments (mutation happened)
  useEffect(() => {
    dispatch(getDocumentTree());
  }, [refreshKey, dispatch]);
  useEffect(() => {
    if (!showTree) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowTree(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showTree]);

  const tree = treeData?.tree || [];

  if (treeStatus.error) {
    return <div className="doc-topbar alert alert-danger">Failed to load documents</div>;
  }

  return (
    <div className="doc-topbar" ref={panelRef}>
      <div className="doc-topbar-row">
        <button className="btn btn-sm btn-default" onClick={() => setShowTree(!showTree)}>
          <Icon icon={faBars} /> Browse
        </button>
        {selectedId && (
          <span className="doc-topbar-path">
            {treeData && (() => {
              const find = (nodes) => {
                for (const n of nodes) {
                  if (n.id === selectedId) return n.title;
                  if (n.children) {
                    const found = find(n.children);
                    if (found) return found;
                  }
                }
                return null;
              };
              return find(tree) || 'Document';
            })()}
          </span>
        )}
        <div className="doc-topbar-actions">
          <button className="btn btn-sm btn-primary" onClick={onCreate}>
            <Icon icon={faPlus} /> New Document
          </button>
        </div>
      </div>

      {showTree && (
        <div className="doc-tree-panel">
          {treeStatus.loading ? (
            <div className="doc-tree-loading"><Throbber /></div>
          ) : tree.length === 0 ? (
            <div className="doc-tree-empty">No documents yet</div>
          ) : (
            <div className="doc-tree-scroll">
              {tree.map((node) => (
                <TreeItem key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={(id) => { onSelect(id); setShowTree(false); }} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}