import React from "react";
import { HiPhone, HiMail } from "react-icons/hi";
import {
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";
import "./Footer.css";

const COURSE_LINKS = [
  { label: "Prime", href: "https://www.microdegree.work/prime" },
  { label: "Power BI", href: "https://www.microdegree.work/powerbi" },
  {
    label: "Manual Testing",
    href: "https://microdegree.thinkific.com/courses/manual-testing-recorded",
  },
  {
    label: "Docker & Kubernetes",
    href: "https://www.microdegree.work/dockerandkubernetes",
  },
  {
    label: "Java Automation Testing",
    href: "https://www.microdegree.work/java-at",
  },
  {
    label: "Python Automation Testing",
    href: "https://microdegree.thinkific.com/courses/automation-testing-selenium",
  },
  {
    label: "Python Full-Stack",
    href: "https://www.microdegree.work/pythonfullstack",
  },
];

const COMPANY_LINKS = [
  { label: "About", href: "https://pages.microdegree.work/about.html" },
  {
    label: "All Courses",
    href: "https://courses.microdegree.work/pages/premium-courses",
  },
  {
    label: "Scholarships",
    href: "https://pages.microdegree.work/scholarship.html",
  },
  {
    label: "Trending Course",
    href: "https://courses.microdegree.work/courses/aws-certification-live",
  },
  {
    label: "Refund Policy",
    href: "https://www.microdegree.work/refund-and-course-rescheduling-policy",
  },
];

const USEFUL_LINKS = [
  { label: "Blogs", href: "https://www.microdegree.work/blog", accent: true },
  {
    label: "Hire Talent(HR)",
    href: "https://talent.microdegree.work",
    accent: true,
  },
  {
    label: "Community",
    href: "https://t.me/microdegreekannada",
  },
  {
    label: "DevOps Jobs",
    href: "https://www.microdegree.work/company_vacancies",
    accent: true,
  },
  {
    label: "Full Courses",
    href: "https://www.microdegree.work/YTFullCoursePage",
  },
  {
    label: "Refer & Earn",
    href: "https://mdegree.in/web_referral",
    accent: true,
  },
  {
    label: "Resume Builder",
    href: "https://www.microdegree.work/microresume",
    accent: true,
  },
];

const LEGAL_LINKS = [
  {
    label: "Terms & Conditions",
    href: "https://pages.microdegree.work/termsnconditions.html",
  },
  {
    label: "Refund Policy",
    href: "https://www.microdegree.work/refund-and-course-rescheduling-policy",
  },
  { label: "Legal & Privacy", href: "https://www.microdegree.work/Legal" },
];

const SOCIAL_LINKS = [
  {
    icon: <FaFacebookF />,
    href: "https://www.facebook.com/MicroDegree-101072281390361/?modal=admin_todo_tour",
    label: "Facebook",
  },
  {
    icon: <FaLinkedinIn />,
    href: "https://www.linkedin.com/company/microdegree/?viewAsMember=true",
    label: "LinkedIn",
  },
  {
    icon: <FaYoutube />,
    href: "https://www.youtube.com/channel/UCu8l4v6xqQd8LfOfd0kMPsA",
    label: "YouTube",
  },
  {
    icon: <FaInstagram />,
    href: "https://www.instagram.com/microdegree.work/?hl=en",
    label: "Instagram",
  },
];

function Footer() {
  return (
    <footer className="md-footer" aria-label="MicroDegree footer">
      <section className="md-footer__content">
        <div className="md-footer__col md-footer__brand">
          <h2>
            Micro<span>Degree</span>
            <sup>®</sup>
          </h2>
          <p>
            MicroDegree is an Ed-tech platform teaching coding & job-ready
            skills in Kannada at an affordable price.
          </p>
          <div className="md-footer__social" aria-label="Social links">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.icon}
                <span className="sr-only">{item.label}</span>
              </a>
            ))}
          </div>
        </div>
        <div className="md-footer__col">
          <h3>Live-Recorded Courses</h3>
          <ul>
            {COURSE_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md-footer__col">
          <h3>Company</h3>
          <ul>
            {COMPANY_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md-footer__col">
          <h3>Useful Links</h3>
          <ul>
            {USEFUL_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={link.accent ? "accent" : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="md-footer__col md-footer__contact">
          <h3>Contact us</h3>
          <div>
            <span className="md-footer__icon" aria-hidden="true">
              <HiPhone />
            </span>
            <p>0804-710-9999</p>
          </div>
          <p>
            Mangaluru Office: K-tech Innovation Hub, 3rd Floor, Plama Building,
            Bejai, Mangaluru, Karnataka 575004.
          </p>
          <div>
            <span className="md-footer__icon" aria-hidden="true">
              <HiMail />
            </span>
            <p>hello@microdegree.work</p>
          </div>
          <p>
            Bengaluru Office: Sri Guruprasad Vasavi Classic, 3rd Floor, 10th
            Main Rd, 4th Block, Jayanagar, Bengaluru, Karnataka 560011.
          </p>
        </div>
      </section>

      <section className="md-footer__legal">
        <p>
          Copyright © MICRODEGREE EDUCATION PRIVATE LIMITED. All Rights
          Reserved.
        </p>
        <div>
          {LEGAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </footer>
  );
}

export default Footer;
