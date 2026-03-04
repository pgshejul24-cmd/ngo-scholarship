"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">

        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Empowering Students Through 
            <span className="text-indigo-600"> Scholarships</span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg">
            Our NGO provides financial assistance to talented students
            so they can pursue higher education without financial barriers.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              href="/apply"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Apply for Scholarship
            </Link>

            <Link
              href="#about"
              className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Right Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <img
            src="/images/scholarship-hero.svg"
            alt="Scholarship"
            className="w-full"
          />
        </motion.div>

      </div>
    </section>
  )
}