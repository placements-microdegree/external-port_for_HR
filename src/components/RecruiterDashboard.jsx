/* global globalThis */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion, AnimatePresence } from "framer-motion";
import { FaBars, FaCheckCircle, FaUserCheck } from "react-icons/fa";
import { supabase } from "../supabaseClient";
import FiltersPanel from "./FiltersPanel";
import CandidateList from "./recruiter/CandidateList";
import RecruiterNavbar from "./recruiter/RecruiterNavbar";
import Footer from "./Footer";
import SharedSelectionBanner from "./SharedSelectionBanner";
import { SkillBadge } from "./SkillBadgeDesign";
import "./RecruiterDashboard.css";

const MotionDialog = motion.dialog;

const SHARE_BASE_URL =
  process.env.REACT_APP_SHARE_BASE_URL || "http://localhost:3000";
const TALLY_FORM_ID = "ob9eye";
const TALLY_CONFIG = {
  formId: TALLY_FORM_ID,
  popup: {
    emoji: {
      text: "👋",
      animation: "wave",
    },
  },
};

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

const COMPANY_WHATSAPP_NUMBER = process.env.REACT_APP_COMPANY_WHATSAPP_NUMBER;

const getExperienceBucket = (value) => {
  const num = Number.parseFloat(value);
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
  let numeric = Number.parseFloat(normalized.replaceAll(/[^0-9.]/g, ""));
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
  const num = Number.parseFloat(value);
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
    normalized.includes("office") ||
    normalized.includes("on-site") ||
    normalized.includes("onsite") ||
    normalized.includes("on site")
  ) {
    return "Office";
  }
  return normalized
    .split(/\s|-/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMonthYear = (date = new Date()) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);

const buildSearchHaystack = (student) =>
  [
    student.full_name,
    student.primary_skills,
    student.preferred_location,
    student.primary_role,
    student.role,
    student.candidate_tag,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase());

const matchesSearchQuery = (student, query) => {
  if (!query) return true;
  return buildSearchHaystack(student).some((value) => value.includes(query));
};

const toLowerCaseSet = (values = []) =>
  new Set(values.map((value) => String(value).toLowerCase()));

const matchesMultiValueFilter = (filterSet, values) => {
  if (!filterSet.size) return true;
  if (!values || values.length === 0) return false;
  const loweredValues = toLowerCaseSet(values);
  return Array.from(filterSet).every((entry) =>
    loweredValues.has(String(entry).toLowerCase())
  );
};

const matchesCertificationFilter = (filterSet, certifications) => {
  if (!filterSet.size) return true;
  if (!certifications || certifications.length === 0) return false;
  const normalizedCerts = certifications.map((cert) =>
    String(cert ?? "").toLowerCase()
  );
  return Array.from(filterSet).every((entry) => {
    const target = String(entry ?? "").toLowerCase();
    return normalizedCerts.some((cert) => cert.includes(target));
  });
};

const matchesStringFilter = (filterSet, value) => {
  if (!filterSet.size) return true;
  const normalized = String(value ?? "").toLowerCase();
  if (!normalized) return false;
  return Array.from(filterSet).some((entry) =>
    normalized.includes(String(entry).toLowerCase())
  );
};

const matchesExperienceFilter = (student, filterSet) => {
  if (!filterSet.size) return true;
  const bucket = getExperienceBucket(student.experience);
  return Boolean(bucket && filterSet.has(bucket));
};

const matchesNoticeFilter = (student, filterSet) => {
  if (!filterSet.size) return true;
  const noticeBucket = getNoticeBucket(student.notice_period);
  return Boolean(noticeBucket && filterSet.has(noticeBucket));
};

const matchesWorkModeFilter = (student, filterSet) => {
  if (!filterSet.size) return true;
  const workModeLabel = getWorkModeLabel(student.work_mode);
  return Boolean(workModeLabel && filterSet.has(workModeLabel));
};

const hasTopCandidateTag = (student) => {
  const tag = String(student.candidate_tag ?? "").toLowerCase();
  if (tag.includes("top candidate")) return true;
  const legacyFlag = String(student.top_candidates ?? "")
    .trim()
    .toLowerCase();
  return legacyFlag === "yes";
};

const matchesTopCandidateFilter = (student, requireTopCandidate) => {
  if (!requireTopCandidate) return true;
  return hasTopCandidateTag(student);
};

const matchesAllFilters = (student, filterState) => {
  if (!matchesExperienceFilter(student, filterState.experience)) return false;
  if (
    !matchesStringFilter(
      filterState.roles,
      student.primary_role || student.role
    )
  ) {
    return false;
  }
  if (
    !matchesMultiValueFilter(
      filterState.skills,
      parseCSV(student.primary_skills)
    )
  ) {
    return false;
  }
  const certificationSources = parseCSV(
    student.certifications ||
      student.certs ||
      student.certifications_list ||
      student.additional_certifications
  );
  if (!matchesCertificationFilter(filterState.certs, certificationSources)) {
    return false;
  }
  if (!matchesNoticeFilter(student, filterState.notice)) return false;
  if (
    !matchesMultiValueFilter(
      filterState.locations,
      parseCSV(student.preferred_location)
    )
  ) {
    return false;
  }
  if (!matchesWorkModeFilter(student, filterState.workModes)) return false;
  if (!matchesTopCandidateFilter(student, filterState.topCandidate)) {
    return false;
  }
  return true;
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
  const [cartCandidates, setCartCandidates] = useState(new Set());
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isSharedView, setIsSharedView] = useState(false);
  const [interestForm, setInterestForm] = useState(INTEREST_FORM_INITIAL);
  const [interestSubmitting, setInterestSubmitting] = useState(false);
  const [interestSuccess, setInterestSuccess] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSelectionSummary, setShowSelectionSummary] = useState(false);
  const [currentMonthLabel, setCurrentMonthLabel] = useState(() =>
    formatMonthYear()
  );
  const [heroCollapsed, setHeroCollapsed] = useState(false);
  const [pendingScroll, setPendingScroll] = useState(false);
  const [showTopCollections, setShowTopCollections] = useState(false);
  const selectedCount = selectedCandidates.size;
  const cartCount = cartCandidates.size;
  const detailsRef = useRef(null);
  const candidateColumnRef = useRef(null);
  const talentSectionRef = useRef(null);
  const closeCart = useCallback(() => setShowCart(false), []);

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
    if (typeof document === "undefined") return;
    const timer = setTimeout(() => {
      globalThis.TallyConfig = TALLY_CONFIG;
      const existingScript = document.getElementById("tally-embed-script");
      if (existingScript) return;
      const script = document.createElement("script");
      script.id = "tally-embed-script";
      script.src = "https://tally.so/widgets/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }, 180000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(globalThis.location?.search ?? "");
    const selectedParam = params.get("selected");
    if (selectedParam) {
      const ids = selectedParam.split(",").filter(Boolean);
      if (ids.length) {
        setSelectedCandidates(new Set(ids));
        setCartCandidates(new Set());
        setIsSharedView(true);
        setHeroCollapsed(true);
        setPendingScroll(true);
        setShowTopCollections(false);
      }
    }

    const topCollectionsParam = params.get("topcandidates");
    if (topCollectionsParam) {
      setShowTopCollections(true);
      setHeroCollapsed(true);
      setPendingScroll(true);
    }
  }, []);

  useEffect(() => {
    if (!showRequestModal) {
      setFormSubmitted(false);
      setFormData(REQUEST_FORM_INITIAL);
    }
  }, [showRequestModal]);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentMonthLabel(formatMonthYear());
    }, 1000 * 60 * 30);
    return () => clearInterval(id);
  }, []);

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
      } else if (showCart) {
        closeCart();
      }
    };
    globalThis.addEventListener?.("keydown", handleEscape);
    return () => globalThis.removeEventListener?.("keydown", handleEscape);
  }, [
    resumeModal,
    showRequestModal,
    showDetails,
    showCart,
    closeDetails,
    closeCart,
  ]);

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
    if (selectedCount === 0) return;
    setSelectedCandidates(new Set());
    if (isSharedView) {
      setIsSharedView(false);
    }
    setShowSelectionSummary(false);
    toast.info("Selection cleared.");
  };

  const addSelectionToCart = useCallback(() => {
    if (selectedCount === 0) {
      toast.info("Select candidates before adding to cart.");
      return;
    }
    const idsToAdd = Array.from(selectedCandidates).map(String);
    setCartCandidates((prev) => {
      const next = new Set(prev);
      idsToAdd.forEach((id) => next.add(id));
      return next;
    });
    setSelectedCandidates(new Set());
    setShowSelectionSummary(false);
    toast.success(
      `${idsToAdd.length} candidate${
        idsToAdd.length > 1 ? "s" : ""
      } added to cart.`
    );
  }, [selectedCandidates, selectedCount]);

  const removeFromCart = useCallback((id) => {
    setCartCandidates((prev) => {
      const next = new Set(prev);
      next.delete(String(id));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    if (cartCount === 0) return;
    setCartCandidates(new Set());
    toast.info("Cart cleared.");
  }, [cartCount]);

  const buildShareUrl = useCallback(
    (sourceSet) => {
      const targetSet = sourceSet ?? selectedCandidates;
      const ids = Array.from(targetSet ?? []);
      if (ids.length === 0) return null;
      const path = globalThis.location?.pathname ?? "/";
      const originFallback = globalThis.location?.origin ?? "";
      const baseUrl = (SHARE_BASE_URL || originFallback).replace(/\/$/, "");
      return `${baseUrl}${path}?selected=${ids.join(",")}`;
    },
    [selectedCandidates]
  );

  const copyShareUrlForSet = useCallback(
    (sourceSet, emptyMessage) => {
      const shareUrl = buildShareUrl(sourceSet);
      if (!shareUrl) {
        toast.info(emptyMessage);
        return;
      }
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard
          .writeText(shareUrl)
          .then(() => toast.success("Share URL copied to clipboard"))
          .catch(() => toast.error("Unable to copy share link"));
      } else {
        globalThis.prompt?.("Copy this share link", shareUrl);
      }
    },
    [buildShareUrl]
  );

  const shareOnWhatsAppForSet = useCallback(
    (sourceSet, emptyMessage) => {
      const shareUrl = buildShareUrl(sourceSet);
      if (!shareUrl) {
        toast.info(emptyMessage);
        return;
      }
      const message = encodeURIComponent(
        `Hi team,

Check out these shortlisted MicroDegree candidates:
${shareUrl}

Thanks!`
      );
      const whatsappUrl = `https://wa.me/${COMPANY_WHATSAPP_NUMBER}?text=${message}`;
      globalThis.open?.(whatsappUrl, "_blank", "noopener");
    },
    [buildShareUrl]
  );

  const copySelectionShareUrl = useCallback(
    () =>
      copyShareUrlForSet(null, "Select candidates to create a shareable list."),
    [copyShareUrlForSet]
  );

  const copyCartShareUrl = useCallback(
    () =>
      copyShareUrlForSet(
        cartCandidates,
        "Add candidates to cart before sharing."
      ),
    [cartCandidates, copyShareUrlForSet]
  );

  const shareCartOnWhatsApp = useCallback(
    () =>
      shareOnWhatsAppForSet(
        cartCandidates,
        "Add candidates to cart before sharing via WhatsApp."
      ),
    [cartCandidates, shareOnWhatsAppForSet]
  );

  const shareSelectionOnWhatsApp = useCallback(
    () =>
      shareOnWhatsAppForSet(
        null,
        "Select candidates before sharing via WhatsApp."
      ),
    [shareOnWhatsAppForSet]
  );

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
    const selectedNames = cartStudentList
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
    if (cartCount === 0) {
      toast.info("Add candidates to the cart before requesting profiles.");
      return;
    }
    setShowRequestModal(true);
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return students.filter(
      (student) =>
        matchesSearchQuery(student, query) &&
        matchesAllFilters(student, filters)
    );
  }, [students, searchQuery, filters]);

  const curatedStudents = useMemo(() => {
    if (!showTopCollections) return filteredStudents;
    return filteredStudents.filter(
      (student) =>
        String(student.top_collection ?? "")
          .trim()
          .toLowerCase() === "yes"
    );
  }, [filteredStudents, showTopCollections]);

  const displayedStudents = useMemo(() => {
    if (isSharedView) {
      return curatedStudents.filter((student) =>
        selectedCandidates.has(String(student.id))
      );
    }
    return curatedStudents;
  }, [curatedStudents, isSharedView, selectedCandidates]);

  const cartStudentList = useMemo(
    () => students.filter((student) => cartCandidates.has(String(student.id))),
    [students, cartCandidates]
  );

  useEffect(() => {
    if (showCart && cartStudentList.length === 0) {
      setShowCart(false);
    }
  }, [showCart, cartStudentList.length]);

  useEffect(() => {
    if (!isSharedView) return;
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [isSharedView, mobileMenuOpen]);

  useEffect(() => {
    if (showCart) {
      setShowSelectionSummary(false);
      return;
    }
    if (selectedCount === 0) {
      setShowSelectionSummary(false);
      return;
    }
    setShowSelectionSummary(true);
  }, [selectedCount, showCart]);

  useEffect(() => {
    if (!pendingScroll || !heroCollapsed) return;
    const timer = setTimeout(() => {
      if (talentSectionRef.current) {
        talentSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
      setPendingScroll(false);
    }, 140);
    return () => clearTimeout(timer);
  }, [pendingScroll, heroCollapsed]);

  const handleBrowseNav = useCallback(() => {
    setIsSharedView(false);
    setShowTopCollections(false);
    setHeroCollapsed(true);
    setPendingScroll(true);
  }, []);

  const handleCollectionsNav = useCallback(() => {
    if (!heroCollapsed) {
      setHeroCollapsed(true);
    }
    setShowTopCollections(true);
    setIsSharedView(false);
    setPendingScroll(true);
  }, [heroCollapsed]);

  const exitSharedView = useCallback(() => {
    setIsSharedView(false);
    setShowTopCollections(false);
    if (!heroCollapsed) {
      setHeroCollapsed(true);
    }
    setPendingScroll(true);
  }, [heroCollapsed]);

  useEffect(() => {
    if (!isSharedView) return;
    if (selectedCandidates.size === 0) {
      exitSharedView();
    }
  }, [isSharedView, selectedCandidates, exitSharedView]);
  const handleCartNav = useCallback(() => {
    if (cartStudentList.length === 0) {
      toast.info("Your cart is empty.");
      return;
    }
    setShowCart(true);
  }, [cartStudentList.length]);

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
    const num = Number.parseFloat(value);
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
    const handleResize = () => {
      if ((globalThis.innerWidth ?? 0) >= 992) {
        setMobileMenuOpen(false);
      }
    };
    globalThis.addEventListener?.("resize", handleResize);
    return () => globalThis.removeEventListener?.("resize", handleResize);
  }, []);

  const candidateColumnClasses = isSharedView
    ? "col-12 candidate-column-scroll"
    : "col-12 col-lg-9 candidate-column-scroll";

  return (
    <>
      <div className="recruiter-dashboard container-fluid pb-4">
        <ToastContainer position="top-right" />
        <RecruiterNavbar
          selectedCount={cartCount}
          showSearch={heroCollapsed}
          collectionsCount={0}
          onBrowse={handleBrowseNav}
          onCollections={handleCollectionsNav}
          onCart={handleCartNav}
          onFiltersToggle={() => setMobileMenuOpen(true)}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {!heroCollapsed && (
          <section className="recruiter-hero-card" aria-live="polite">
            <div className="hero-content">
              <p className="hero-kicker">Talent Spotlight</p>
              <h1 className="hero-title">
                Top Cloud & DevOps Profiles {currentMonthLabel}
              </h1>
              <p className="hero-subtitle">
                Curated engineers, architects, and SREs vetted by MicroDegree
                for rapid hiring cycles.
              </p>
              <div className="hero-cta-stack">
                <button
                  type="button"
                  className="hero-browse-btn"
                  onClick={handleBrowseNav}
                >
                  Browse MicroDegree Talent
                </button>
                <p className="hero-cta-note">
                  Click Browse to jump straight into MicroDegree's talent bench
                  and fast-track your shortlist.
                </p>
              </div>
            </div>
          </section>
        )}

        {heroCollapsed && (
          <motion.div
            ref={talentSectionRef}
            className="row g-4"
            style={{ "--bs-gutter-y": "1rem", scrollMarginTop: "120px" }}
            transition={{ duration: 0.35 }}
          >
            {!isSharedView && (
              <div className="col-12 col-lg-3 d-none d-lg-block">
                <div className="sidebar-stack">
                  <FiltersPanel
                    filters={filters}
                    setFilters={setFilters}
                    onClear={clearAllFilters}
                  />
                </div>
              </div>
            )}

            <motion.div
              className={candidateColumnClasses}
              ref={candidateColumnRef}
            >
              {isSharedView && (
                <SharedSelectionBanner
                  count={selectedCount}
                  onExitSharedView={exitSharedView}
                />
              )}
              {!isSharedView && (
                <div className="d-lg-none mb-3">
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setMobileMenuOpen(true)}
                  >
                    <FaBars /> Filters & Search
                  </button>
                </div>
              )}
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
        )}

        <AnimatePresence>
          {mobileMenuOpen && !isSharedView && (
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

        <AnimatePresence>
          {showCart && cartStudentList.length > 0 && (
            <motion.div
              className="modal-backdrop-custom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCart}
            >
              <motion.div
                className="cart-panel"
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="cart-panel-header">
                  <div>
                    <h5 className="fw-bold mb-1">Selected Candidates</h5>
                    <p className="mb-0 text-muted small">
                      {cartStudentList.length} profile
                      {cartStudentList.length > 1 ? "s" : ""} ready for review
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-light"
                    onClick={closeCart}
                    aria-label="Close cart"
                  >
                    ✕
                  </button>
                </div>

                <div className="cart-panel-body">
                  {cartStudentList.map((student) => (
                    <div className="cart-item" key={student.id}>
                      <div>
                        <h6 className="fw-semibold mb-1">
                          {student.full_name || "Candidate"}
                        </h6>
                        <div className="cart-item-meta">
                          <span>{student.primary_role || student.role}</span>
                          <span>{formatExperience(student.experience)}</span>
                          <span>
                            {formatWorkMode(student.work_mode)} ·{" "}
                            {student.preferred_location || "Flexible"}
                          </span>
                          <span>{getRelativeDayLabel(student.updated_at)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => removeFromCart(student.id)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-panel-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      closeCart();
                      handleRequestProfilesClick();
                    }}
                  >
                    Request Profiles
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={copyCartShareUrl}
                  >
                    Copy Share Link
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={shareCartOnWhatsApp}
                  >
                    Share on WhatsApp
                  </button>
                  <button
                    type="button"
                    className="btn btn-link text-danger px-0"
                    onClick={() => {
                      clearCart();
                      closeCart();
                    }}
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <div
                className="modal-content-custom p-4"
                style={{ maxWidth: 600 }}
              >
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
            <MotionDialog
              className="candidate-context-overlay"
              aria-modal="true"
              aria-labelledby="candidate-popover-title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              open
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
                                <span
                                  key={`${activeCandidate.id}-${skill}-${index}`}
                                >
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
                        onClick={() =>
                          setResumeModal(activeCandidate.resume_url)
                        }
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
                  {interestSuccess ? (
                    <div className="alert alert-success py-2 px-3 d-flex align-items-center gap-2 mt-2">
                      <FaUserCheck /> Interest recorded.
                    </div>
                  ) : (
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
                        {interestSubmitting
                          ? "Submitting..."
                          : "Submit Interest"}
                      </button>
                      <div className="small text-muted mt-2">
                        (Email notifications will be sent when SMTP is
                        configured.)
                      </div>
                    </form>
                  )}
                </div>
              </motion.div>
            </MotionDialog>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSelectionSummary && selectedCount > 0 && !showCart && (
            <motion.div
              className="cart-sticky-cta"
              aria-live="polite"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div>
                <p className="cart-sticky-count mb-1">
                  {selectedCount} candidate
                  {selectedCount > 1 ? "s" : ""} selected
                </p>
                <p className="cart-sticky-sub text-muted mb-0">
                  Add them to cart or share with your team
                </p>
              </div>
              <div className="cart-sticky-actions">
                <button
                  type="button"
                  className="btn btn-link text-decoration-none"
                  onClick={clearSelections}
                >
                  Clear
                </button>
                <button
                  type="button"
                  className="btn btn-light"
                  onClick={copySelectionShareUrl}
                >
                  ↗ Share
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={shareSelectionOnWhatsApp}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={addSelectionToCart}
                >
                  Add to cart
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Footer />
    </>
  );
}
