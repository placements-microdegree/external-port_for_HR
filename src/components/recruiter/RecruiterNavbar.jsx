import React, { useState } from "react";
import {
  FaBars,
  FaCompass,
  FaFilter,
  FaLayerGroup,
  FaSearch,
  FaShoppingCart,
} from "react-icons/fa";
import Logo from "../../assets/Logo.png";

const noop = () => {};

export default function RecruiterNavbar({
  selectedCount = 0,
  showSearch = true,
  collectionsCount = 0,
  onBrowse = noop,
  onCollections = noop,
  onCart = noop,
  onFiltersToggle = noop,
  searchValue = "",
  onSearchChange = noop,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const safeSelectedCount = Number.isFinite(selectedCount) ? selectedCount : 0;
  const safeCollectionsCount = Number.isFinite(collectionsCount)
    ? collectionsCount
    : 0;

  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <nav className="recruiter-navbar" aria-label="Primary Navigation">
      <div className="recruiter-navbar-brand">
        <img src={Logo} alt="MicroDegree" className="recruiter-navbar-logo" />
        <div>
          <p className="mb-0 recruiter-navbar-title">MicroDegree</p>
          <small className="text-muted">Talent Cloud</small>
        </div>
      </div>

      <button
        type="button"
        className="recruiter-nav-hamburger d-lg-none"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <FaBars aria-hidden="true" />
      </button>

      {showSearch && (
        <label
          className="recruiter-navbar-search"
          aria-label="Search candidates"
        >
          <FaSearch aria-hidden="true" />
          <input
            type="search"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Sear ch by name, skill, experience"
          />
        </label>
      )}

      <div className={`recruiter-navbar-actions${menuOpen ? " is-open" : ""}`}>
        <button type="button" className="recruiter-nav-btn" onClick={onBrowse}>
          <FaCompass aria-hidden="true" />
          <span>Browse Talent</span>
        </button>
        <button
          type="button"
          className="recruiter-nav-btn recruiter-nav-filter-btn"
          onClick={onFiltersToggle}
        >
          <FaFilter aria-hidden="true" />
          <span>Filters</span>
        </button>
        <button
          type="button"
          className="recruiter-nav-btn"
          onClick={onCollections}
        >
          <FaLayerGroup aria-hidden="true" />
          <span>Top Collections</span>
          {safeCollectionsCount > 0 && (
            <span className="recruiter-nav-pill" aria-label="Selected count">
              {safeCollectionsCount}
            </span>
          )}
        </button>
        <button
          type="button"
          className="recruiter-nav-cart"
          onClick={onCart}
          aria-label="View selected candidates"
        >
          <FaShoppingCart aria-hidden="true" />
          {safeSelectedCount > 0 && (
            <span className="recruiter-nav-pill" aria-label="Selected count">
              {safeSelectedCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
