"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope,
  FaPhone,
  FaCopy,
  FaCheck,
  FaPaperPlane,
} from "react-icons/fa";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [copied, setCopied] = useState<{ email: boolean; phone: boolean }>({
    email: false,
    phone: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus({ type: "success", message: data.message || "Message sent successfully." });
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus({ type: "error", message: data.error || "Submission failed. Please try again." });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus({ type: "error", message: "An unexpected error occurred. Please try again later." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, key: "email" | "phone") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 1500);
    } catch {
      // no-op
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-6">
              Get In Touch
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Let’s work together to bring your ideas to life. I typically respond within 24 hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-white mb-6">Let's Connect</h2>
                <p className="text-gray-300 leading-relaxed">
                  I’m open to roles and collaborations in SWE, Data, and AI/ML. Reach out directly using the options below or the form.
                </p>
                <div className="mt-4 rounded-md border border-blue-400/30 bg-blue-500/10 text-blue-200 px-4 py-3">
                  Seeking intern/full-time opportunities in SWE, Data, and AI/ML.
                </div>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FaEnvelope className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Email</h3>
                      <a href="mailto:prathameshnehete2026@u.northwestern.edu" className="text-gray-300 hover:text-white transition-colors">
                        prathameshnehete2026@u.northwestern.edu
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Copy email"
                    onClick={() => copyToClipboard("prathameshnehete2026@u.northwestern.edu", "email")}
                    className="shrink-0 px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-colors"
                  >
                    {copied.email ? <FaCheck className="text-green-400" /> : <FaCopy />}
                  </button>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <FaLinkedin className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">LinkedIn</h3>
                      <a href="https://linkedin.com/in/nehete23" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                        linkedin.com/in/nehete23
                      </a>
                    </div>
                  </div>
                </div>

                {/* GitHub */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-500/20 rounded-lg flex items-center justify-center">
                      <FaGithub className="text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">GitHub</h3>
                      <a href="https://github.com/pnehete23" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">
                        github.com/pnehete23
                      </a>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FaPhone className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Phone</h3>
                      <a href="tel:+14808730791" className="text-gray-300 hover:text-white transition-colors">
                        (480) 873-0791
                      </a>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Copy phone"
                    onClick={() => copyToClipboard("+14808730791", "phone")}
                    className="shrink-0 px-3 py-2 rounded-md bg-white/5 border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition-colors"
                  >
                    {copied.phone ? <FaCheck className="text-green-400" /> : <FaCopy />}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:scale-[1.02] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <FaPaperPlane className="animate-pulse" /> Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Message
                    </>
                  )}
                </button>

                {status.type && (
                  <div
                    role="status"
                    className={`mt-2 rounded-md px-4 py-3 border ${
                      status.type === "success"
                        ? "border-green-400/40 bg-green-500/10 text-green-200"
                        : "border-red-400/40 bg-red-500/10 text-red-200"
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}