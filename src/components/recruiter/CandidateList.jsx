import React from "react";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import CandidateCard from "./CandidateCard";

export default function CandidateList({
  students,
  loading,
  error,
  toggleSelection,
  selectedCandidates,
  formatExperience,
  formatNotice,
  getInitials,
  toLpa,
  parseCSV,
  onOpenResume,
}) {
  if (loading) {
    const skeletonCount = 7;
    return (
      <motion.div
        className="candidate-card-list d-flex flex-column gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        aria-busy="true"
        aria-label="Loading candidates"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div
            // Keep data-id to reuse CandidateCard-only anchoring styles
            data-id={`skeleton-${index}`}
            key={`skeleton-${index}`}
            className="candidate-card candidate-card-skeleton"
            aria-hidden="true"
          >
            <div className="candidate-card-select">
              <div className="skeleton-box skeleton-checkbox" />
            </div>

            <div className="candidate-card-body">
              <div className="candidate-card-main">
                <div className="candidate-card-left">
                  <div className="candidate-identity justify-content-start">
                    <div className="skeleton-box skeleton-avatar" />
                    <div className="candidate-identity-text align-items-start">
                      <div className="skeleton-line w-220" />
                      <div className="skeleton-line w-140" />
                    </div>
                  </div>

                  <div className="candidate-card-metrics">
                    <div className="skeleton-line w-120" />
                    <div className="skeleton-line w-160" />
                    <div className="skeleton-line w-140" />
                  </div>

                  <div className="candidate-skill-summary">
                    <div className="skeleton-line w-280" />
                    <div className="skeleton-line w-240" />
                  </div>
                </div>

                <div className="candidate-card-right">
                  <div className="skeleton-line w-140" />
                  <div className="skeleton-line w-120" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-danger bg-white rounded-4 shadow-sm py-4">
        {error}
      </div>
    );
  }

  if (!students.length) {
    return (
      <div className="text-center text-muted bg-white rounded-4 shadow-sm py-4">
        No matching candidates found.
      </div>
    );
  }

  return (
    <motion.div
      className="candidate-card-list d-flex flex-column gap-3"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {students.map((student) => (
        <CandidateCard
          key={student.id}
          student={student}
          isSelected={selectedCandidates.has(String(student.id))}
          onToggleSelection={toggleSelection}
          formatExperience={formatExperience}
          formatNotice={formatNotice}
          getInitials={getInitials}
          toLpa={toLpa}
          parseCSV={parseCSV}
          onOpenResume={onOpenResume}
        />
      ))}
    </motion.div>
  );
}

CandidateList.propTypes = {
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  toggleSelection: PropTypes.func.isRequired,
  selectedCandidates: PropTypes.instanceOf(Set).isRequired,
  formatExperience: PropTypes.func.isRequired,
  formatNotice: PropTypes.func.isRequired,
  getInitials: PropTypes.func.isRequired,
  toLpa: PropTypes.func.isRequired,
  parseCSV: PropTypes.func.isRequired,
  onOpenResume: PropTypes.func,
};
