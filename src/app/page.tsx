"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaLinkedin, FaGithub, FaPhone, FaEnvelope, FaGlobe } from "react-icons/fa";

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

          {/* Action Buttons - Now properly aligned with 2 buttons */}
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link
                href="/projects"
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 inline-block"
              >
                View My Work
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
            >
              <button
                onClick={() => setIsResumeOpen(!isResumeOpen)}
                className="px-8 py-3 border border-white/20 rounded-full text-white font-medium hover:bg-white/10 hover:border-white/30 transition-all duration-300"
              >
                {isResumeOpen ? "Close Resume" : "View Resume"}
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
              <div className="space-y-8 text-left text-gray-300 text-sm md:text-base">
                {/* Contact */}
                <section>
                  <div className="flex flex-wrap gap-3">
                    <a href="tel:+14808730791" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition">
                      <FaPhone /> <span className="text-white">480-873-0791</span>
                    </a>
                    <a href="mailto:prathameshnehete2026@u.northwestern.edu" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition">
                      <FaEnvelope /> <span className="text-white">prathameshnehete2026@u.northwestern.edu</span>
                    </a>
                    <a href="https://linkedin.com/in/nehete23" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition">
                      <FaLinkedin /> <span className="text-white">linkedin.com/in/nehete23</span>
                    </a>
                    <a href="https://github.com/pnehete23" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition">
                      <FaGithub /> <span className="text-white">github.com/pnehete23</span>
                    </a>
                    <Link href="/projects" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/20 transition">
                      <FaGlobe /> <span className="text-white">Portfolio</span>
                    </Link>
                  </div>
                </section>

                {/* Objective */}
                <section>
                  <div className="rounded-lg border border-blue-400/30 bg-blue-500/10 text-blue-200 px-4 py-3">
                    Seeking full-time/intern opportunities starting September 2025
                  </div>
                </section>

                {/* Education */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Education</h3>
                  <div className="space-y-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="font-semibold">Northwestern University</div>
                        <div className="text-gray-300">M.S. in Data Science</div>
                      </div>
                      <div className="text-gray-400 text-sm whitespace-nowrap">September 2025 – November 2026</div>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <div className="font-semibold">Arizona State University</div>
                        <div className="text-gray-300">B.S. in Computer Science; Business Minor</div>
                      </div>
                      <div className="text-gray-400 text-sm whitespace-nowrap">August 2021 – May 2025</div>
                    </div>
                  </div>
                </section>

                {/* Work Experience */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Work Experience</h3>
                  <div className="space-y-5">
                    <div>
                      <div className="font-semibold text-blue-300">Electroactive Technologies</div>
                      <div className="flex items-baseline justify-between gap-4 flex-wrap text-gray-400">
                        <div>
                          <span className="italic text-gray-300">Software Development Engineering Intern</span>
                          <span className="text-gray-400"> • Remote/Knoxville, TN</span>
                        </div>
                        <div className="text-sm whitespace-nowrap">May 2024 – Jan 2025</div>
                      </div>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Engineered distributed data processing pipeline in C++ with multithreading, reducing latency by 40%.</li>
                        <li>Built fault-tolerant microservices handling 2M daily requests; collaborated with a 5-person cross-functional team.</li>
                        <li>Implemented Redis caching and load balancing, improving API response from 800ms to 200ms.</li>
                        <li>Applied ML algorithms for predictive auto-scaling in AWS, cutting costs by 25%.</li>
                        <li>Skills: C++, Distributed Systems, OOD, Redis, ML Algorithms</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-300">YYC Beeswax LTD (ASU Capstone)</div>
                      <div className="flex items-baseline justify-between gap-4 flex-wrap text-gray-400">
                        <div>
                          <span className="italic text-gray-300">Software Development Engineer Intern</span>
                          <span className="text-gray-400"> • Alberta, Canada</span>
                        </div>
                        <div className="text-sm whitespace-nowrap">Aug 2024 – Mar 2025</div>
                      </div>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Built WordPress plugin with React + TypeScript, processing 3000+ transactions monthly.</li>
                        <li>Developed Node.js REST APIs with JWT; integrated Stripe with MySQL securely.</li>
                        <li>Reduced checkout abandonment by 35% through performance and UX improvements.</li>
                        <li>Implemented recommendation engine (collaborative filtering, matrix factorization) increasing sales by 20%.</li>
                        <li>Skills: React, Node.js, REST APIs, MySQL, Recommendation Systems</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-blue-300">Tech Mahindra</div>
                      <div className="flex items-baseline justify-between gap-4 flex-wrap text-gray-400">
                        <div>
                          <span className="italic text-gray-300">IT Support Engineering Lead</span>
                          <span className="text-gray-400"> • Pune, India</span>
                        </div>
                        <div className="text-sm whitespace-nowrap">May 2023 – Aug 2023</div>
                      </div>
                      <ul className="list-disc ml-5 text-gray-400 mt-2 space-y-1">
                        <li>Designed Java-based monitoring with Kafka, tracking 500+ servers with 99.9% uptime.</li>
                        <li>Optimized SQL with indexing, reducing DB load by 40% across production systems.</li>
                        <li>Led 8 engineers implementing PagerDuty alerts, preventing 200+ critical incidents monthly.</li>
                        <li>Built anomaly detection with Python (scikit-learn, pandas) identifying issues 3x faster.</li>
                        <li>Skills: Java, SQL, Python, ML, System Monitoring</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Projects */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Project Experience</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      {
                        title: "ResumeCraft: AI-Powered Resume Builder",
                        stack: "Next.js, React, TypeScript, JavaScript, Python, Tailwind CSS",
                        bullets: [
                          "AI-powered builder with GPT integration; LaTeX generation optimized for ATS.",
                          "Performant UI with webpack tuning and Framer Motion animations.",
                          "Distributed storage handling 10K+ daily requests with failover.",
                          "NLP models (NLTK, spaCy) for keyword extraction and semantic matching.",
                        ],
                      },
                      {
                        title: "AI Data-Science Mentor with Voice Enabled",
                        stack: "OpenAI GPT, Claude AI, JavaScript, TypeScript, React",
                        bullets: [
                          "Conversational mentor with voice recognition and GPT integration.",
                          "Designed for growth with agile, iterative development.",
                          "Advanced query handling algorithms for ambiguous problems.",
                          "Trained BERT sentiment model achieving 92% accuracy.",
                        ],
                      },
                      {
                        title: "Medicure AI Doctor",
                        stack: "Google Gemini, Pinecone, Hugging Face, Python, JavaScript, React",
                        bullets: [
                          "RAG architecture for real-time queries with HIPAA focus.",
                          "Sub-200ms responses with 98% accuracy using efficient data structures.",
                          "Tableau dashboards with linear programming optimization for patient flow.",
                          "TensorFlow/Keras classification with 95% precision/recall.",
                        ],
                      },
                    ].map((p, idx) => (
                      <motion.div
                        key={p.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: idx * 0.1 }}
                        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-white/20 hover:shadow-md transition-all duration-300"
                      >
                        <h4 className="font-semibold text-blue-300">{p.title}</h4>
                        <p className="text-gray-400 text-xs mt-1">{p.stack}</p>
                        <ul className="list-disc ml-5 text-gray-400 text-sm mt-2 space-y-1">
                          {p.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Skills</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <div className="font-semibold text-white mb-1">Languages</div>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>R, Python, C++, C#, JavaScript, GoLang, React.js</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">Core CS</div>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>System Design, OOP, APIs/REST APIs, Multi-tiered Systems, Data Structures</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-1">AI/ML & Data</div>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>Machine Learning, NLP, TensorFlow, scikit-learn, SQL, Data Modeling, Tableau</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Certifications */}
                <section>
                  <h3 className="text-lg font-semibold text-white mb-2">Certifications</h3>
                  <ul className="list-disc ml-5 text-gray-300 text-sm space-y-2">
                    <li>Infosys Springboard: Software Engineering</li>
                    <li>Infosys Springboard: Cloud Computing (AWS, Docker, Kubernetes)</li>
                    <li>Infosys Springboard: Intro to AI</li>
                  </ul>
                </section>
              </div>
              <p className="mt-6 text-gray-400 text-sm">Last Updated: August 10, 2025</p>
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