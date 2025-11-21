import React from "react";
import { FaSearch, FaLink, FaPaperPlane, FaWhatsapp } from "react-icons/fa";

export default function SearchPanel({
  searchQuery,
  onSearchChange,
  isSharedView,
  displayedCount,
  filteredCount,
  setIsSharedView,
  copyShareUrl,
  shareOnWhatsApp,
  onRequestProfiles,
  selectedCount,
  onClearSelections,
}) {
  return (
    <div className="p-3 bg-white rounded-3 shadow-sm mb-3 search-card">
      <div className="fw-semibold mb-2">Search</div>
      <div className="input-group mb-2">
        <span className="input-group-text bg-white border-end-0">
          <FaSearch />
        </span>
        <input
          type="text"
          placeholder="Search name, skill, location"
          aria-label="Search"
          className="form-control border-start-0"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
        {isSharedView ? (
          <>
            Showing {displayedCount} selected candidate
            {displayedCount === 1 ? "" : "s"}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary ms-2"
              onClick={() => setIsSharedView(false)}
            >
              Show All
            </button>
          </>
        ) : (
          <>Showing {filteredCount} candidates</>
        )}
      </div>
      <div className="mt-3 d-flex flex-wrap gap-2 search-actions">
        <button
          className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
          onClick={copyShareUrl}
          disabled={selectedCount === 0}
        >
          <FaLink /> Share Selected
        </button>
        <button
          className="btn btn-sm btn-success d-flex align-items-center gap-1"
          onClick={shareOnWhatsApp}
          disabled={selectedCount === 0}
        >
          <FaWhatsapp /> WhatsApp Share
        </button>
        <button
          className="btn btn-sm btn-primary d-flex align-items-center gap-2"
          onClick={onRequestProfiles}
          disabled={selectedCount === 0}
        >
          <FaPaperPlane />
          <span>Request Profiles</span>
          {selectedCount > 0 && (
            <span className="badge bg-light text-primary">{selectedCount}</span>
          )}
        </button>
        {selectedCount > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={onClearSelections}
          >
            Unselect All
          </button>
        )}
      </div>
      {selectedCount > 0 && (
        <div className="mt-2 small">Selected: {selectedCount}</div>
      )}
    </div>
  );
}
