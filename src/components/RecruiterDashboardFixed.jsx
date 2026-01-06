import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RecruiterDashboard.css";
import { supabase } from "../supabaseClient";
import logo from "../assets/Logo.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaperPlane,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaCheckCircle,
  FaLink,
  FaUserCheck,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { SkillBadge } from "./SkillBadgeDesign";
import FiltersPanel from "./FiltersPanel";

export default function RecruiterDashboardFixed() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeModal, setResumeModal] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    company: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    experience: new Set(),
    roles: new Set(),
    skills: new Set(),
    certs: new Set(),
    notice: new Set(),
    locations: new Set(),
    workModes: new Set(),
  });
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [interestForm, setInterestForm] = useState({
    recruiterName: "",
    recruiterEmail: "",
    recruiterCompany: "",
  });
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) {
        setError("Failed to load candidates");
        toast.error("Error loading candidates");
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sel = params.get("selected");
    if (sel) {
      const ids = sel.split(",").filter(Boolean);
      setSelectedCandidates(new Set(ids));
      setIsSharedView(true);
    }
  }, []);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key)
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      return { key, direction: "asc" };
    });
  };
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort style={{ opacity: 0.4 }} />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };
  const toggleSelection = (id) => {
    setSelectedCandidates((prev) => {
      const ns = new Set(prev);
      const k = String(id);
      if (ns.has(k)) ns.delete(k);
      else ns.add(k);
      return ns;
    });
  };
  const copyShareUrl = () => {
    if (selectedCandidates.size === 0) return;
    const base = window.location.origin + window.location.pathname;
    const url = `${base}?selected=${Array.from(selectedCandidates).join(",")}`;
    navigator.clipboard
      .writeText(url)
      .then(() => toast.success("Share URL copied"));
  };
  const clearAllFilters = () => {
    setFilters({
      experience: new Set(),
      roles: new Set(),
      skills: new Set(),
      certs: new Set(),
      notice: new Set(),
      locations: new Set(),
      workModes: new Set(),
    });
  };
  const closeDetails = () => {
    setShowDetails(false);
    setActiveCandidate(null);
  };

  const submitInterest = async (e) => {
    e.preventDefault();
    if (!activeCandidate) return;
    setInterestSubmitting(true);
    const { error: err } = await supabase
      .from("recruiter_candidate_interest")
      .insert({
        candidate_id: activeCandidate.id,
        recruiter_name: interestForm.recruiterName,
        recruiter_email: interestForm.recruiterEmail,
        recruiter_company: interestForm.recruiterCompany,
      });
    if (err) {
      toast.error("Failed recording interest");
    } else {
      setInterestSuccess(true);
      toast.success("Interest recorded");
    }
    setInterestSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error: err } = await supabase.from("recruiter_requests").insert({
      full_name: formData.fullName,
      email: formData.email,
      contact: formData.contact,
      company: formData.company,
      selected_ids: Array.from(selectedCandidates).join(","),
    });
    if (err) toast.error("Request failed");
    else {
      setFormSubmitted(true);
      toast.success("Request submitted");
    }
  };

  const filteredStudents = useMemo(() => {
    let list = [...students];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) =>
        [
          s.full_name,
          s.primary_skills,
          s.preferred_location,
          s.role,
          s.primary_role,
        ].some((v) => v && String(v).toLowerCase().includes(q))
      );
    }
    if (filters.experience.size > 0) {
      list = list.filter((s) => {
        const exp = parseFloat(s.experience || 0);
        if (filters.experience.has("fresher")) if (exp === 0) return true;
        if (filters.experience.has("early"))
          if (exp > 0 && exp <= 3) return true;
        if (filters.experience.has("mid")) if (exp > 3 && exp <= 7) return true;
        if (filters.experience.has("senior")) if (exp > 7) return true;
        return false;
      });
    }
    if (sortConfig.key) {
      list.sort((a, b) => {
        const av = a[sortConfig.key] ?? "";
        const bv = b[sortConfig.key] ?? "";
        if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
        if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [students, searchQuery, filters, sortConfig]);

  const displayedStudents = useMemo(
    () =>
      isSharedView
        ? filteredStudents.filter((s) => selectedCandidates.has(String(s.id)))
        : filteredStudents,
    [filteredStudents, isSharedView, selectedCandidates]
  );

  return (
    <div className="recruiter-dashboard container-fluid py-3">
      <ToastContainer position="top-right" autoClose={200}/>
      <motion.div
        className="d-flex align-items-center mb-3 gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <motion.div
          className="d-flex justify-content-start align-items-center"
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--surface-1)",
            padding: 6,
          }}
        >
          <img
            src={logo}
            alt="Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </motion.div>
        <div className="text-center text-md-start">
          <h2 className="fw-semibold mb-1" style={{ fontSize: "1.35rem" }}>
            Top <span style={{ color: "#fff" }}>Cloud</span> &{" "}
            <span style={{ color: "#fff" }}>DevOps</span> Talent List
            <span
              style={{ color: "#ffe082", marginLeft: 6, fontSize: "0.9rem" }}
            >
              {new Date().toLocaleString("en-US", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </h2>
          <p className="text-light mb-0" style={{ fontSize: "0.75rem" }}>
            Curated senior & early professionals – fast shortlist
          </p>
        </div>
      </motion.div>

      <div className="row g-4">
        <div className="col-12 col-lg-3">
          <div className="sidebar-stack w-100 d-flex flex-column">
            <div className="p-3 bg-white rounded-3 shadow-sm mb-3">
              <div className="fw-semibold mb-2">Search</div>
              <div className="input-group mb-2">
                <span
                  className="input-group-text bg-white border-end-0"
                  aria-hidden="true"
                >
                  <FaSearch />
                </span>
                <input
                  type="text"
                  placeholder="Search name, skill, location"
                  aria-label="Search"
                  className="form-control border-start-0"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="small text-muted d-flex align-items-center gap-2 flex-wrap">
                {isSharedView ? (
                  <>
                    Showing {displayedStudents.length} selected candidate
                    {displayedStudents.length === 1 ? "" : "s"}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary ms-2"
                      onClick={() => setIsSharedView(false)}
                    >
                      Show All
                    </button>
                  </>
                ) : (
                  <>Showing {filteredStudents.length} candidates</>
                )}
              </div>
              <div className="mt-3 d-flex flex-wrap gap-2">
                <button
                  className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                  onClick={copyShareUrl}
                  disabled={selectedCandidates.size === 0}
                >
                  <FaLink /> Share Selected
                </button>
                <button
                  className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                  onClick={() => setShowRequestModal(true)}
                >
                  <FaPaperPlane /> Request Profiles
                </button>
              </div>
              {selectedCandidates.size > 0 && (
                <div className="mt-2 small">
                  Selected: {selectedCandidates.size}
                </div>
              )}
            </div>
            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              onClear={clearAllFilters}
            />
          </div>
        </div>

        <div className="col-12 col-lg-9">
          <motion.div
            className="table-responsive shadow-sm rounded-4 overflow-auto custom-scroll"
            style={{
              border: "1px solid #dee2e6",
              backgroundColor: "var(--surface-1)",
              maxHeight: "60vh",
            }}
          >
            <table className="table align-middle mb-0">
              <thead
                style={{
                  background: "linear-gradient(90deg, #007bff, #00c6ff)",
                  color: "white",
                  position: "sticky",
                  top: 0,
                }}
              >
                <tr>
                  <th style={{ width: 38 }}>Sel</th>
                  <th
                    onClick={() => handleSort("full_name")}
                    style={{ cursor: "pointer" }}
                  >
                    Name {getSortIcon("full_name")}
                  </th>
                  <th>Primary Skills</th>
                  <th>Experience</th>
                  <th>Notice</th>
                  <th>Location</th>
                  <th>Current CTC</th>
                </tr>
              </thead>
              <tbody
                onClick={(e) => {
                  const row = e.target.closest("tr[data-id]");
                  if (!row) return;
                  if (e.target.closest("input") || e.target.closest("button"))
                    return;
                  const id = row.getAttribute("data-id");
                  const cand = displayedStudents.find(
                    (c) => String(c.id) === id
                  );
                  if (!cand) return;
                  if (
                    activeCandidate &&
                    activeCandidate.id === cand.id &&
                    showDetails
                  ) {
                    closeDetails();
                  } else {
                    setActiveCandidate(cand);
                    setShowDetails(true);
                  }
                }}
              >
                {loading && (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan="7" className="text-center text-danger py-4">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && displayedStudents.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No matching candidates found.
                    </td>
                  </tr>
                )}
                {!loading &&
                  !error &&
                  displayedStudents.map((s) => (
                    <tr
                      key={s.id}
                      data-id={s.id}
                      className={
                        activeCandidate &&
                        activeCandidate.id === s.id &&
                        showDetails
                          ? "table-active"
                          : ""
                      }
                      tabIndex={0}
                      aria-label={`Candidate ${s.full_name}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className="candidate-select-checkbox"
                          checked={selectedCandidates.has(String(s.id))}
                          onChange={() => toggleSelection(s.id)}
                          aria-label={`Select candidate ${s.full_name}`}
                        />
                      </td>
                      <td className="candidate-name-cell">
                        {s.candidate_tag && (
                          <div
                            className={`candidate-tag ${
                              s.candidate_tag
                                .toLowerCase()
                                .includes("top performer")
                                ? "top-performer"
                                : s.candidate_tag
                                    .toLowerCase()
                                    .includes("final round")
                                ? "final-round"
                                : s.candidate_tag
                                    .toLowerCase()
                                    .includes("recommended")
                                ? "recommended"
                                : s.candidate_tag
                                    .toLowerCase()
                                    .includes("popular")
                                ? "most-popular"
                                : ""
                            }`}
                          >
                            {s.candidate_tag}
                          </div>
                        )}
                        <div className="candidate-name">{s.full_name}</div>
                      </td>
                      <td>
                        {s.primary_skills ? (
                          s.primary_skills
                            .split(",")
                            .filter((sk) => sk.trim())
                            .map((sk, i) => (
                              <span key={i} style={{ marginRight: 6 }}>
                                <SkillBadge skill={sk.trim()} />
                              </span>
                            ))
                        ) : (
                          <span className="text-muted">No Skills</span>
                        )}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {parseFloat(s.experience) === 0 || s.experience === "0"
                          ? "Fresher"
                          : `${s.experience} yrs`}
                      </td>
                      <td style={{ fontWeight: 500 }}>
                        {s.notice_period === "0 days" ||
                        s.notice_period === "0" ||
                        (s.notice_period &&
                          s.notice_period.toLowerCase() === "0 days")
                          ? "Immediate"
                          : s.notice_period || "—"}
                      </td>
                      <td>
                        {s.preferred_location ? (
                          s.preferred_location.split(",").map((loc, i) => (
                            <span
                              key={i}
                              style={{
                                backgroundColor: "var(--surface-3)",
                                color: "var(--text)",
                                padding: "2px 8px",
                                borderRadius: 6,
                                fontWeight: 500,
                                fontSize: "0.75rem",
                                marginRight: 6,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                border: "1px solid #E5E7EB",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {loc.trim()}
                            </span>
                          ))
                        ) : (
                          <span
                            style={{
                              backgroundColor: "var(--surface-3)",
                              color: "var(--text-muted)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              fontSize: "0.75rem",
                              fontWeight: 500,
                              border: "1px solid #E5E7EB",
                            }}
                          >
                            Remote
                          </span>
                        )}
                      </td>
                      <td>
                        {s.current_ctc
                          ? (() => {
                              const value = parseFloat(s.current_ctc);
                              if (isNaN(value)) return "—";
                              if (value < 100) return `${value} LPA`;
                              const inLpa = value / 100000;
                              return `${inLpa.toFixed(1)} LPA`;
                            })()
                          : "0 LPA"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </motion.div>

          {showDetails && activeCandidate && (
            <div
              className="details-panel mt-3 rounded-4 shadow-sm border bg-white"
              aria-live="polite"
            >
              <div className="details-panel-header d-flex justify-content-between align-items-center p-3 border-bottom">
                <div>
                  <h6 className="mb-1 fw-bold">{activeCandidate.full_name}</h6>
                  <div className="text-muted small">
                    {activeCandidate.primary_role ||
                      activeCandidate.role ||
                      "Candidate"}
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-light"
                  onClick={closeDetails}
                  aria-label="Close details panel"
                >
                  Close ✕
                </button>
              </div>
              <div className="details-panel-body p-3">
                <div className="row g-3">
                  <div className="col-md-4">
                    <strong>Experience:</strong>
                    <div>{activeCandidate.experience || "—"} yrs</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Notice Period:</strong>
                    <div>{activeCandidate.notice_period || "—"}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Preferred Location:</strong>
                    <div>{activeCandidate.preferred_location || "—"}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Current CTC:</strong>
                    <div>{activeCandidate.current_ctc || "—"}</div>
                  </div>
                  <div className="col-md-4">
                    <strong>Expected CTC:</strong>
                    <div>{activeCandidate.expected_ctc || "—"}</div>
                  </div>
                  <div className="col-12">
                    <strong>Skills:</strong>
                    <div className="mt-1">
                      {activeCandidate.primary_skills
                        ? activeCandidate.primary_skills
                            .split(",")
                            .map((sk, i) => (
                              <span key={i} className="me-1">
                                <SkillBadge skill={sk.trim()} />
                              </span>
                            ))
                        : "—"}
                    </div>
                  </div>
                </div>
                {activeCandidate.resume_url && (
                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setResumeModal(activeCandidate.resume_url)}
                    >
                      View Resume
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => toggleSelection(activeCandidate.id)}
                    >
                      {selectedCandidates.has(String(activeCandidate.id))
                        ? "Unselect"
                        : "Select"}
                    </button>
                  </div>
                )}
                <hr className="my-4" />
                <h6 className="fw-bold">Mark Interest</h6>
                {!interestSuccess ? (
                  <form onSubmit={submitInterest} className="interest-form">
                    <div className="row g-2">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Your Name"
                          value={interestForm.recruiterName}
                          onChange={(e) =>
                            setInterestForm({
                              ...interestForm,
                              recruiterName: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          placeholder="Your Email"
                          value={interestForm.recruiterEmail}
                          onChange={(e) =>
                            setInterestForm({
                              ...interestForm,
                              recruiterEmail: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Company Name"
                          value={interestForm.recruiterCompany}
                          onChange={(e) =>
                            setInterestForm({
                              ...interestForm,
                              recruiterCompany: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-sm btn-primary w-100 mt-3"
                      disabled={interestSubmitting}
                    >
                      {interestSubmitting ? "Submitting..." : "Submit Interest"}
                    </button>
                  </form>
                ) : (
                  <div className="alert alert-success py-2 px-3 d-flex align-items-center gap-2">
                    <FaUserCheck /> Interest recorded.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {resumeModal && (
          <motion.div
            className="modal-backdrop-custom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content-custom">
              <button
                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2"
                onClick={() => setResumeModal(null)}
              >
                ✕
              </button>
              <iframe
                title="Resume"
                src={resumeModal}
                style={{ width: "100%", height: "80vh", border: "none" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            className="modal-backdrop-custom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-content-custom p-4" style={{ maxWidth: 600 }}>
              <button
                className="btn btn-sm btn-light position-absolute top-0 end-0 m-2"
                onClick={() => setShowRequestModal(false)}
              >
                ✕
              </button>
              <h5 className="fw-bold mb-3">Request Candidate Profiles</h5>
              {!formSubmitted ? (
                <form onSubmit={handleSubmit}>
                  {[
                    { name: "fullName", label: "Full Name" },
                    { name: "email", label: "Email" },
                    { name: "contact", label: "Contact Number" },
                    { name: "company", label: "Company Name" },
                  ].map((field) => (
                    <div className="mb-3" key={field.name}>
                      <label className="form-label">{field.label}</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter ${field.label}`}
                        required
                        value={formData[field.name]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field.name]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setShowRequestModal(false)}
                    >
                      Back
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Submit →
                    </button>
                  </div>
                </form>
              ) : (
                <motion.div
                  className="text-center p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="d-flex justify-content-center align-items-center mb-3"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: "linear-gradient(90deg, #00c6ff, #007bff)",
                      margin: "0 auto",
                    }}
                  >
                    <FaCheckCircle size={40} color="white" />
                  </div>
                  <h5 className="fw-bold mt-3 text-success">
                    Thank You for Your Request!
                  </h5>
                  <p className="text-muted small">
                    Our placement team will get in touch with you shortly and
                    share the most relevant candidate profiles.
                  </p>
                  <button
                    className="btn btn-primary mt-3"
                    style={{
                      background: "linear-gradient(90deg, #007bff, #00c6ff)",
                      border: "none",
                    }}
                    onClick={() => setShowRequestModal(false)}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
