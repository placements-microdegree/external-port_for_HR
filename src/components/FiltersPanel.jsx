import React from "react";

export default function FiltersPanel({
  filters,
  setFilters,
  onClear,
  onClose,
}) {
  const toggleSet = (key, value) => {
    setFilters((prev) => {
      const next = new Set(prev[key]);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return { ...prev, [key]: next };
    });
  };

  const toggleTopCandidate = () => {
    setFilters((prev) => ({
      ...prev,
      topCandidate: !prev.topCandidate,
    }));
  };

  const EXP_OPTIONS = [
    { id: "fresher", label: "0–6 months" },
    { id: "early", label: "6 months – 2 years" },
    { id: "mid", label: "2 – 4 years" },
    { id: "4to5", label: "4 – 5 years" },
    { id: "5to7", label: "5 – 7 years" },
    { id: "7to10", label: "7 – 10 years" },
    { id: "10plus", label: "10+ years" },
  ];

  const ROLE_OPTIONS = [
    "Cloud Professional",
    "DevOps Engineer",
    "AWS Cloud Engineer",
    "System Administrator",
    "Platform Engineer",
    "SRE",
    "Linux Admin",
  ];

  const SKILL_OPTIONS = [
    "CI/CD",
    "Linux and Networking",
    "Docker",
    "Kubernetes",
    "Terraform",
    "EC2",
    "VPC",
    "Subnets",
    "NAT",
    "Security Groups",
    "Monitoring tools: Grafana",
    "Monitoring tools: Prometheus",
    "Shell scripting",
    "Lambda",
    "IAM",
    "Roles",
    "Policies",
  ];

  const CERTS = [
    "Azure foundations",
    "AWS solution architect",
    "Scrum Master",
    "Devops Engineer",
    "Microsoft Azure Fundamentals",
  ];

  const NOTICE_OPTIONS = [
    "Immediate",
    "<15 Days",
    "30 Days",
    "60 Days",
    "90 Days",
  ];

  const LOCATIONS = [
    "Bangalore",
    "Pune",
    "Mumbai",
    "Hyderabad",
    "chennai",
    "kolkatta",
    "Anywhere In India",
  ];

  const WORK_MODES = ["Hybrid", "Office", "Remote"];

  const activeFilterChips = [];

  filters.experience.forEach((value) => {
    const option = EXP_OPTIONS.find((opt) => opt.id === value);
    activeFilterChips.push({
      key: `experience-${value}`,
      label: `Exp: ${option ? option.label : value}`,
      onRemove: () => toggleSet("experience", value),
    });
  });

  filters.roles.forEach((value) => {
    activeFilterChips.push({
      key: `role-${value}`,
      label: `Role: ${value}`,
      onRemove: () => toggleSet("roles", value),
    });
  });

  filters.skills.forEach((value) => {
    activeFilterChips.push({
      key: `skill-${value}`,
      label: `Skill: ${value}`,
      onRemove: () => toggleSet("skills", value),
    });
  });

  filters.certs.forEach((value) => {
    activeFilterChips.push({
      key: `cert-${value}`,
      label: `Cert: ${value}`,
      onRemove: () => toggleSet("certs", value),
    });
  });

  filters.notice.forEach((value) => {
    activeFilterChips.push({
      key: `notice-${value}`,
      label: `Notice: ${value}`,
      onRemove: () => toggleSet("notice", value),
    });
  });

  filters.locations.forEach((value) => {
    activeFilterChips.push({
      key: `location-${value}`,
      label: `Location: ${value}`,
      onRemove: () => toggleSet("locations", value),
    });
  });

  filters.workModes.forEach((value) => {
    activeFilterChips.push({
      key: `workmode-${value}`,
      label: `Work Mode: ${value}`,
      onRemove: () => toggleSet("workModes", value),
    });
  });

  if (filters.topCandidate) {
    activeFilterChips.push({
      key: "topCandidate",
      label: "🏅 Top Candidates Only",
      onRemove: toggleTopCandidate,
    });
  }

  return (
    <div className="filters-panel p-3 rounded-3 shadow-sm ">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0 fw-bold">Filters</h5>
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={onClear}
          >
            Clear All
          </button>
          {typeof onClose === "function" && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary filters-close-btn"
              onClick={onClose}
              aria-label="Close filters"
              title="Close"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {activeFilterChips.length > 0 && (
        <div className="active-filter-chips mb-3" aria-label="Active filters">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className="filter-chip"
              onClick={chip.onRemove}
              aria-label={`Remove ${chip.label}`}
            >
              <span>{chip.label}</span>
              <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      {/* Highlights */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Highlights</div>
        <button
          type="button"
          className={`btn btn-sm ${
            filters.topCandidate ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={toggleTopCandidate}
          aria-pressed={filters.topCandidate}
        >
          🏅 Top Candidates Only
        </button>
      </section>

      {/* Experience */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Experience</div>
        <div className="d-flex flex-wrap gap-2">
          {EXP_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className={`btn btn-sm ${
                filters.experience.has(opt.id)
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("experience", opt.id)}
              aria-pressed={filters.experience.has(opt.id)}
              aria-label={`Filter experience: ${opt.label}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Primary Role */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Primary Role</div>
        <div className="d-flex flex-wrap gap-2">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              type="button"
              className={`btn btn-sm ${
                filters.roles.has(role) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("roles", role)}
              aria-pressed={filters.roles.has(role)}
              aria-label={`Filter role: ${role}`}
            >
              {role}
            </button>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Skills</div>
        <div className="d-flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-sm ${
                filters.skills.has(s) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("skills", s)}
              aria-pressed={filters.skills.has(s)}
              aria-label={`Filter skill: ${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Certifications</div>
        <div className="d-flex flex-wrap gap-2">
          {CERTS.map((c) => (
            <button
              key={c}
              type="button"
              className={`btn btn-sm ${
                filters.certs.has(c) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("certs", c)}
              aria-pressed={filters.certs.has(c)}
              aria-label={`Filter certification: ${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Notice Period */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Notice Period</div>
        <div className="d-flex flex-wrap gap-2">
          {NOTICE_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className={`btn btn-sm ${
                filters.notice.has(n) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("notice", n)}
              aria-pressed={filters.notice.has(n)}
              aria-label={`Filter notice period: ${n}`}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Preferred Location */}
      <section className="mb-3">
        <div className="fw-semibold mb-2">Preferred Location</div>
        <div className="d-flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <button
              key={l}
              type="button"
              className={`btn btn-sm ${
                filters.locations.has(l) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("locations", l)}
              aria-pressed={filters.locations.has(l)}
              aria-label={`Filter location: ${l}`}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* Work Mode */}
      <section className="mb-2">
        <div className="fw-semibold mb-2">Work Mode</div>
        <div className="d-flex flex-wrap gap-2">
          {WORK_MODES.map((m) => (
            <button
              key={m}
              type="button"
              className={`btn btn-sm ${
                filters.workModes.has(m) ? "btn-primary" : "btn-outline-primary"
              }`}
              onClick={() => toggleSet("workModes", m)}
              aria-pressed={filters.workModes.has(m)}
              aria-label={`Filter work mode: ${m}`}
            >
              {m}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
