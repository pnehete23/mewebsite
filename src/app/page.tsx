"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

// Add this to your globals.css
/*
.animated-bg {
  background: linear-gradient(45deg, #111827, #1f2937, #111827);
  background-size: 400% 400%;
  animation: gradientAnimation 20s ease infinite;
}

@keyframes gradientAnimation {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
*/

export default function Home() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const dropdownVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-bg">
      <div className="max-w-5xl mx-auto text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Name */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
          >
            Prathamesh Nehete
          </motion.h1>

          {/* Profile Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
            className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mt-4 rounded-full overflow-hidden shadow-lg border border-white/20"
          >
            <img
              src="image01.jpeg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-sm font-medium">Profile Photo</p>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Full-Stack Developer & Creative Problem Solver
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-gray-400 max-w-lg mx-auto text-sm md:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Crafting seamless digital experiences with modern technologies
          </motion.p>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                href="/projects"
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center h-12"
              >
                View My Work
              </Link>
            </motion.div>
            {/* Removed "View My Work" and "Get In Touch" buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
                <button
                  onClick={() => setIsResumeOpen(!isResumeOpen)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 h-12 flex items-center justify-center group"
                >
                  <span className="flex items-center justify-center">
                    {isResumeOpen ? "Close Resume" : "View Resume"}
                    <motion.span 
                      animate={{ 
                        rotate: isResumeOpen ? 180 : 0,
                        x: isResumeOpen ? 2 : 0
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      className="ml-2 text-sm"
                    >
                      {isResumeOpen ? "↑" : "↓"}
                    </motion.span>
                  </span>
                  <motion.div 
                    className="absolute inset-0 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                    animate={isResumeOpen ? { scale: 1.05 } : { scale: 1 }}
                  />
                </button>
            </motion.div>
          </motion.div>

          {/* Social Media Icons */}
          <motion.div
            className="flex justify-center gap-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.4 }}
          >
            <a
              href="https://www.linkedin.com/in/nehete23/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transform hover:scale-125 transition-transform duration-300"
            >
              <FaLinkedin className="text-2xl text-gray-400 hover:text-white" />
            </a>
            <a
              href="https://github.com/pnehete23"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transform hover:scale-125 transition-transform duration-300"
            >
              <FaGithub className="text-2xl text-gray-400 hover:text-white" />
            </a>
          </motion.div>
        </motion.div>

        {/* Resume Dropdown */}
        <AnimatePresence>
          {isResumeOpen && (
            <motion.div
              key="resume-dropdown"
              variants={dropdownVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mt-8 p-6 bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Resume</h2>
                <button
                  onClick={() => setIsResumeOpen(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="space-y-6 text-left text-gray-300 text-sm md:text-base">
                {/* Education */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Education</h3>
                  <div>
                    <span className="font-semibold">Arizona State University</span>
                    <br />
                    B.S. in Computer Science, Business Minor
                    <br />
                    <span className="text-gray-400 text-sm">Aug 2021 - May 2025</span>
                  </div>
                  <div className="text-gray-400 text-sm mt-1">
                    Actively seeking Internship and Full-Time opportunities.
                  </div>
                </section>

                {/* Experience */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-blue-300">Electroactive Technologies</span>
                      <span className="text-gray-400"> (Remote, Knoxville, TN)</span>
                      <br />
                      <span className="italic text-gray-300">Software Development Engineering Intern</span>
                      <span className="text-gray-400"> | May 2024 – Jan 2025</span>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Designed a distributed data processing system in C++, reducing query response time by 40%.</li>
                        <li>Collaborated with teams to build reliable object-oriented solutions, improving system reliability by 25%.</li>
                        <li>Enhanced reporting by solving data integrity challenges, increasing capabilities by 30%.</li>
                        <li>Developed automated testing pipelines to ensure code quality.</li>
                        <li>Integrated monitoring tools to resolve system bottlenecks proactively.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">YYC Beeswax LTD (ASU Capstone)</span>
                      <span className="text-gray-400"> (Alberta, Canada)</span>
                      <br />
                      <span className="italic text-gray-300">Software Development Engineer Intern</span>
                      <span className="text-gray-400"> | Aug 2024 – Mar 2025</span>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Reduced transaction failures by 35% while supporting 3x more users.</li>
                        <li>Developed a caching architecture in C#, improving query response times by 45%.</li>
                        <li>Created scalable system architecture, enhancing cloud scalability by 40%.</li>
                        <li>Implemented CI/CD pipelines to streamline deployment.</li>
                        <li>Delivered user-centric features with stakeholder collaboration.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Arizona State University, Gammage</span>
                      <span className="text-gray-400"> (Tempe, AZ)</span>
                      <br />
                      <span className="italic text-gray-300">Security Systems Engineer</span>
                      <span className="text-gray-400"> | Aug 2023 – Mar 2025</span>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Designed a monitoring system using Java and C++, improving response time by 35%.</li>
                        <li>Developed a scalable security database, optimizing staff allocation by 25%.</li>
                        <li>Built fault-tolerant algorithms, reducing breaches by 40%.</li>
                        <li>Optimized operations with data-driven analysis.</li>
                        <li>Integrated real-time alerting for threat detection.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Yashodhan Hospital</span>
                      <span className="text-gray-400"> (Pune, India)</span>
                      <br />
                      <span className="italic text-gray-300">Software Development Engineer Intern</span>
                      <span className="text-gray-400"> | May 2023 – Aug 2023</span>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Implemented a database solution, reducing query response time by 40%.</li>
                        <li>Built scalable web apps, increasing scheduling efficiency by 20%.</li>
                        <li>Optimized architecture, improving user satisfaction by 35%.</li>
                        <li>Automated patient record management to reduce errors.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Tech Mahindra</span>
                      <span className="text-gray-400"> (Pune, India)</span>
                      <br />
                      <span className="italic text-gray-300">IT Support Engineering Lead</span>
                      <span className="text-gray-400"> | May 2023 – Aug 2023</span>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Designed a monitoring system using Java, reducing troubleshooting time by 40%.</li>
                        <li>Optimized database queries, improving scalability by 40%.</li>
                        <li>Led a team of 5 engineers to deliver IT support.</li>
                        <li>Documented best practices for junior engineers.</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Projects</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        id: 1,
                        title: "OpenTitan",
                        description:
                          "Simulated and verified UART smoke test using Verilator/Bazel; analyzed waveform output and explored CPU integration for CVA6 (RISC-V).",
                        details: [
                          "Contributed to secure silicon design with lowRISC and Google.",
                          "Developed testbenches for regression testing.",
                          "Documented results for continuous improvement.",
                        ],
                      },
                      {
                        id: 2,
                        title: "AI Data-Science Mentor",
                        description:
                          "Built an AI mentor using OpenAI GPT, Claude AI, and real-time TTS for conversational learning.",
                        details: [
                          "Integrated voice interaction and adaptive feedback.",
                          "Implemented analytics for dynamic learning paths.",
                          "Deployed as a secure web app.",
                        ],
                      },
                      {
                        id: 3,
                        title: "Medi Cure AI Doctor",
                        description:
                          "Developed a medical assistant using Gemini 2.0 Flash, Pinecone, and Hugging Face for real-time health insights.",
                        details: [
                          "Enabled instant symptom analysis and recommendations.",
                          "Integrated with EHR systems for personalized advice.",
                          "Ensured HIPAA compliance.",
                        ],
                      },
                      {
                        id: 4,
                        title: "Tiny URLs",
                        description:
                          "Designed a distributed URL shortener with Flask, achieving 99.9% uptime.",
                        details: [
                          "Implemented analytics dashboard and robust API.",
                          "Utilized Redis for caching.",
                          "Added user authentication and custom URLs.",
                        ],
                      },
                      {
                        id: 5,
                        title: "Wellness Center Locator",
                        description:
                          "Built a locator using Java/C++, reducing search time by 40%.",
                        details: [
                          "Integrated geospatial algorithms for accuracy.",
                          "Developed RESTful APIs for mobile/web clients.",
                          "Implemented real-time location tracking.",
                        ],
                      },
                    ].map((project, index) => (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 hover:shadow-md transition-all duration-300"
                      >
                        <h4 className="font-semibold text-blue-300">{project.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                        <ul className="list-disc ml-5 text-gray-400 text-sm mt-2 space-y-1">
                          {project.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Skills</h3>
                  <ul className="grid grid-cols-2 gap-2 text-gray-300 text-sm">
                    {[
                      "HTML, Tailwind CSS, Framer Motion",
                      "Java, Python, C#, C++, Rust",
                      "Typescript, JavaScript, Node.js",
                      "SQL, NoSQL, Distributed storage",
                      "Data Structures & Algorithms",
                      "Power-BI",
                      "Pinecone, Hugging Face Embeddings",
                      "GPT/Claude APIs",
                      "Distributed systems",
                      "Advanced GIT skills",
                      "Streamlit, API development",
                      "Object-oriented design",
                      "Embedded Programming",
                      "System Verilog",
                    ].map((skill, index) => (
                      <li key={index} className="list-disc ml-5">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Certifications */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Certifications</h3>
                  <ul className="list-disc ml-5 text-gray-300 text-sm space-y-2">
                    <li>
                      <span className="font-semibold">Infosys Spring Boot Certified Software Engineering</span>
                      <br />
                      Built RESTful APIs, CRUD operations, and microservices.
                    </li>
                    <li>
                      <span className="font-semibold">Infosys Spring Boot Certified Cloud Computing</span>
                      <br />
                      Deployed apps on AWS/PCF, Docker, and Kubernetes.
                    </li>
                    <li>
                      <span className="font-semibold">Infosys Spring Boot Certified Intro to AI</span>
                      <br />
                      Learned AI/ML basics and integration with Spring Boot.
                    </li>
                  </ul>
                </section>
              </div>
              <p className="mt-6 text-gray-400 text-sm">Last Updated: July 02, 2025</p>
              <a
                href="/pnehete2025.pdf"
                className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 transition-transform duration-300"
              >
                Download Resume
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}