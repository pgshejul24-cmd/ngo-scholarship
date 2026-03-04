// import Link from 'next/link';
// import HeroSection from "@/components/HeroSection"

// export default function HomePage() {
//   return (
//     <main>

//       {/* Hero Section */}
//       <HeroSection />

//       {/* Existing Section */}
//       <section className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3c5e] to-[#0d2d45] flex items-center justify-center px-4">
//         <div className="text-center max-w-2xl mx-auto">
//           <div className="text-6xl mb-6">🎓</div>

//           <h1
//             className="text-5xl font-bold text-white mb-4"
//             style={{ fontFamily: "Crimson Pro, serif" }}
//           >
//             NGO Scholarship Fund
//           </h1>

//           <p className="text-xl text-slate-300 mb-10 leading-relaxed">
//             Empowering students through financial support. Apply today and take the first step toward your future.
//           </p>

//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Link
//               href="/apply"
//               className="px-8 py-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-semibold rounded-xl text-lg transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
//             >
//               Apply for Scholarship
//             </Link>

//             <Link
//               href="/status"
//               className="px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-xl text-lg transition-all"
//             >
//               Check Application Status
//             </Link>
//           </div>
//         </div>
//       </section>

//     </main>
//   );
// }

import HeroSection from '@/components/HeroSection';

export default function HomePage() {
  return <HeroSection />;
}