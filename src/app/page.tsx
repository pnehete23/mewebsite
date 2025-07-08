"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Home() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const dropdownVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  const handleResumeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResumeOpen(!isResumeOpen);
  };

  const handleResumeClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResumeOpen(false);
  };

  // Inline LinkedIn and GitHub SVG icons
  const LinkedInIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );

  const GitHubIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8" style={{
      background: 'linear-gradient(45deg, #111827, #1f2937, #111827)',
      backgroundSize: '400% 400%',
      animation: 'gradientAnimation 20s ease infinite'
    }}>
      <style jsx>{`
        @keyframes gradientAnimation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      <div className="w-full max-w-5xl mx-auto text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Name */}
          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-tight"
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
            className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 mx-auto mt-4 rounded-full overflow-hidden shadow-lg border border-white/20"
          >
            <img
              src="/image01.jpeg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity duration-300">
              <p className="text-white text-xs sm:text-sm font-medium">Profile Photo</p>
            </div>
          </motion.div>

          {/* Tagline */}
          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Full-Stack Developer & Creative Problem Solver
          </motion.p>

          {/* Description */}
          <motion.p
            className="text-gray-400 max-w-lg mx-auto text-sm sm:text-base px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Crafting seamless digital experiences with modern technologies
          </motion.p>

          {/* Action Buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 px-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-full sm:w-auto"
            >
              <button
                onClick={() => {
                  // In your actual Next.js app, replace this with router.push('/projects')
                  window.location.href = '/projects';
                }}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 hover:shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center h-12 text-sm sm:text-base touch-manipulation cursor-pointer select-none"
              >
                View My Work
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="w-full sm:w-auto"
            >
              <button
                onClick={handleResumeToggle}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white font-medium hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 h-12 flex items-center justify-center group text-sm sm:text-base touch-manipulation cursor-pointer select-none relative"
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
              className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gray-800/80 backdrop-blur-sm border border-white/10 rounded-xl shadow-lg max-h-[70vh] overflow-y-auto"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-white">Resume</h2>
                <button
                  onClick={handleResumeClose}
                  className="text-gray-400 hover:text-white text-2xl p-1 cursor-pointer select-none"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4 sm:space-y-6 text-left text-gray-300 text-sm sm:text-base">
                {/* Education */}
                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Education</h3>
                  <div>
                    <span className="font-semibold">Arizona State University</span>
                    <br />
                    B.S. in Computer Science, Business Minor
                    <br />
                    <span className="text-gray-400 text-xs sm:text-sm">Aug 2021 - May 2025</span>
                  </div>
                  <div className="text-gray-400 text-xs sm:text-sm mt-1">
                    Actively seeking Internship and Full-Time opportunities.
                  </div>
                </section>

                {/* Experience */}
                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Experience</h3>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold text-blue-300">Electroactive Technologies</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> (Remote, Knoxville, TN)</span>
                      <br />
                      <span className="italic text-gray-300 text-sm">Software Development Engineering Intern</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> | May 2024 – Jan 2025</span>
                      <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
                        <li>Designed a distributed data processing system in C++, reducing query response time by 40%.</li>
                        <li>Collaborated with teams to build reliable object-oriented solutions, improving system reliability by 25%.</li>
                        <li>Enhanced reporting by solving data integrity challenges, increasing capabilities by 30%.</li>
                        <li>Developed automated testing pipelines to ensure code quality.</li>
                        <li>Integrated monitoring tools to resolve system bottlenecks proactively.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">YYC Beeswax LTD (ASU Capstone)</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> (Alberta, Canada)</span>
                      <br />
                      <span className="italic text-gray-300 text-sm">Software Development Engineer Intern</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> | Aug 2024 – Mar 2025</span>
                      <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
                        <li>Reduced transaction failures by 35% while supporting 3x more users.</li>
                        <li>Developed a caching architecture in C#, improving query response times by 45%.</li>
                        <li>Created scalable system architecture, enhancing cloud scalability by 40%.</li>
                        <li>Implemented CI/CD pipelines to streamline deployment.</li>
                        <li>Delivered user-centric features with stakeholder collaboration.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Arizona State University, Gammage</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> (Tempe, AZ)</span>
                      <br />
                      <span className="italic text-gray-300 text-sm">Security Systems Engineer</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> | Aug 2023 – Mar 2025</span>
                      <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
                        <li>Designed a monitoring system using Java and C++, improving response time by 35%.</li>
                        <li>Developed a scalable security database, optimizing staff allocation by 25%.</li>
                        <li>Built fault-tolerant algorithms, reducing breaches by 40%.</li>
                        <li>Optimized operations with data-driven analysis.</li>
                        <li>Integrated real-time alerting for threat detection.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Yashodhan Hospital</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> (Pune, India)</span>
                      <br />
                      <span className="italic text-gray-300 text-sm">Software Development Engineer Intern</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> | May 2023 – Aug 2023</span>
                      <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
                        <li>Implemented a database solution, reducing query response time by 40%.</li>
                        <li>Built scalable web apps, increasing scheduling efficiency by 20%.</li>
                        <li>Optimized architecture, improving user satisfaction by 35%.</li>
                        <li>Automated patient record management to reduce errors.</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-300">Tech Mahindra</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> (Pune, India)</span>
                      <br />
                      <span className="italic text-gray-300 text-sm">IT Support Engineering Lead</span>
                      <span className="text-gray-400 text-xs sm:text-sm"> | May 2023 – Aug 2023</span>
                      <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
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
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Projects</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 sm:p-4 hover:border-white/20 hover:shadow-md transition-all duration-300"
                      >
                        <h4 className="font-semibold text-blue-300 text-sm sm:text-base">{project.title}</h4>
                        <p className="text-gray-400 text-xs sm:text-sm mt-1">{project.description}</p>
                        <ul className="list-disc ml-4 sm:ml-5 text-gray-400 text-xs sm:text-sm mt-2 space-y-1">
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
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Skills</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 text-xs sm:text-sm">
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
                      <li key={index} className="list-disc ml-4 sm:ml-5">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Certifications */}
                <section>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Certifications</h3>
                  <ul className="list-disc ml-4 sm:ml-5 text-gray-300 text-xs sm:text-sm space-y-2">
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
              <p className="mt-4 sm:mt-6 text-gray-400 text-xs sm:text-sm">Last Updated: July 02, 2025</p>
              <button
                onClick={() => {
                  // Create a link element and trigger download
                  const link = document.createElement('a');
                  link.href = '/pnehete2025.pdf';
                  link.download = 'pnehete2025.pdf';
                  link.click();
                }}
                className="inline-block mt-4 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 active:scale-95 transition-transform duration-300 text-sm sm:text-base w-full sm:w-auto text-center touch-manipulation"
              >
                Download Resume
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Social Media Icons - Outside the main canvas */}
      <motion.div
        className="flex justify-center gap-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1.6 }}
      >
        <button
          onClick={() => {
            window.open('https://www.linkedin.com/in/nehete23/', '_blank');
          }}
          className="transform hover:scale-125 active:scale-110 transition-transform duration-300 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 touch-manipulation cursor-pointer select-none"
        >
          <LinkedInIcon />
        </button>
        <button
          onClick={() => {
            window.open('https://github.com/pnehete23', '_blank');
          }}
          className="transform hover:scale-125 active:scale-110 transition-transform duration-300 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/40 touch-manipulation cursor-pointer select-none"
        >
          <GitHubIcon />
        </button>
      </motion.div>
    </div>
  );
}