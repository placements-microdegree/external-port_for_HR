import React, { useEffect, useState } from "react";
import "./RecruiterDashboard.css";
import { supabase } from "../supabaseClient";
import logo from "../assets/Logo.png";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCloud,
  FaPaperPlane,
  FaUserGraduate,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaSearch,
  FaCheckCircle,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { SkillBadge } from "./SkillBadgeDesign";

export default function RecruiterDashboard() {
  const [students, setStudents] = useState([]);
  const [courseFilter, setCourseFilter] = useState("all");
  const [expFilter, setExpFilter] = useState([]);
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

  // 🎯 Fetch data + Enable real-time updates
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (!error && data) {
        const sorted = data.sort((a, b) => {
          if (b.rank_points === a.rank_points) {
            return (b.experience || 0) - (a.experience || 0);
          }
          return (b.rank_points || 0) - (a.rank_points || 0);
        });
        setStudents(sorted.slice(0, 10));
      }
    };

    fetchStudents();

    // ✅ Real-time listener for updates
    const channel = supabase
      .channel("students-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        (payload) => {
          console.log("📡 Real-time update detected:", payload.eventType);
          fetchStudents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getExperienceRange = (exp) => {
    if (!exp && exp !== 0) return null;
    if (exp < 0.5) return "Fresher"; // 0–6 months
    if (exp >= 0.5 && exp < 3) return "Early Professional"; // 6 months – 3 years
    if (exp >= 3 && exp < 7) return "Mid"; // 3–7 years
    return "Senior"; // 7+ years
  };

  const toggleExperience = (range) => {
    setExpFilter((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase();
  };

  const locationColors = {
    bangalore: { bg: "#E6F3FF", color: "#007BFF" },
    chennai: { bg: "#FFF0E6", color: "#E67E22" },
    hyderabad: { bg: "#E6FFF2", color: "#009970" },
    pune: { bg: "#F4E6FF", color: "#6C3EFF" },
    delhi: { bg: "#FFF5E6", color: "#E67E22" },
    mumbai: { bg: "#FFE6EC", color: "#E91E63" },
    mangalore: { bg: "#E8F9E9", color: "#2E8B57" },
    remote: { bg: "#E6F8FF", color: "#007CBA" },
    default: { bg: "#F1F1F1", color: "#333" },
  };

  const filteredStudents = students
    .filter((s) => {
      const matchesCourse =
        courseFilter === "all" ||
        s.course?.toLowerCase() === courseFilter.toLowerCase();
      const matchesExp =
        expFilter.length === 0 ||
        expFilter.includes(getExperienceRange(s.experience));
      const matchesSearch =
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.primary_skills?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.preferred_location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourse && matchesExp && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const order = sortConfig.direction === "asc" ? 1 : -1;
      if (sortConfig.key === "experience")
        return (a.experience - b.experience) * order;
      return a[sortConfig.key].localeCompare(b[sortConfig.key]) * order;
    });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc")
        return { key, direction: "desc" };
      return { key, direction: "asc" };
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="ms-1 text-light" />;
    if (sortConfig.direction === "asc")
      return <FaSortUp className="ms-1 text-light" />;
    return <FaSortDown className="ms-1 text-light" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, contact, company } = formData;

    if (!fullName || !email || !contact || !company) {
      alert("⚠️ Please fill all fields before submitting.");
      return;
    }

    try {
      const { data, error } = await supabase.from("recruiter_requests").insert([
        {
          full_name: fullName,
          email: email,
          contact: contact,
          company: company,
        },
      ]);

      if (error) throw error;

      setFormSubmitted(true);

      setTimeout(() => {
        setFormSubmitted(false);
        setShowRequestModal(false);
        setFormData({ fullName: "", email: "", contact: "", company: "" });
      }, 1500);
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      alert("Something went wrong while submitting. Please try again.");
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <div className="container">
        {/* 🌟 Header */}
        {/* 🌟 Dynamic Monthly Header */}
        <motion.div
          className="p-5 text-center rounded-4 mb-5 d-flex flex-column flex-md-row align-items-center justify-content-center"
          style={{
            background: "linear-gradient(90deg, #007bff, #00c6ff)",
            boxShadow: "0 8px 25px rgba(0, 123, 255, 0.3)",
            color: "white",
            padding: "30px 40px",
            gap: "25px",
          }}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* 🏷️ Left-Aligned Logo with Shadow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="d-flex justify-content-start align-items-center me-md-4"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              overflow: "hidden",
              backgroundColor: "white",
              padding: "8px",
              flexShrink: 0,
              boxShadow: `
        0 4px 12px rgba(0, 0, 0, 0.25),       /* depth shadow */
        0 0 12px rgba(0, 123, 255, 0.35),     /* blue glow */
        0 0 25px rgba(0, 198, 255, 0.25)      /* soft ambient glow */
      `,
              transition: "all 0.3s ease",
            }}
          >
            <img
              src={logo}
              alt="MicroDegree Logo"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                borderRadius: "50%",
              }}
            />
          </motion.div>

          {/* 🧠 Text Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center text-md-start"
          >
            <h1 className="fw-bold mb-2">
              Top <span style={{ color: "#fff" }}>Cloud</span> &{" "}
              <span style={{ color: "#fff" }}>DevOps</span> Profiles —{" "}
              <span
                style={{
                  color: "#ffe082",
                  textShadow: "0 0 12px rgba(255, 255, 255, 0.5)",
                }}
              >
                {new Date().toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </h1>
            <p className="lead mb-0 text-light fw-semibold">
              Verified professionals — ready to join your team 🚀
            </p>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-3 mb-4 fw-semibold">
          <select
            className="form-select w-auto shadow-sm rounded-pill fw-semibold"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all"> Select Tech Stack</option>
            <option value="aws">AWS Profiles</option>
            <option value="devops">DevOps Profiles</option>
            <option value="linux-networking">
              Linux & Networking Profiles
            </option>
          </select>

          {/* ✅ Experience Level Checkboxes */}
          {/* 🌟 Experience Filters with Labels, Ranges, and Clear Option */}
          <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 mb-3 position-relative">
            {[
              { label: "Fresher", range: "0–6 months" },
              { label: "Early Professional", range: "6 months – 3 years" },
              { label: "Mid", range: "3 – 7 years" },
              { label: "Senior", range: "7+ years" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="form-check d-flex flex-column align-items-center"
                  onClick={() =>
                    setExpFilter((prev) =>
                      prev.includes(item.label)
                        ? prev.filter((r) => r !== item.label)
                        : [...prev, item.label]
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  <input
                    className="form-check-input mb-1"
                    type="checkbox"
                    id={item.label}
                    style={{ transform: "scale(1.3)", cursor: "pointer" }}
                    checked={expFilter.includes(item.label)}
                    readOnly
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor={item.label}
                    style={{ fontSize: "1rem" }}
                  >
                    {item.label}
                  </label>
                  <div
                    className="text-muted small"
                    style={{ fontSize: "0.8rem" }}
                  >
                    {item.range}
                  </div>
                </div>
              </div>
            ))}

            {/* 🧹 Clear Filters Button */}
            <AnimatePresence>
              {expFilter.length > 0 && (
                <motion.button
                  key="clear-filters"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="btn btn-sm fw-semibold clear-filter-btn ms-2"
                  onClick={() => setExpFilter([])}
                  style={{
                    background: "linear-gradient(90deg, #007bff, #00c6ff)",
                    color: "white",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    boxShadow: "0 2px 6px rgba(0, 123, 255, 0.3)",
                  }}
                >
                  Clear Filters ✕
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <button
            className="btn btn-lg d-flex align-items-center gap-2 px-4 shadow-sm border-0 fw-semibold"
            style={{
              background: "linear-gradient(90deg, #007bff, #00c6ff)",
              color: "white",
            }}
            onClick={() => setShowRequestModal(true)}
          >
            <FaPaperPlane /> Im Interested
          </button>
        </div>

        {/* Search */}
        <div className="d-flex justify-content-between align-items-center mb-3 fw-semibold">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <span className="input-group-text bg-white border-end-0">
              <FaSearch />
            </span>
            <input
              type="text"
              placeholder="Search by name, skill, or location..."
              className="form-control border-start-0 fw-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-muted fw-semibold">
            Showing <strong>{filteredStudents.length}</strong> candidates
          </div>
        </div>

        {/* Table */}
        <motion.div
          className="table-responsive shadow-sm rounded-4 overflow-auto custom-scroll"
          style={{
            border: "1px solid #dee2e6",
            backgroundColor: "white",
            maxHeight: "70vh",
          }}
        >
          <table className="table align-middle mb-0">
            <thead
              style={{
                background: "linear-gradient(90deg, #007bff, #00c6ff)",
                color: "white",
                position: "sticky",
                top: 0,
                zIndex: 1,
              }}
            >
              <tr>
                <th
                  onClick={() => handleSort("full_name")}
                  style={{ cursor: "pointer" }}
                >
                  Name {getSortIcon("full_name")}
                </th>
                <th>Primary Skills</th>
                <th>Experience</th>
                <th>Notice Period</th>
                <th>Preferred Location</th>
                <th>Current CTC</th>
                <th>Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => (
                  <tr key={s.id}>
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
                      {s.primary_skills &&
                        s.primary_skills.split(",").map((skill, i) => (
                          <span key={i} style={{ marginRight: "6px" }}>
                            <SkillBadge skill={skill.trim()} />
                          </span>
                        ))}
                    </td>
                    <td>{s.experience || "—"} years</td>
                    <td>{s.notice_period || "—"}</td>
                    <td>
                      {s.preferred_location
                        ? s.preferred_location.split(",").map((loc, i) => {
                            const name = loc.trim().toLowerCase();
                            const { bg, color } =
                              locationColors[name] || locationColors.default;
                            return (
                              <span
                                key={i}
                                style={{
                                  backgroundColor: bg,
                                  color,
                                  padding: "8px 14px",
                                  borderRadius: "25px",
                                  fontWeight: 600,
                                  fontSize: "0.85rem",
                                  marginRight: "6px",
                                }}
                              >
                                {loc.trim()}
                              </span>
                            );
                          })
                        : "Remote"}
                    </td>
                    <td>
                      <td>
                        <td>
                          {s.current_ctc
                            ? (() => {
                                const value = parseFloat(s.current_ctc);
                                if (isNaN(value)) return "—";

                                // ✅ If the value looks like it's already in LPA (less than 100)
                                if (value < 100) return `${value} LPA`;

                                // ✅ If it's in absolute (like 3500000)
                                const inLpa = value / 100000;
                                return `${inLpa.toFixed(1)} LPA`;
                              })()
                            : "—"}
                        </td>
                      </td>
                    </td>

                    <td>
                      {s.resume_url ? (
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => setResumeModal(s.resume_url)}
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No matching candidates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

        {/* 🚀 Unlock More Profiles */}
        <div className="text-center mt-4 mb-5">
          <p className="text-muted fw-semibold mb-3">
            Looking for more profiles?{" "}
            <span className="text-primary">
              Unlock access to more Top candidates.
            </span>
          </p>
          <button
            className="btn btn-lg d-flex align-items-center gap-2 mx-auto px-4 shadow-sm border-0 fw-semibold"
            style={{
              background: "linear-gradient(90deg, #007bff, #00c6ff)",
              color: "white",
            }}
            onClick={() => setShowRequestModal(true)}
          >
            <FaPaperPlane /> Unlock More Profiles
          </button>
        </div>
      </div>

      {/* ✅ Resume Modal */}
      <AnimatePresence>
        {resumeModal && (
          <motion.div
            className="modal fade show d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content rounded-4 shadow-lg">
                <div className="modal-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="modal-title mb-0">📄 Candidate Resume</h5>
                  <div className="d-flex align-items-center gap-2">
                    <a
                      href={resumeModal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-light btn-sm fw-semibold"
                      style={{ border: "none", color: "#007bff" }}
                    >
                      Open in New Tab
                    </a>
                    <button
                      type="button"
                      className="btn-close btn-close-white"
                      onClick={() => setResumeModal(null)}
                    ></button>
                  </div>
                </div>
                <div className="modal-body" style={{ height: "80vh" }}>
                  <iframe
                    src={
                      resumeModal.includes("/preview")
                        ? `${resumeModal}?rm=embedded`
                        : `${resumeModal}#toolbar=0&navpanes=0&scrollbar=0`
                    }
                    title="Resume Preview"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                    allow="autoplay"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Request Profile Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div
            className="modal fade show d-block request-modal"
            style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="modal-dialog modal-md modal-dialog-centered">
              <div className="modal-content">
                <div
                  className="modal-header recruiter-modal-header text-white position-relative"
                  style={{
                    background: "linear-gradient(90deg, #007bff, #00c6ff)",
                    borderTopLeftRadius: "20px",
                    borderTopRightRadius: "20px",
                    boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
                  }}
                >
                  <h5 className="modal-title fw-semibold d-flex align-items-center mb-0">
                    <FaPaperPlane className="me-2 fs-5" />
                    Request Candidate Profiles
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowRequestModal(false)}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  {!formSubmitted ? (
                    <>
                      <div className="text-center mb-4 recruiter-title-section">
                        <div className="title-glitter-bar mb-3"></div>
                        <h5 className="fw-bold text-dark mb-2">
                          Recruiter Contact Details
                        </h5>
                        <p className="text-muted small mb-0">
                          Please fill out your details below. Our team will
                          reach out to share the Top candidate interested
                          profiles that match your requirement.
                        </p>
                      </div>

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
                    </>
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
                          width: "80px",
                          height: "80px",
                          borderRadius: "50%",
                          background:
                            "linear-gradient(90deg, #00c6ff, #007bff)",
                          margin: "0 auto",
                          boxShadow: "0 4px 15px rgba(0,123,255,0.3)",
                        }}
                      >
                        <FaCheckCircle size={40} color="white" />
                      </div>
                      <h5 className="fw-bold mt-3 text-success">
                        Thank You for Your Request!
                      </h5>
                      <p className="text-muted small">
                        Our placement team will get in touch with you shortly
                        and share the most relevant candidate profiles.
                      </p>
                      <button
                        className="btn btn-primary mt-3"
                        style={{
                          background:
                            "linear-gradient(90deg, #007bff, #00c6ff)",
                          border: "none",
                        }}
                        onClick={() => setShowRequestModal(false)}
                      >
                        Close
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
