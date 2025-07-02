"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

export default function Home() {
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const dropdownVariants = {
    closed: { opacity: 0, y: -20 },
    open: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        <motion.h1
        className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        >
        Prathamesh Nehete
        </motion.h1>

        {/* Photo Placeholder */}
        <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative w-32 h-32 mx-auto mt-4 rounded-full overflow-hidden shadow-lg"
        >
        <img
          src="image01.jpeg"
          alt="Profile"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
          <p className="text-white text-sm">Profile Photo</p>
        </div>
        </motion.div>

        <motion.p
        className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        >
        Full-Stack Developer & Creative Problem Solver
        </motion.p>

        <motion.p
        className="text-gray-400 max-w-xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        >
        Crafting digital experiences with modern technologies and innovative design
        </motion.p>

        <motion.div
        className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        >
        <Link
          href="/projects"
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold hover:scale-105 transition-transform"
        >
          View My Work
        </Link>
        <Link
          href="/contact"
          className="px-8 py-3 border border-white/20 rounded-full text-white font-semibold hover:bg-white/10 transition-colors"
        >
          Get In Touch
        </Link>
        <button
          onClick={() => setIsResumeOpen(!isResumeOpen)}
          className="px-8 py-3 border border-white/20 rounded-full text-white font-semibold hover:bg-white/10 transition-colors"
        >
          {isResumeOpen ? "Close Resume" : "View Resume"}
        </button>
        </motion.div>

        {/* Social Media Icons */}
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
        className="flex justify-center gap-4 mt-8"
        >
        <a
          href="https://www.linkedin.com/in/nehete23/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaLinkedin className="text-3xl text-gray-400 hover:text-white transition-colors" />
        </a>
        <a
          href="https://github.com/pnehete23"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaGithub className="text-3xl text-gray-400 hover:text-white transition-colors" />
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
          className="mt-8 p-6 bg-gray-800 rounded-lg w-full sm:w-3/4 mx-auto shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Resume</h2>
          <button
            onClick={() => setIsResumeOpen(false)}
            className="text-gray-400 hover:text-white text-2xl"
          >
            &times;
          </button>
          </div>
          <div className="space-y-8 text-left">
          {/* Education */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-1">Education</h3>
            <div className="text-gray-300">
            <span className="font-semibold">Arizona State University</span><br />
            B.S. in Computer Science, Business Minor<br />
            <span className="text-gray-400 text-sm">Aug 2021 - May 2025</span>
            </div>
            <div className="text-gray-400 text-sm mt-1">
            Actively seeking Internship and Full-Time opportunities.
            </div>
          </section>

          {/* Experience */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-1">Experience</h3>
            <div className="space-y-4">
            <div>
              <span className="font-semibold text-blue-300">Electroactive Technologies</span>
              <span className="text-gray-400"> (Remote, Knoxville, TN)</span><br />
              <span className="italic text-gray-300">Software Development Engineering Intern</span>
              <span className="text-gray-400"> | May 2024 – Jan 2025</span>
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Designed a distributed data processing system in C++, reducing query response time by 40% and ensuring fault-tolerance.</li>
              <li>Collaborated with cross-functional teams to build object-oriented solutions, improving system reliability by 25% and reducing operational costs.</li>
              <li>Enhanced customer-focused reporting by solving data integrity challenges through agile prototyping, increasing reporting capabilities by 30%.</li>
              <li>Developed automated testing pipelines to ensure code quality and reduce deployment time.</li>
              <li>Integrated monitoring tools to proactively detect and resolve system bottlenecks.</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-blue-300">YYC Beeswax LTD (ASU Capstone)</span>
              <span className="text-gray-400"> (Alberta, Canada)</span><br />
              <span className="italic text-gray-300">Software Development Engineer Intern</span>
              <span className="text-gray-400"> | Aug 2024 – Mar 2025</span>
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Reduced transaction failures by 35% while supporting 3x more concurrent users.</li>
              <li>Developed a distributed caching architecture in C#, improving query response times by 45%.</li>
              <li>Created scalable multi-tiered system architecture, enhancing cloud scalability by 40%.</li>
              <li>Implemented CI/CD pipelines to streamline deployment and minimize downtime.</li>
              <li>Worked closely with stakeholders to gather requirements and deliver user-centric features.</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-blue-300">Arizona State University, Gammage</span>
              <span className="text-gray-400"> (Tempe, AZ)</span><br />
              <span className="italic text-gray-300">Security Systems Engineer</span>
              <span className="text-gray-400"> | Aug 2023 – Mar 2025</span>
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Designed and implemented a distributed monitoring system using Java and C++, improving incident response time by 35%.</li>
              <li>Developed a scalable security database with OOP, optimizing staff allocation by 25%.</li>
              <li>Built fault-tolerant security algorithms, reducing venue breaches by 40%.</li>
              <li>Optimized security operations using data-driven analysis and linear programming.</li>
              <li>Trained staff on new security protocols and system usage, increasing operational efficiency.</li>
              <li>Integrated real-time alerting systems for proactive threat detection.</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-blue-300">Yashodhan Hospital</span>
              <span className="text-gray-400"> (Pune, India)</span><br />
              <span className="italic text-gray-300">Software Development Engineer Intern</span>
              <span className="text-gray-400"> | May 2023 – Aug 2023</span>
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Implemented a distributed database solution, reducing query response time by 40% while maintaining 99.9% availability.</li>
              <li>Built scalable web apps in Agile teams, increasing scheduling efficiency by 20%.</li>
              <li>Optimized multi-tiered architecture, improving user satisfaction by 35%.</li>
              <li>Automated patient record management, reducing manual errors and saving staff time.</li>
              <li>Collaborated with medical staff to design user-friendly interfaces for hospital systems.</li>
              </ul>
            </div>
            <div>
              <span className="font-semibold text-blue-300">Tech Mahindra</span>
              <span className="text-gray-400"> (Pune, India)</span><br />
              <span className="italic text-gray-300">IT Support Engineering Lead</span>
              <span className="text-gray-400"> | May 2023 – Aug 2023</span>
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Designed and implemented a distributed monitoring system using Java, reducing troubleshooting time by 40% while maintaining 99.9% uptime.</li>
              <li>Optimized database queries and cloud resources, improving scalability and response time by 40%.</li>
              <li>Led a team of 5 engineers to deliver critical IT support for enterprise clients.</li>
              <li>Documented best practices and provided training to junior engineers.</li>
              </ul>
            </div>
            </div>
          </section>

          {/* Projects */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-1">Projects</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-3">
            <li>
              <span className="font-semibold text-blue-300">OpenTitan (Open Source Secure Silicon)</span><br />
              Simulated and verified UART smoke test using Verilator/Bazel; analyzed waveform output and explored custom CPU integration for CVA6 (RISC-V).
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Contributed to the open-source hardware security community, collaborating with lowRISC and Google engineers to ensure robust, secure silicon design and verification workflows.</li>
              <li>Developed custom testbenches to automate regression testing and improve verification coverage.</li>
              <li>Documented verification results and presented findings to the project team for continuous improvement.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-blue-300">AI Data-Science Mentor with Voice</span><br />
              Built an AI mentor using OpenAI GPT, Claude AI, and real-time TTS for accessible, conversational learning.
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Integrated voice interaction and adaptive feedback, making data science education more engaging and personalized for students worldwide.</li>
              <li>Implemented analytics to track student progress and tailor learning paths dynamically.</li>
              <li>Deployed the solution as a web app with secure authentication and scalable backend.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-blue-300">Medi Cure AI Doctor</span><br />
              Developed a medical assistant using Gemini 2.0 Flash, Pinecone vector search, and Hugging Face embeddings for real-time health insights.
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Enabled instant symptom analysis and health recommendations, leveraging advanced AI for improved patient support and triage.</li>
              <li>Integrated with EHR systems to provide personalized medical advice based on patient history.</li>
              <li>Ensured HIPAA compliance and data privacy throughout the application.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-blue-300">Tiny URLs</span><br />
              Designed a distributed URL shortener with Flask, achieving 99.9% uptime and scaling to 50,000+ users.
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Implemented analytics dashboard and robust API, supporting high-traffic environments and real-time link tracking.</li>
              <li>Utilized Redis for caching and optimized database schema for fast lookups.</li>
              <li>Added user authentication and custom URL features for enhanced usability.</li>
              </ul>
            </li>
            <li>
              <span className="font-semibold text-blue-300">Wellness Center Locator</span><br />
              Built a scalable locator using Java/C++, reducing search time by 40% and delivering personalized recommendations within 200ms.
              <ul className="list-disc ml-6 text-gray-400 mt-1 space-y-1">
              <li>Integrated geospatial algorithms and user profiling to enhance accuracy and user experience for wellness seekers.</li>
              <li>Developed RESTful APIs for seamless integration with mobile and web clients.</li>
              <li>Implemented real-time location tracking and filtering for nearby centers.</li>
              </ul>
            </li>
            </ul>
          </section>

          {/* Skills */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-1">Skills</h3>
            <ul className="list-disc list-inside text-gray-300 columns-2 gap-x-8">
            <li>HTML, Tailwind CSS, Framer Motion</li>
            <li>Java, Python, C#, C++, Rust</li>
            <li>Typescript, JavaScript, Node.js</li>
            <li>SQL, NoSQL, Distributed storage</li>
            <li>Data Structures & Algorithms</li>
            <li>Power-BI</li>
            <li>Pinecone, Hugging Face Embeddings</li>
            <li>GPT/Claude APIs</li>
            <li>Distributed systems</li>
            <li>Advanced GIT skills</li>
            <li>Streamlit, API development</li>
            <li>Object-oriented design</li>
            <li>Embedding Programming</li>
            <li>System Verilog</li>
            </ul>
          </section>

          {/* Certifications */}
          <section>
            <h3 className="text-xl font-semibold text-white mb-1">Certifications</h3>
            <ul className="list-disc list-inside text-gray-300">
            <li>
              <span className="font-semibold">Infosys Spring Boot Certified Software Engineering</span><br />
              Built RESTful APIs, CRUD operations, and microservices using layered architecture. Learned dependency injection, auto-configuration, and application context management.
            </li>
            <li>
              <span className="font-semibold">Infosys Spring Boot Certified Cloud Computing</span><br />
              Deployed Spring Boot apps on cloud (AWS/PCF), containerization (Docker), CI/CD, and Kubernetes. Applied cloud-native principles: scalability, fault tolerance, stateless design.
            </li>
            <li>
              <span className="font-semibold">Infosys Spring Boot Certified Intro to AI</span><br />
              Learned AI/ML basics, model training, and integrating AI features into Spring Boot apps using APIs and external libraries.
            </li>
            </ul>
          </section>
          </div>
          <p className="mt-6 text-gray-400 text-sm">Last Updated On: July 02, 2025</p>
          <a
          href="/resume.pdf"
          className="inline-block mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold hover:scale-105 transition-transform"
          >
          </a>
        </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}