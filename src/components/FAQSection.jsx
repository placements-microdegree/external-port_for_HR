import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const faqs = [
  {
    question: "How much do you charge?",
    answer:
      "It's free for first 5 hires. After that, if you find our candidates interesting and if it's saving you time, we can discuss some nominal commission for our team's efforts.",
  },
  {
    question: "Why are you doing this?",
    answer:
      "We are an edtech firm specialising in Cloud, DevOps, and GenAI training. Our goal is to place our students, mapping the best talent to deserving companies.",
  },
  {
    question: "Do you do only Cloud / DevOps / GenAI?",
    answer:
      "Yes, we specialize only in this tech stack. We have around 10k+ active Cloud stack profiles.",
  },
  {
    question: "Is it only freshers or do you have experienced candidates?",
    answer:
      "We have mostly experienced candidates who are already DevOps professionals. They come to us to upskill in Terraform, advanced technologies, and CKA/global certifications.",
  },
  {
    question: "Do you have other tech stack candidates?",
    answer:
      "No, above 2 years we don’t cater to other tech stacks. For less than 2 years of experience, we have candidates in Cloud, Dev, ReactJS, Testing, UI/UX, etc.",
  },
  {
    question: "How can I get more profiles?",
    answer:
      "Just fill the form. Our HR recruiters will reach out to you and map the candidates you need. We can also pool other experienced candidates interested in your requirements.",
  },
  {
    question: "Do you place only your students?",
    answer:
      "No, we run open placement drives for outside talent too. We screen resumes and fundamentals, and only list the top 10% of active candidates here.",
  },
  {
    question:
      "Will you help us source outside candidates if you don't find it internally?",
    answer: "We can discuss this based on the efforts required.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="container my-5">
      <h2 className="text-center fw-bold mb-4">Frequently Asked Questions</h2>
      <div className="faq-section mx-auto" style={{ maxWidth: "1300px" }}>
        {faqs.map((item, index) => (
          <div
            key={index}
            className="faq-item mb-3 rounded-3 shadow-sm"
            style={{
              background: "#fff",
              border: "1px solid #e0e0e0",
              overflow: "hidden",
            }}
          >
            <button
              className="faq-question w-100 text-start d-flex justify-content-between align-items-center p-3 fw-semibold"
              style={{
                border: "none",
                background: "transparent",
                fontSize: "1.05rem",
                color: "#222",
              }}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {item.question}
              {openIndex === index ? (
                <FaChevronUp color="#007bff" />
              ) : (
                <FaChevronDown color="#007bff" />
              )}
            </button>
            {openIndex === index && (
              <div
                className="faq-answer px-3 pb-3 text-muted"
                style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
              >
                {item.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
