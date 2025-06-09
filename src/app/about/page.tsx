"use client";
import { motion } from "framer-motion";

const skills = [
  { name: "React/Next.js", level: 95 },
  { name: "TypeScript", level: 90 },
  { name: "Node.js", level: 85 },
  { name: "Java", level: 92 },
  { name: "Python", level: 80 },
  { name: "C++", level: 88 },
  { name: "AWS (S3, Athena, EC2)", level: 85 },
  { name: "Tailwind CSS", level: 92 },
  { name: "Three.js", level: 75 },
];

const experiences = [
  {
    title: "Electro-Active Technologies Intern",
    company: "Knoxville, TN",
    period: "May 2024 - Jan 2025",
    description: "Designed distributed data processing system in C++ reducing query response time by 40% while ensuring fault-tolerance. Built object-oriented solutions improving system reliability by 25% and reducing costs."
  },
  
  {
    title: "Security Systems Engineer",
    company: "Arizona State University, Gammage, Tempe, AZ",
    period: "Aug 2024 - May 2025",
    description: "Developed scalable security database with object-oriented design, optimizing staff allocation by 25%."
  },
  {
    title: "Software Development Engineer",
    company: "YYC Beeswax LTD, Alberta, Canada",
    period: "Aug 2024 - Mar 2025",
    description: "Implemented a fully functional E-commerce website for YYC-Beeswax fault-tolerant payment processing system reducing transaction failures by 35%."
  },

  {
    title: "Software Development Engineer Intern",
    company: "Yashodhan Hospital, Pune, India",
    period: "May 2023 - Aug 2023",
    description: "Implemented distributed database solution reducing query response time by 40% and maintaining 99.9% system availability using Java."
  },
  {
    title: "IT Support Engineering Intern",
    company: "Tech Mahindra, Pune, India",
    period: "May 2023 - Aug 2023",
    description: "Designed distributed monitoring system in Java, reducing troubleshooting time by 40% while maintaining 99.9% uptime."
  },
];

export default function About() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent mb-6">
              About Me
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              I'm Prathamesh Nehete, a passionate developer with over 5 years of experience in building modern, scalable web and distributed systems. I thrive on clean code, innovative solutions, and continuous learning.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">My Story</h2>
              <p className="text-gray-300 leading-relaxed">
                Currently pursuing a B.S. in Computer Science with a Business Minor at Arizona State University (GPA: 3.93, expected May 2025), I specialize in creating responsive applications and distributed systems using Java, C++, and AWS. My journey includes internships at Tech Mahindra, Yashodhan Hospital, and Electro-Active Technologies.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Outside of coding, I enjoy exploring new technologies, contributing to open-source, and spending time outdoors.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold text-white">Skills</h2>
              <div className="space-y-4">
                {skills.map((skill, index) => (
                  <div key={skill.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">{skill.name}</span>
                      <span className="text-gray-400">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl font-bold text-white text-center">Experience</h2>
            <div className="space-y-6">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 + index * 0.2 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white">{exp.title}</h3>
                    <span className="text-blue-400 font-medium">{exp.period}</span>
                  </div>
                  <h4 className="text-lg text-gray-300 mb-2">{exp.company}</h4>
                  <p className="text-gray-400">{exp.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}