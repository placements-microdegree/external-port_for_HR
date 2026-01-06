import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";

/* global globalThis */
import {
  FaBars,
  FaCompass,
  FaFilter,
  FaLayerGroup,
  FaMoon,
  FaSearch,
  FaShoppingCart,
  FaSun,
  FaTimes,
} from "react-icons/fa";
import Logo from "../../assets/Logo.png";

const noop = () => {};

const THEME_STORAGE_KEY = "md-theme";

const readStoredTheme = () => {
  try {
    const stored = globalThis.localStorage?.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
};

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
  const [theme, setTheme] = useState(() => readStoredTheme() || "dark");
  const safeSelectedCount = Number.isFinite(selectedCount) ? selectedCount : 0;
  const safeCollectionsCount = Number.isFinite(collectionsCount)
    ? collectionsCount
    : 0;

  const isDark = theme === "dark";
  const themeIcon = useMemo(
    () =>
      isDark ? <FaSun aria-hidden="true" /> : <FaMoon aria-hidden="true" />,
    [isDark]
  );
  const themeLabel = isDark ? "Switch to light theme" : "Switch to dark theme";

  useEffect(() => {
    try {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
      globalThis.localStorage?.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage or DOM write failures.
    }
  }, [theme]);

  const handleSearchChange = (event) => {
    onSearchChange(event.target.value);
  };

  const handleBrandClick = () => {
    globalThis.location?.reload();
  };

  return (
    <nav className="recruiter-navbar" aria-label="Primary Navigation">
      <button
        type="button"
        className="recruiter-navbar-brand"
        onClick={handleBrandClick}
        aria-label="Reload"
      >
        <img src={Logo} alt="MicroDegree" className="recruiter-navbar-logo" />
        <div>
          <p className="mb-0 recruiter-navbar-title">MicroDegree</p>
          <small className="text-muted">Talent Cloud</small>
        </div>
      </button>

      <button
        type="button"
        className="recruiter-nav-theme recruiter-nav-theme-mobile d-lg-none"
        aria-label={themeLabel}
        title={themeLabel}
        onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
      >
        {themeIcon}
      </button>

      <button
        type="button"
        className="recruiter-nav-hamburger d-lg-none"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? (
          <FaTimes aria-hidden="true" />
        ) : (
          <>
          <FaBars aria-hidden="true" />
         {safeSelectedCount > 0 && (
            <span className="recruiter-nav-pill-hamburger" aria-label="Selected count">
              {safeSelectedCount}
            </span>
          )}
          </>       
          
        )}
        
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
        <button
          type="button"
          className="recruiter-nav-btn recruiter-nav-btn-accent"
          onClick={onBrowse}
        >
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
          className="recruiter-nav-btn recruiter-nav-btn-accent"
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
          className="recruiter-nav-theme d-none d-lg-inline-flex"
          aria-label={themeLabel}
          title={themeLabel}
          onClick={() =>
            setTheme((prev) => (prev === "dark" ? "light" : "dark"))
          }
        >
          {themeIcon}
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

RecruiterNavbar.propTypes = {
  selectedCount: PropTypes.number,
  showSearch: PropTypes.bool,
  collectionsCount: PropTypes.number,
  onBrowse: PropTypes.func,
  onCollections: PropTypes.func,
  onCart: PropTypes.func,
  onFiltersToggle: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
};
