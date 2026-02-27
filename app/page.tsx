import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 text-gray-900">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button className="text-sm text-blue-600 font-semibold border border-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-50 transition">
              Sign In
            </button>
          </Link>
          <Link href="/resume-builder">
            <button className="text-sm text-white font-semibold bg-blue-600 px-4 py-1.5 rounded-full hover:bg-blue-700 transition">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b border-gray-200 py-16 px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Your AI-Powered Career Assistant
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Build resumes, practice interviews, and get expert feedback — all in one place, powered by AI.
        </p>
        <Link href="/resume-builder">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-full text-lg transition shadow-md">
            Start for Free →
          </button>
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 py-6 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">10K+</div>
            <div className="text-gray-500 text-sm">Resumes Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">4.9★</div>
            <div className="text-gray-500 text-sm">User Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">Free</div>
            <div className="text-gray-500 text-sm">Always Free to Use</div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Explore Features</h2>
        <p className="text-gray-500 mb-8">Everything you need to land your dream job</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Link href="/resume-builder">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-300 transition cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-blue-100 text-blue-600 text-2xl w-12 h-12 rounded-lg flex items-center justify-center">📄</div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition">Resume Builder</h3>
              </div>
              <p className="text-gray-500 text-sm">Fill in your details and AI will generate a professional resume instantly with multiple templates.</p>
              <div className="mt-4 text-blue-600 text-sm font-semibold">Build Resume →</div>
            </div>
          </Link>

          <Link href="/interview">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-green-300 transition cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-green-100 text-green-600 text-2xl w-12 h-12 rounded-lg flex items-center justify-center">🎤</div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-600 transition">Mock Interview</h3>
              </div>
              <p className="text-gray-500 text-sm">Practice real interview questions for your target role and get instant AI feedback on your answers.</p>
              <div className="mt-4 text-green-600 text-sm font-semibold">Start Interview →</div>
            </div>
          </Link>

          <Link href="/resume-reviewer">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-purple-300 transition cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-purple-100 text-purple-600 text-2xl w-12 h-12 rounded-lg flex items-center justify-center">🔍</div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-purple-600 transition">Resume Reviewer</h3>
              </div>
              <p className="text-gray-500 text-sm">Paste your existing resume and get detailed AI feedback with actionable tips to improve it.</p>
              <div className="mt-4 text-purple-600 text-sm font-semibold">Review Resume →</div>
            </div>
          </Link>

          <Link href="/interview-tips">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-yellow-300 transition cursor-pointer group">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-yellow-100 text-yellow-600 text-2xl w-12 h-12 rounded-lg flex items-center justify-center">💡</div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-yellow-600 transition">Interview Tips</h3>
              </div>
              <p className="text-gray-500 text-sm">Get role-specific interview tips, common questions, and preparation strategies curated by AI.</p>
              <div className="mt-4 text-yellow-600 text-sm font-semibold">Get Tips →</div>
            </div>
          </Link>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-6 px-6 text-center text-gray-400 text-sm">
        © 2025 Resume Coach AI · Built with ❤️ using Next.js & Groq
      </div>

    </main>
  );
}