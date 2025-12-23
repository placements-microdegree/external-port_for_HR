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
    return (
      <div className="text-center bg-white rounded-4 shadow-sm py-4">
        Loading candidates...
      </div>
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
