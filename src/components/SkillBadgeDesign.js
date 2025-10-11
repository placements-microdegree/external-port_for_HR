// src/components/SkillBadgeDesign.js
import React from "react";

// 🎨 Color palette for skill bubbles (light background + dark text)
const skillColors = {
  aws: { bg: "#FFF7E6", color: "#E67E22" },
  docker: { bg: "#E6F2FF", color: "#007BFF" },
  kubernetes: { bg: "#E9EEFF", color: "#304FFE" },
  terraform: { bg: "#EFE6FF", color: "#6C3EFF" },
  prometheus: { bg: "#FFF0E6", color: "#E74C3C" },
  grafana: { bg: "#FFF5E6", color: "#E67E22" },
  azure: { bg: "#E6F0FF", color: "#0078D7" },
  gcp: { bg: "#FFF8E6", color: "#EA4335" },
  rds: { bg: "#E6F8FF", color: "#007CBA" },
  linux: { bg: "#FFFBE6", color: "#000000" },
  networking: { bg: "#E6FFF2", color: "#009970" },
  "ci/cd": { bg: "#F4E6FF", color: "#8000FF" },
};

// 🟢 SkillBadge component — creates soft color-coded skill bubbles
export const SkillBadge = ({ skill }) => {
  const normalized = skill.trim().toLowerCase();
  const { bg, color } = skillColors[normalized] || {
    bg: "#F1F1F1",
    color: "#333",
  };

  return (
    <span
      style={{
        backgroundColor: bg,
        color,
        fontWeight: "600",
        padding: "8px 14px",
        borderRadius: "25px",
        fontSize: "0.65rem",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
        border: `1px solid ${color}20`,
        transition: "transform 0.2s ease",
      }}
      onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
      onMouseLeave={(e) => (e.target.style.transform = "scale(1.0)")}
    >
      {skill.trim()}
    </span>
  );
};

