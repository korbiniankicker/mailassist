import type { Conversation } from '../../types/conversation';

type Props = {
  conversations: Conversation[];
  activeId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onRefresh: () => void;
  onNew: () => void;
};

export default function ConversationList({ conversations, activeId, loading, onSelect, onDelete, onRefresh, onNew }: Props) {
  return (
    <div className="d-flex flex-column h-100 bg-light p-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong className="small">Conversations</strong>
        <div>
          <button className="btn btn-sm btn-outline-secondary me-1" onClick={onNew} title="New conversation">
            <i className="bi bi-plus-lg"></i>
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={onRefresh} disabled={loading}>
            <i className="bi bi-arrow-clockwise"></i>
          </button>
        </div>
      </div>
      {conversations.length === 0 && !loading && (
        <div className="small text-muted text-center mt-3">No conversations yet</div>
      )}
      {loading && <div className="small text-muted text-center mt-3">Loading…</div>}
      <div className="list-group list-group-flush overflow-auto">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`list-group-item list-group-item-action d-flex align-items-center py-2 px-3 small border-0 ${
              c.id === activeId ? 'active' : ''
            }`}
            onClick={() => onSelect(c.id)}
            role="button"
          >
            <span className="flex-grow-1 text-truncate">{c.title}</span>
            <button
              className="btn btn-sm p-0 ps-2 border-0"
              onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
              title="Delete conversation"
            >
              <i className={`bi bi-trash ${c.id === activeId ? '' : 'text-secondary'}`}></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
