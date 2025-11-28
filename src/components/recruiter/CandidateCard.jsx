import React from "react";
import { motion } from "framer-motion";
import { FaAws, FaStar } from "react-icons/fa";

export default function CandidateCard({
  student,
  isActive,
  isSelected,
  onToggleSelection,
  onRowClick,
  formatExperience,
  formatNotice,
  getInitials,
  getRelativeDayLabel,
  toLpa,
  parseCSV,
  formatWorkMode,
}) {
  const locations = parseCSV(student.preferred_location);
  const primaryLocation = locations[0] || "Remote";
  const skills = parseCSV(student.primary_skills);
  const currentCtcLpa = toLpa(student.current_ctc || 0);
  const workModeLabel = formatWorkMode(student.work_mode);

  const hasAwsBadge = true; // Requested: show AWS badge for every candidate
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
      tone: "amber",
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

  return (
    <motion.div
      data-id={student.id}
      className={`candidate-card ${isActive ? "active" : ""}`}
      onClick={(event) => onRowClick(student, event)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 200, damping: 30 }}
    >
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
        <div className="candidate-card-top">
          <div className="candidate-top-left">
            <div className="candidate-avatar">
              {getInitials(student.full_name)}
            </div>
            <div className="candidate-card-title">
              {student.candidate_tag && (
                <span className="candidate-chip text-uppercase">
                  {student.candidate_tag}
                </span>
              )}
              <h5 className="candidate-name mb-1">{student.full_name}</h5>
              <div className="candidate-role text-muted">
                {student.primary_role || student.role || "Cloud Professional"}
              </div>
              <div className="candidate-meta-inline text-muted">
                <span>{formatExperience(student.experience)}</span>
                <span>•</span>
                <span>{primaryLocation}</span>
                <span>•</span>
                <span>
                  {getRelativeDayLabel(
                    student.updated_at || student.created_at
                  )}
                </span>
              </div>
            </div>
          </div>
          {topBadges.length > 0 && (
            <div className="candidate-status-badges badge-strip-top">
              {topBadges.map((badge) => (
                <span
                  key={`${student.id}-${badge.key}`}
                  className={`candidate-status-badge badge-${badge.tone}`}
                >
                  <span aria-hidden="true">{badge.icon}</span>
                  {badge.label}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="candidate-card-meta-grid">
          <div className="meta-item">
            <span className="meta-label">Experience</span>
            <span className="meta-value">
              {formatExperience(student.experience)}
            </span>
          </div>
          <div className="meta-item meta-hide-mobile">
            <span className="meta-label">Notice Period</span>
            <span className="meta-value">
              {formatNotice(student.notice_period)}
            </span>
          </div>
          <div className="meta-item meta-hide-mobile">
            <span className="meta-label">Preferred Location</span>
            <span className="meta-value">{primaryLocation}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Current CTC</span>
            <span className="meta-value">{`${currentCtcLpa.toFixed(
              1
            )} LPA`}</span>
          </div>
          <div className="meta-item meta-hide-mobile">
            <span className="meta-label">Expected CTC</span>
            <span className="meta-value">{`${toLpa(
              student.expected_ctc
            ).toFixed(1)} LPA`}</span>
          </div>
          <div className="meta-item meta-hide-mobile">
            <span className="meta-label">Work Mode</span>
            <span className="meta-value">{workModeLabel}</span>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="candidate-skill-row">
            {skills.slice(0, 6).map((skill, index) => (
              <span
                key={`${student.id}-skill-${index}`}
                className="candidate-skill-chip"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="candidate-skill-chip more-chip">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
