import React from "react";
import { motion } from "framer-motion";
import CandidateCard from "./CandidateCard";

export default function CandidateList({
  students,
  loading,
  error,
  activeCandidateId,
  showDetails,
  handleRowClick,
  toggleSelection,
  selectedCandidates,
  formatExperience,
  formatNotice,
  getInitials,
  getRelativeDayLabel,
  toLpa,
  parseCSV,
  formatWorkMode,
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
          isActive={showDetails && activeCandidateId === student.id}
          isSelected={selectedCandidates.has(String(student.id))}
          onToggleSelection={toggleSelection}
          onRowClick={handleRowClick}
          formatExperience={formatExperience}
          formatNotice={formatNotice}
          getInitials={getInitials}
          getRelativeDayLabel={getRelativeDayLabel}
          toLpa={toLpa}
          parseCSV={parseCSV}
          formatWorkMode={formatWorkMode}
        />
      ))}
    </motion.div>
  );
}
