"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { GraduationCap, BookOpen, Users, Award, ArrowRight, Star, CheckCircle } from "lucide-react"

const stats = [
  { value: "500+", label: "Scholarships Awarded" },
  { value: "₹2Cr+", label: "Total Funding" },
  { value: "95%", label: "Success Rate" },
  { value: "50+", label: "Partner Colleges" },
]

const features = [
  { icon: <BookOpen className="w-5 h-5" />, text: "Merit-based selection" },
  { icon: <CheckCircle className="w-5 h-5" />, text: "Quick 48hr decisions" },
  { icon: <Award className="w-5 h-5" />, text: "Up to ₹1L support" },
  { icon: <Users className="w-5 h-5" />, text: "Mentorship included" },
]

const floatingCards = [
  { name: "Priya Sharma", course: "B.Tech CSE", amount: "₹75,000", emoji: "🎓" },
  { name: "Rahul Verma", course: "MBBS", amount: "₹1,00,000", emoji: "👨‍⚕️" },
  { name: "Ananya Singh", course: "B.Com", amount: "₹50,000", emoji: "📊" },
]

export default function HeroSection() {
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard(prev => (prev + 1) % floatingCards.length)
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-[#f8f7ff] font-sans overflow-x-hidden">
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Fraunces', serif; }
        .gradient-text {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .card-shadow { box-shadow: 0 20px 60px -10px rgba(79, 70, 229, 0.15); }
        .nav-blur { backdrop-filter: blur(12px); background: rgba(248, 247, 255, 0.85); }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-8px) rotate(2deg); }
        }
        .float-1 { animation: float 4s ease-in-out infinite; }
        .float-2 { animation: float2 5s ease-in-out infinite 1s; }
        .float-3 { animation: float 3.5s ease-in-out infinite 0.5s; }
        .dot-grid {
          background-image: radial-gradient(circle, #c7d2fe 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .blob {
          border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
        }
      `}</style>

      {/* Navbar */}
      <nav className="nav-blur fixed top-0 left-0 right-0 z-50 border-b border-indigo-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg">ScholarNGO</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#about" className="hover:text-indigo-600 transition">About</a>
            <a href="#how" className="hover:text-indigo-600 transition">How It Works</a>
            <a href="#stories" className="hover:text-indigo-600 transition">Stories</a>
            <a href="#contact" className="hover:text-indigo-600 transition">Contact</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/status" className="text-sm text-gray-600 hover:text-indigo-600 transition hidden sm:block">
              Check Status
            </Link>
            <Link href="/apply" className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-sm">
              Apply Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="absolute top-20 right-0 w-[500px] h-[500px] blob bg-indigo-100 opacity-50 -z-0" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] blob bg-purple-100 opacity-40 -z-0" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-medium px-4 py-2 rounded-full mb-6"
              >
                <Star className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />
                Applications open for 2026–27
              </motion.div>

              <h1 className="font-display text-5xl md:text-6xl font-bold text-gray-900 leading-[1.1] mb-6">
                Empowering
                <span className="gradient-text italic"> bright minds</span>
                <br />through education
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-md">
                We believe financial barriers shouldn't stand between talented students and their dreams. Apply for a scholarship and take the first step toward your future.
              </p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-3 mb-10">
                {features.map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <span className="text-indigo-500">{f.icon}</span>
                    {f.text}
                  </motion.div>
                ))}
              </div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  href="/apply"
                  className="group flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                  Apply for Scholarship
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/status"
                  className="flex items-center gap-2 bg-white text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-50 transition border border-gray-200 shadow-sm"
                >
                  Check My Status
                </Link>
              </motion.div>
            </motion.div>

            {/* Right Side - Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden md:block"
            >
              {/* Main card */}
              <div className="relative bg-white rounded-3xl p-8 card-shadow float-1 mx-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center text-2xl">
                    🎓
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Latest Award</p>
                    <p className="font-display font-semibold text-gray-900 text-lg">
                      {floatingCards[activeCard].name}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Course</span>
                    <span className="font-medium text-gray-800">{floatingCards[activeCard].course}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Amount</span>
                    <span className="font-semibold text-indigo-600 text-base">{floatingCards[activeCard].amount}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Status</span>
                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">✓ Approved</span>
                  </div>
                </div>
              </div>

              {/* Floating badge 1 */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 card-shadow float-2 flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <p className="text-xs text-gray-400">Decision in</p>
                  <p className="font-bold text-gray-900 text-sm">48 hours</p>
                </div>
              </div>

              {/* Floating badge 2 */}
              <div className="absolute -bottom-4 -left-4 bg-indigo-600 text-white rounded-2xl px-4 py-3 float-3 flex items-center gap-2">
                <span className="text-xl">📚</span>
                <div>
                  <p className="text-xs text-indigo-200">This month</p>
                  <p className="font-bold text-sm">12 new awards</p>
                </div>
              </div>

              {/* Background decoration */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl transform rotate-3 mx-6" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-wider mb-3">Simple Process</p>
            <h2 className="font-display text-4xl font-bold text-gray-900">
              From application to <span className="gradient-text italic">approval</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Submit Application", desc: "Fill out our simple form with your details, financial information, and statement of purpose.", icon: "📝" },
              { step: "02", title: "Review Process", desc: "Our team reviews every application carefully. You'll hear back within 48 hours.", icon: "🔍" },
              { step: "03", title: "Receive Funding", desc: "Approved applicants receive funds directly. Start your education journey immediately.", icon: "🎉" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 hover:border-indigo-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="font-display text-5xl font-bold text-gray-100 group-hover:text-indigo-100 transition">{item.step}</span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-6 mx-6 mb-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Ready to start your journey?
            </h2>
            <p className="text-indigo-200 text-lg mb-8">
              Join hundreds of students who've already transformed their futures with our support.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/apply"
                className="bg-white text-indigo-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-indigo-50 transition shadow-lg"
              >
                Apply Now — It's Free
              </Link>
              <Link
                href="/status"
                className="border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition"
              >
                Check Application Status
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}