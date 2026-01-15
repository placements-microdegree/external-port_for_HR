import React, { useState } from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import {
  FaAws,
  FaStar,
  FaBriefcase,
  FaRupeeSign,
  FaChartLine,
  FaMapMarkerAlt,
  FaClock,
} from "react-icons/fa";
import "./CandidateCard.css";

export default function CandidateCard({
  student,
  isSelected,
  onToggleSelection,
  formatExperience,
  formatNotice,
  getInitials,
  toLpa,
  parseCSV,
  onOpenResume,
}) {
  const MAX_INLINE_SKILLS = 5;
  const MAX_INLINE_LOCATIONS = 2;

  const locations = parseCSV(student.preferred_location);
  const primaryLocation = locations[0] || "Remote";
  const skills = parseCSV(student.primary_skills);
  const currentCtcLpa = toLpa(student.current_ctc || 0);
  const expectedCtcLpa = toLpa(student.expected_ctc || 0);
  const hasAwsBadge = true;
  const isTopCandidate = String(student.candidate_tag || "")
    .toLowerCase()
    .includes("top candidate");
  const noticeRaw = String(student.notice_period || "").toLowerCase();
  const isImmediateJoiner =
    noticeRaw.includes("immediate") ||
    noticeRaw === "0" ||
    noticeRaw === "0 days" ||
    noticeRaw === "0 day";

  const topBadges = [];
  if (hasAwsBadge) {
    topBadges.push({
      key: "aws-certified",
      label: "AWS CERTIFIED",
      tone: "accent",
      icon: <FaAws aria-hidden="true" />,
    });
  }
  if (isTopCandidate) {
    topBadges.push({
      key: "top-candidate",
      label: "TOP CANDIDATE",
      tone: "primary",
      icon: <FaStar aria-hidden="true" color="#f6c343" />,
    });
  }
  if (isImmediateJoiner) {
    topBadges.push({
      key: "immediate-joiner",
      label: "IMMEDIATE JOINER",
      tone: "success",
      icon: "⚡",
    });
  }

  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [locationsExpanded, setLocationsExpanded] = useState(false);

  const skillCount = skills.length;
  const skillRemaining = Math.max(0, skillCount - MAX_INLINE_SKILLS);
  const skillsExpandLabel = (() => {
    if (skillsExpanded) return "Show less";
    if (skillRemaining > 0) return `+${skillRemaining} more`;
    return null;
  })();

  const locationCount = locations.length;
  const locationRemaining = Math.max(0, locationCount - MAX_INLINE_LOCATIONS);
  const locationsExpandLabel = (() => {
    if (locationsExpanded) return "Show less";
    if (locationRemaining > 0) return `+${locationRemaining} more`;
    return null;
  })();

  const skillsToShow = skillsExpanded
    ? skills
    : skills.slice(0, MAX_INLINE_SKILLS);

  const locationsToShow = locationsExpanded
    ? locations
    : locations.slice(0, MAX_INLINE_LOCATIONS);

  const handleResumeClick = (event) => {
    event.stopPropagation();
    if (!student.resume_url) return;
    onOpenResume?.(student.resume_url);
  };

  return (
    <motion.div data-id={student.id} className="candidate-card">
      <div className="candidate-card-select">
        <input
          type="checkbox"
          className="candidate-select-checkbox"
          checked={isSelected}
          onChange={(event) => {
            event.stopPropagation();
            onToggleSelection(student.id);
          }}
          aria-label={`Select candidate ${student.full_name}`}
        />
      </div>

      <div className="candidate-card-body">
        <div className="candidate-card-main">
          <div className="candidate-card-left">
            <div className="candidate-card-metrics">
              <div className="metric" title="Experience">
                <span className="metric-icon">
                  <FaBriefcase aria-hidden="true" />
                </span>
                <div className="metric-content">
                  <p className="metric-value">
                    {formatExperience(student.experience)}
                  </p>
                  <small>Experience</small>
                </div>
              </div>
              <div className="metric" title="Current CTC">
                <span className="metric-icon">
                  <FaRupeeSign aria-hidden="true" />
                </span>
                <div className="metric-content">
                  <p className="metric-value">{currentCtcLpa.toFixed(1)} LPA</p>
                  <small>Current CTC</small>
                </div>
              </div>
              <div className="metric" title="Expected CTC">
                <span className="metric-icon">
                  <FaChartLine aria-hidden="true" />
                </span>
                <div className="metric-content">
                  <p className="metric-value">
                    {expectedCtcLpa.toFixed(1)} LPA
                  </p>
                  <small>Expected CTC</small>
                </div>
              </div>
              <div className="metric" title="Primary location">
                <span className="metric-icon">
                  <FaMapMarkerAlt aria-hidden="true" />
                </span>
                <div className="metric-content">
                  <p className="metric-value">{primaryLocation}</p>
                  <small>Location</small>
                </div>
              </div>
              <div className="metric" title="Notice period">
                <span className="metric-icon">
                  <FaClock aria-hidden="true" />
                </span>
                <div className="metric-content">
                  <p className="metric-value">
                    {formatNotice(student.notice_period)}
                  </p>
                  <small>Notice</small>
                </div>
              </div>
            </div>

            <div className="candidate-skill-summary">
              <div className="skill-summary-text">
                <span className="key-label">Key Skills</span>
                <span className="key-value-text">
                  <span className="key-skill-inline">
                    {skillsToShow.length
                      ? skillsToShow.map((skill, index) => (
                          <React.Fragment
                            key={`${student.id}-skill-inline-${index}`}
                          >
                            {index > 0 ? ", " : ""}
                            {skill}
                          </React.Fragment>
                        ))
                      : "—"}
                    {skillsExpandLabel && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary skill-expand"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSkillsExpanded((prev) => !prev);
                          }}
                        >
                          {skillsExpandLabel}
                        </button>
                      </>
                    )}
                  </span>
                </span>
              </div>
              <div className="skill-summary-text">
                <span className="key-label">Preferred locations</span>
                <span className="key-value-text">
                  <span className="key-location-inline">
                    {locationsToShow.length
                      ? locationsToShow.map((location, index) => (
                          <React.Fragment
                            key={`${student.id}-location-inline-${index}`}
                          >
                            {index > 0 ? ", " : ""}
                            {location}
                          </React.Fragment>
                        ))
                      : "Flexible"}
                    {locationsExpandLabel && (
                      <>
                        {" "}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary skill-expand"
                          onClick={(event) => {
                            event.stopPropagation();
                            setLocationsExpanded((prev) => !prev);
                          }}
                        >
                          {locationsExpandLabel}
                        </button>
                      </>
                    )}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div className="candidate-card-right">
            <div className="candidate-identity">
              <div className="candidate-identity-text">
                <div className="candidate-name">
                  <h5>
                    {student.primary_role ||
                      student.role ||
                      "Cloud Professional"}
                  </h5>
                </div>
                <div className="candidate-role text-muted">
                  {student.full_name}
                </div>
              </div>
            </div>

            <div className="candidate-actions">
              <button
                type="button"
                className="btn btn-sm btn-primary view-resume-btn"
                onClick={handleResumeClick}
                disabled={!student.resume_url}
                aria-label={`View resume for ${student.full_name}`}
              >
                View Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

CandidateCard.propTypes = {
  student: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onToggleSelection: PropTypes.func.isRequired,
  formatExperience: PropTypes.func.isRequired,
  formatNotice: PropTypes.func.isRequired,
  getInitials: PropTypes.func.isRequired,
  toLpa: PropTypes.func.isRequired,
  parseCSV: PropTypes.func.isRequired,
  onOpenResume: PropTypes.func,
};
