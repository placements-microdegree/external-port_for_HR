import React from "react";

// 🧩 Skill badge (dark-theme friendly)
export const SkillBadge = ({ skill }) => {
  const label = (skill ?? "").trim();

  if (!label) return null;

  return <span className="skill-badge">{label}</span>;
};
