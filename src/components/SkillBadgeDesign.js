import React from "react";

// 🎨 Airtable-style color palette
const skillColors = {
  aws: { bg: "#E6F4EA", color: "#1B5E20" },           // soft green
  docker: { bg: "#E3F2FD", color: "#0D47A1" },        // soft blue
  kubernetes: { bg: "#E8EAF6", color: "#283593" },    // indigo
  terraform: { bg: "#F3E5F5", color: "#6A1B9A" },     // lavender
  prometheus: { bg: "#FBE9E7", color: "#D84315" },    // orange
  grafana: { bg: "#FFF3E0", color: "#E65100" },       // amber
  ansible: { bg: "#FFEBEE", color: "#B71C1C" },       // red
  linux: { bg: "#F1F8E9", color: "#33691E" },         // green
  networking: { bg: "#E0F7FA", color: "#006064" },    // teal
  jenkins: { bg: "#FFF8E1", color: "#795548" },       // light brown
  git: { bg: "#FBE9E7", color: "#BF360C" },           // orange brown
  ci: { bg: "#E8F5E9", color: "#1B5E20" },            // green
  cd: { bg: "#E3F2FD", color: "#0D47A1" },            // blue
  default: { bg: "#F5F5F5", color: "#424242" },       // neutral grey
};

// 🧩 Airtable-Style Badge Component
export const SkillBadge = ({ skill }) => {
  const normalized = skill.trim().toLowerCase();
  const { bg, color } = skillColors[normalized] || skillColors.default;

  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        fontWeight: "600",
        padding: "3px 10px",
        borderRadius: "12px",
        fontSize: "0.7rem",
        margin: "2px 4px",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1px solid ${color}25`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        transition: "all 0.2s ease-in-out",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
    >
      {skill.trim()}
    </span>
  );
};
