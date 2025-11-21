import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RecruiterDashboard.css";
import { supabase } from "../supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaCheckCircle, FaUserCheck } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { SkillBadge } from "./SkillBadgeDesign";
import FAQSection from "./FAQSection";
import FiltersPanel from "./FiltersPanel";
import RecruiterHero from "./recruiter/RecruiterHero";
import SearchPanel from "./recruiter/SearchPanel";
import CandidateList from "./recruiter/CandidateList";

const getInitialFilters = () => ({
  experience: new Set(),
  roles: new Set(),
  skills: new Set(),
  certs: new Set(),
  notice: new Set(),
  locations: new Set(),
  workModes: new Set(),
  topCandidate: false,
});

const REQUEST_FORM_INITIAL = {
  fullName: "",
  email: "",
  contact: "",
  company: "",
};

const INTEREST_FORM_INITIAL = {
  recruiterName: "",
  recruiterEmail: "",
  recruiterCompany: "",
  recruiterPhone: "",
};

const COMPANY_WHATSAPP_NUMBER = "9380098592";
const SHARE_BASE_URL = "https://talent.microdegree.work";

const getExperienceBucket = (value) => {
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  if (num === 0) return "fresher";
  if (num > 0 && num <= 3) return "early";
  if (num > 3 && num <= 7) return "mid";
  return "senior";
};

const getNoticeBucket = (value) => {
  if (!value && value !== 0) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;
  if (
    normalized.includes("immediate") ||
    normalized === "0" ||
    normalized === "0 days"
  ) {
    return "Immediate";
  }
  let numeric = parseFloat(normalized.replace(/[^0-9.]/g, ""));
  if (Number.isNaN(numeric)) return null;
  if (normalized.includes("month")) {
    numeric *= 30;
  } else if (normalized.includes("week")) {
    numeric *= 7;
  }
  if (numeric <= 15) return "<15 Days";
  if (numeric <= 30) return "30 Days";
  if (numeric <= 60) return "60 Days";
  return "90 Days";
};

const parseCSV = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toLpa = (value) => {
  if (value === null || value === undefined) return 0;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return 0;
  return num > 100 ? num / 100000 : num;
};

const getInitials = (name = "") => {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "MD";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const getRelativeDayLabel = (timestamp) => {
  if (!timestamp) return "Updated recently";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Updated recently";
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Updated today";
  if (diffDays === 1) return "Updated 1 day ago";
  if (diffDays < 30) return `Updated ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Updated 1 month ago";
  return `Updated ${diffMonths} months ago`;
};

const getWorkModeLabel = (value) => {
  if (!value) return null;
  const normalized = String(value).trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("remote")) return "Remote";
  if (normalized.includes("hybrid")) return "Hybrid";
  if (
    normalized.includes("on-site") ||
    normalized.includes("onsite") ||
    normalized.includes("on site")
  ) {
    return "On-site";
  }
  return normalized
    .split(/\s|-/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function RecruiterDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeModal, setResumeModal] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [formData, setFormData] = useState(REQUEST_FORM_INITIAL);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState(() => getInitialFilters());
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [interestForm, setInterestForm] = useState(INTEREST_FORM_INITIAL);
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const detailsRef = useRef(null);
  const candidateColumnRef = useRef(null);
  const heroRef = useRef(null);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [heroHeight, setHeroHeight] = useState(0);
  const collapseOffset = heroHeight ? heroHeight + 24 : 160;

  useLayoutEffect(() => {
    if (headerHidden) return undefined;

    const updateHeroHeight = () => {
      if (!heroRef.current) return;
      const next = heroRef.current.offsetHeight;
      if (next > 0) {
        setHeroHeight(next);
      }
    };

    updateHeroHeight();
    window.addEventListener("resize", updateHeroHeight);
    return () => window.removeEventListener("resize", updateHeroHeight);
  }, [headerHidden]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) {
        setError("Unable to load candidates at the moment.");
        toast.error("Failed to fetch candidates");
      } else {
        setStudents(data || []);
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const selectedParam = params.get("selected");
    if (selectedParam) {
      const ids = selectedParam.split(",").filter(Boolean);
      if (ids.length) {
        setSelectedCandidates(new Set(ids));
        setIsSharedView(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!showRequestModal) {
      setFormSubmitted(false);
      setFormData(REQUEST_FORM_INITIAL);
    }
  }, [showRequestModal]);

  const closeDetails = useCallback(() => {
    setShowDetails(false);
    setActiveCandidate(null);
    setInterestForm(INTEREST_FORM_INITIAL);
    setInterestSuccess(false);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== "Escape") return;
      if (resumeModal) {
        setResumeModal(null);
      } else if (showRequestModal) {
        setShowRequestModal(false);
      } else if (showDetails) {
        closeDetails();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [resumeModal, showRequestModal, showDetails, closeDetails]);

  useEffect(() => {
    if (!showDetails) return;
    const handleOutsideClick = (event) => {
      if (!detailsRef.current) return;
      if (!detailsRef.current.contains(event.target)) {
        closeDetails();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [showDetails, closeDetails]);

  const toggleSelection = (id) => {
    setSelectedCandidates((prev) => {
      const next = new Set(prev);
      const key = String(id);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelections = () => {
    if (selectedCandidates.size === 0) return;
    setSelectedCandidates(new Set());
    if (isSharedView) {
      setIsSharedView(false);
    }
    toast.info("Selection cleared.");
  };

  const buildShareUrl = useCallback(() => {
    if (selectedCandidates.size === 0) return null;
    const path = window.location.pathname || "/";
    const baseUrl = SHARE_BASE_URL ?? window.location.origin;
    return `${baseUrl.replace(/\/$/, "")}${path}?selected=${Array.from(
      selectedCandidates
    ).join(",")}`;
  }, [selectedCandidates]);

  const copyShareUrl = () => {
    const shareUrl = buildShareUrl();
    if (!shareUrl) {
      toast.info("Select candidates to create a shareable list.");
      return;
    }
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => toast.success("Share URL copied to clipboard"))
        .catch(() => toast.error("Unable to copy share link"));
    } else {
      window.prompt("Copy this share link", shareUrl);
    }
  };

  const shareOnWhatsApp = () => {
    const shareUrl = buildShareUrl();
    if (!shareUrl) {
      toast.info("Select candidates to share via WhatsApp.");
      return;
    }
    const message = encodeURIComponent(
      `Hi team,

Check out these shortlisted MicroDegree candidates:
${shareUrl}

Thanks!`
    );
    const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank", "noopener");
  };

  const clearAllFilters = () => {
    setFilters(getInitialFilters());
  };

  const openCandidateDetails = (candidate) => {
    setActiveCandidate(candidate);
    setShowDetails(true);
    setInterestForm(INTEREST_FORM_INITIAL);
    setInterestSuccess(false);
  };

  const submitInterest = async (event) => {
    event.preventDefault();
    if (!activeCandidate) return;
    setInterestSubmitting(true);
    const payload = {
      full_name: interestForm.recruiterName,
      email: interestForm.recruiterEmail,
      contact: interestForm.recruiterPhone,
      company: interestForm.recruiterCompany,
      selected_candidates: [activeCandidate.full_name].filter(Boolean),
    };

    const { error: insertError } = await supabase
      .from("recruiter_requests")
      .insert(payload);
    if (insertError) {
      toast.error("Unable to record interest right now.");
    } else {
      toast.success("Interest recorded");
      setInterestSuccess(true);
    }
    setInterestSubmitting(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const selectedNames = students
      .filter((student) => selectedCandidates.has(String(student.id)))
      .map((student) => student.full_name)
      .filter(Boolean);
    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      contact: formData.contact,
      company: formData.company,
    };
    if (selectedNames.length > 0) {
      payload.selected_candidates = selectedNames;
    }

    const { error: insertError } = await supabase
      .from("recruiter_requests")
      .insert(payload);
    if (insertError) {
      toast.error("Failed to submit request");
    } else {
      setFormSubmitted(true);
      toast.success("Request submitted");
    }
  };

  const handleRequestProfilesClick = () => {
    if (selectedCandidates.size === 0) {
      toast.info("Select at least one candidate before requesting profiles.");
      return;
    }
    setShowRequestModal(true);
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filterBySetIncludes = (set, valueList) => {
      if (set.size === 0) return true;
      if (!valueList || valueList.length === 0) return false;
      const lowered = valueList.map((val) => val.toLowerCase());
      return Array.from(set).every((entry) =>
        lowered.includes(entry.toLowerCase())
      );
    };

    const filterByStringSet = (set, value) => {
      if (set.size === 0) return true;
      const normalized = (value || "").toLowerCase();
      if (!normalized) return false;
      return Array.from(set).some((entry) =>
        normalized.includes(entry.toLowerCase())
      );
    };

    const list = students.filter((student) => {
      if (query) {
        const searchHaystack = [
          student.full_name,
          student.primary_skills,
          student.preferred_location,
          student.primary_role,
          student.role,
          student.candidate_tag,
        ]
          .filter(Boolean)
          .map((value) => String(value).toLowerCase());
        if (!searchHaystack.some((value) => value.includes(query))) {
          return false;
        }
      }

      if (filters.experience.size > 0) {
        const bucket = getExperienceBucket(student.experience);
        if (!bucket || !filters.experience.has(bucket)) return false;
      }

      if (
        !filterByStringSet(filters.roles, student.primary_role || student.role)
      )
        return false;

      const skillList = parseCSV(student.primary_skills);
      if (!filterBySetIncludes(filters.skills, skillList)) return false;

      const certList = parseCSV(
        student.certifications ||
          student.certs ||
          student.certifications_list ||
          student.additional_certifications
      );
      if (!filterBySetIncludes(filters.certs, certList)) return false;

      if (filters.notice.size) {
        const noticeBucket = getNoticeBucket(student.notice_period);
        if (!noticeBucket || !filters.notice.has(noticeBucket)) return false;
      }

      const preferredLocations = parseCSV(student.preferred_location);
      if (!filterBySetIncludes(filters.locations, preferredLocations))
        return false;

      if (filters.workModes.size) {
        const workModeLabel = getWorkModeLabel(student.work_mode);
        if (!workModeLabel || !filters.workModes.has(workModeLabel))
          return false;
      }

      if (filters.topCandidate) {
        const isTopCandidate =
          String(student.top_candidates || "")
            .trim()
            .toLowerCase() === "yes";
        if (!isTopCandidate) return false;
      }

      return true;
    });

    return list;
  }, [students, searchQuery, filters]);

  const displayedStudents = useMemo(() => {
    if (!isSharedView) return filteredStudents;
    return filteredStudents.filter((student) =>
      selectedCandidates.has(String(student.id))
    );
  }, [filteredStudents, isSharedView, selectedCandidates]);

  const handleRowClick = (student, event) => {
    if (
      event.target.closest("input") ||
      event.target.closest("button") ||
      event.target.closest("a")
    ) {
      return;
    }
    openCandidateDetails(student);
  };

  const formatExperience = (value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num) || num === 0) return "Fresher";
    return `${num} yrs`;
  };

  const formatNotice = (value) => {
    if (!value) return "—";
    const normalized = String(value).toLowerCase();
    if (normalized === "0" || normalized === "0 days") {
      return "Immediate";
    }
    return value;
  };

  const formatWorkMode = (value) => getWorkModeLabel(value) || "Flexible";

  useEffect(() => {
    const columnEl = candidateColumnRef.current;
    if (!columnEl) return undefined;

    const lastScrollTopRef = { current: columnEl.scrollTop };

    const handleColumnScroll = () => {
      const { scrollTop } = columnEl;
      const nearTop = scrollTop <= 24;
      if (nearTop) {
        setHeaderHidden(false);
        lastScrollTopRef.current = scrollTop;
        return;
      }

      const scrollingDown = scrollTop > lastScrollTopRef.current + 6;
      const scrollingUp = scrollTop < lastScrollTopRef.current - 6;

      if (scrollingDown) {
        setHeaderHidden(true);
      } else if (scrollingUp) {
        setHeaderHidden(false);
      }

      lastScrollTopRef.current = scrollTop;
    };

    columnEl.addEventListener("scroll", handleColumnScroll, { passive: true });
    return () => columnEl.removeEventListener("scroll", handleColumnScroll);
  }, []);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleWindowScroll = () => {
      if (window.innerWidth >= 992) return;
      const currentY = window.scrollY;
      const nearTop = currentY <= 24;
      if (nearTop) {
        setHeaderHidden(false);
        lastScrollY = currentY;
        return;
      }

      if (currentY > lastScrollY + 6) {
        setHeaderHidden(true);
      } else if (currentY < lastScrollY - 6) {
        setHeaderHidden(false);
      }

      lastScrollY = currentY;
    };

    window.addEventListener("scroll", handleWindowScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="recruiter-dashboard container-fluid"
      style={{
        paddingTop: headerHidden ? 0 : "0.5rem",
        paddingBottom: headerHidden ? 0 : "1rem",
      }}
    >
      <ToastContainer position="top-right" />
      <div
        ref={heroRef}
        style={{
          height: headerHidden ? 0 : heroHeight || "auto",
          overflow: "hidden",
          transition: "height 0.45s ease",
        }}
      >
        <RecruiterHero
          headerHidden={headerHidden}
          collapseOffset={collapseOffset}
        />
      </div>

      <motion.div
        className="row g-4"
        style={{
          minHeight: headerHidden ? "100vh" : "auto",
          paddingTop: headerHidden ? "0" : "0.5rem",
          paddingBottom: headerHidden ? "0" : "0.5rem",
          "--bs-gutter-y": "1rem",
        }}
        transition={{ duration: 0.35 }}
      >
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <div className="sidebar-stack">
            <SearchPanel
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              isSharedView={isSharedView}
              displayedCount={displayedStudents.length}
              filteredCount={filteredStudents.length}
              setIsSharedView={setIsSharedView}
              copyShareUrl={copyShareUrl}
              onRequestProfiles={handleRequestProfilesClick}
              selectedCount={selectedCandidates.size}
              onClearSelections={clearSelections}
              shareOnWhatsApp={shareOnWhatsApp}
            />

            <FiltersPanel
              filters={filters}
              setFilters={setFilters}
              onClear={clearAllFilters}
            />
          </div>
        </div>

        <motion.div
          className="col-12 col-lg-9 candidate-column-scroll"
          ref={candidateColumnRef}
        >
          <div className="d-lg-none mb-3">
            <button
              type="button"
              className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <FaBars /> Filters & Search
            </button>
          </div>
          <CandidateList
            students={displayedStudents}
            loading={loading}
            error={error}
            activeCandidateId={activeCandidate?.id}
            showDetails={showDetails}
            handleRowClick={handleRowClick}
            toggleSelection={toggleSelection}
            selectedCandidates={selectedCandidates}
            formatExperience={formatExperience}
            formatNotice={formatNotice}
            getInitials={getInitials}
            getRelativeDayLabel={getRelativeDayLabel}
            toLpa={toLpa}
            parseCSV={parseCSV}
            formatWorkMode={formatWorkMode}
          />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-filter-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mobile-filter-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 32 }}
            >
              <div className="mobile-filter-header d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Search & Filters</h5>
                <button
                  type="button"
                  className="btn btn-sm btn-light"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="mobile-filter-body">
                <SearchPanel
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  isSharedView={isSharedView}
                  displayedCount={displayedStudents.length}
                  filteredCount={filteredStudents.length}
                  setIsSharedView={setIsSharedView}
                  copyShareUrl={copyShareUrl}
                  onRequestProfiles={handleRequestProfilesClick}
                  selectedCount={selectedCandidates.size}
                  onClearSelections={clearSelections}
                  shareOnWhatsApp={shareOnWhatsApp}
                />

                <FiltersPanel
                  filters={filters}
                  setFilters={setFilters}
                  onClear={clearAllFilters}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <FAQSection />

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
                    Thank you for your request!
                  </h5>
                  <p className="text-muted small">
                    Our placement team will connect shortly with tailored
                    profiles.
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

      <AnimatePresence>
        {showDetails && activeCandidate && (
          <motion.div
            className="candidate-context-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-popover-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: "none" }}
          >
            <motion.div
              className="candidate-popover"
              ref={detailsRef}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              style={{ pointerEvents: "auto" }}
            >
              <header>
                <div>
                  <h5 id="candidate-popover-title" className="mb-1 fw-bold">
                    {activeCandidate.full_name}
                  </h5>
                  <div className="small">
                    {activeCandidate.primary_role ||
                      activeCandidate.role ||
                      "Candidate"}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={closeDetails}
                  aria-label="Close candidate details"
                >
                  ✕
                </button>
              </header>
              <div className="popover-body">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <strong>Experience:</strong>
                    <div>{formatExperience(activeCandidate.experience)}</div>
                  </div>
                  <div className="col-6">
                    <strong>Notice:</strong>
                    <div>{formatNotice(activeCandidate.notice_period)}</div>
                  </div>
                  <div className="col-6">
                    <strong>Current CTC:</strong>
                    <div>
                      {toLpa(activeCandidate.current_ctc).toFixed(1)} LPA
                    </div>
                  </div>
                  <div className="col-6">
                    <strong>Expected CTC:</strong>
                    <div>
                      {toLpa(activeCandidate.expected_ctc).toFixed(1)} LPA
                    </div>
                  </div>
                  <div className="col-12">
                    <strong>Preferred Location:</strong>
                    <div>{activeCandidate.preferred_location || "—"}</div>
                  </div>
                  <div className="col-12">
                    <strong>Work Mode:</strong>
                    <div>{formatWorkMode(activeCandidate.work_mode)}</div>
                  </div>
                  <div className="col-12">
                    <strong>Skills:</strong>
                    <div className="mt-1 skill-badges">
                      {parseCSV(activeCandidate.primary_skills).length
                        ? parseCSV(activeCandidate.primary_skills).map(
                            (skill, index) => (
                              <span key={`detail-skill-${index}`}>
                                <SkillBadge skill={skill} />
                              </span>
                            )
                          )
                        : "—"}
                    </div>
                  </div>
                </div>

                {activeCandidate.resume_url && (
                  <div className="d-flex gap-2 flex-wrap mb-3">
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

                <h6 className="fw-bold">Mark Interest</h6>
                {!interestSuccess ? (
                  <form
                    onSubmit={submitInterest}
                    className="interest-form"
                    aria-label="Interest form"
                  >
                    <div className="row g-2">
                      <div className="col-12">
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
                      <div className="col-12">
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
                      <div className="col-12">
                        <input
                          type="tel"
                          className="form-control form-control-sm"
                          placeholder="Phone Number"
                          value={interestForm.recruiterPhone}
                          onChange={(e) =>
                            setInterestForm({
                              ...interestForm,
                              recruiterPhone: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="col-12">
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
                    <div className="small text-muted mt-2">
                      (Email notifications will be sent when SMTP is
                      configured.)
                    </div>
                  </form>
                ) : (
                  <div className="alert alert-success py-2 px-3 d-flex align-items-center gap-2 mt-2">
                    <FaUserCheck /> Interest recorded.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
