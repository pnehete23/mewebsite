"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const projects = [
   {
    id: 1,
    title: "Medicure,Ai HOME Doctor",
    description: "An intelligent medical assistant powered by RAG (Retrieval-Augmented Generation) technology, combining Google's Gemini 2.0 Flash with Pinecone vector search to provide accurate medical information.",
    image: "/image0.png", // Ensure this file exists in the public folder
    technologies: ["Streamlit", "Google Gemini 2.0 Flash", "Vector Database: Pinecone", "Embeddings: HuggingFace Sentence Transformers", "Framework: LangChain", "Language: Python 3.10+"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/pnehete23/medicure-Medical-AI-Chatbot",
    featured: true
  },

  {
    id: 2,
    title: "Ai-Helper data science Assistant with text to voice",
    description: "The Data Science Mentor AI Assistant is a comprehensive learning companion designed to bridge the gap between theoretical knowledge and practical application in data science. Whether you're debugging pandas operations, understanding machine learning algorithms, or exploring statistical concepts, this AI mentor provides interactive, personalized guidance with real-time code execution and voice explanations.",
    image: "/imageb.png",
    technologies: ["python", "Gradio 4.0+", "AI Models: OpenAI GPT-Series", "Anthropic Claude series", "Data Science Libraries:pandas, numpy, matplotlib, seaborn, scikit-learn", "Voice Synthesis:OpenAI TTS API"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/pnehete23/Aihelper",
    featured: true
  },

  {
    id: 3,
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution with React, Node.js, and Stripe integration.",
    image: "/image1.png", // Ensure this file exists in the public folder
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "https://example.com",
    githubUrl: "https://staging2.abelocollection.com/",
    featured: true
  },
  {
    id: 4,
    title: "Wellness-Center Locator",
    description: "The Wellness Center Locator is a web-based application designed to help users find nearby wellness centers based on their health and fitness needs. ",
    image: "/image2.jpeg",
    technologies: ["html" , "css", "flask", "python"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/pnehete23/Wellness-Center",
    featured: false
  },
  {
    id: 5,
    title: "Portfolio Website",
    description: "A responsive portfolio website with 3D animations and smooth interactions.",
    image: "/image3.png",
    technologies: ["Next.js", "Three.js", "Framer Motion", "Tailwind"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/pnehete23/mewebsite",
    featured: false
  },
  {
    id: 6,
    title: "Tiny-URL",
    description: "Conviniently shorteSns the long annoying URLs!.",
    image: "/image5.jpeg",
    technologies: ["python", "html"],
    liveUrl: "https://example.com",
    githubUrl: "https://github.com/pnehete23/Tiny-URL-main",
    featured: false
  },
];

export default function Projects() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              My Projects
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Here are some of my recent projects that showcase my skills and passion for development.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`group cursor-pointer ${
                  project.featured ? 'md:col-span-2' : ''
                }`}
              >
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all duration-300 hover:scale-[1.02]">
                  <div className="relative h-64 md:h-80 overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      layout="fill" // Use layout="fill" to cover the container
                      objectFit="cover" // Ensure the image covers the area
                      className="absolute inset-0"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="flex gap-4">
                        <Link
                          href={project.liveUrl}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Live Demo
                        </Link> 
                        <Link
                          href={project.githubUrl}
                          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                          GitHub
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-gray-300">{project.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}