import React from "react";

function SharedSelectionBanner({ count, onExitSharedView }) {
  if (!count) return null;
  return (
    <section className="shared-selection-banner" aria-live="polite">
      <div>
        <p className="shared-selection-title">Viewing a shared shortlist</p>
        <p className="shared-selection-copy">
          {count} candidate{count > 1 ? "s" : ""} pre-selected for you. Use the
          buttons below to add them to your cart or request introductions.
        </p>
      </div>
      <button
        type="button"
        className="btn btn-light"
        onClick={onExitSharedView}
      >
        Browse full talent pool
      </button>
    </section>
  );
}

export default SharedSelectionBanner;
