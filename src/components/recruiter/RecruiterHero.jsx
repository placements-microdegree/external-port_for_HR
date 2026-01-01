import React from "react";
import { motion } from "framer-motion";
import logo from "../../assets/Logo.png";

export default function RecruiterHero({ headerHidden, collapseOffset = 140 }) {
  return (
    <motion.div
      className="p-4 rounded-4 mb-4 d-flex flex-column flex-md-row align-items-center justify-content-center gap-3 recruiter-header"
      style={{
        background: "linear-gradient(90deg, #007bff, #00c6ff)",
        color: "white",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{
        opacity: headerHidden ? 0 : 1,
        y: headerHidden ? -collapseOffset : 0,
      }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="d-flex justify-content-center align-items-center recruiter-header-logo"
      >
        <img
          src={logo}
          alt="MicroDegree"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </motion.div>
      <div className="recruiter-header-text text-center text-md-start">
        <h2 className="fw-semibold mb-1">
          Top Cloud & DevOps Talent
          <span
            className="ms-2"
            style={{ color: "#ffe082", fontSize: "0.9rem" }}
          >
            {new Date().toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </h2>
        <p className="mb-0">
          Verified professionals ready for interviews & fast onboarding.
        </p>
        <button className="browse-talent-btn mt-3" type="button">
          Browse Talent
        </button>
      </div>
    </motion.div>
  );
}
