import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">🎯 Resume Coach AI</h1>
          <p className="text-gray-500 text-sm">Your personal AI-powered career assistant</p>
        </div>
        <Link href="/login">
          <button className="text-sm text-gray-600 hover:text-black border border-gray-300 px-3 py-2 rounded-lg">
            Login / Sign Up
          </button>
        </Link>
      </div>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h2 className="text-5xl font-bold mb-4 text-gray-900">Land Your Dream Job</h2>
        <p className="text-gray-500 text-xl mb-8">Build resumes, practice interviews, and get expert AI feedback — all in one place.</p>
        <Link href="/resume-builder">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition">
            Get Started for Free →
          </button>
        </Link>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mt-12">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-blue-600">10K+</p>
            <p className="text-gray-500 text-sm">Resumes Generated</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-green-600">4.9★</p>
            <p className="text-gray-500 text-sm">User Rating</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-2xl font-bold text-yellow-600">Free</p>
            <p className="text-gray-500 text-sm">Always Free to Use</p>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900">Everything You Need</h2>
        <p className="text-gray-500 text-center mb-10">4 powerful tools to help you land the job</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-blue-400 transition shadow-sm">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Resume Builder</h3>
            <p className="text-gray-500 mb-4">Fill in your details and AI will generate a professional, ATS-friendly resume instantly with 5 languages.</p>
            <Link href="/resume-builder">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                Build Resume →
              </button>
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-green-400 transition shadow-sm">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Mock Interview</h3>
            <p className="text-gray-500 mb-4">Practice real interview questions for your target role and get instant AI feedback.</p>
            <Link href="/interview">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                Start Interview →
              </button>
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-purple-400 transition shadow-sm">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Resume Reviewer</h3>
            <p className="text-gray-500 mb-4">Paste your existing resume and get detailed AI feedback on how to improve it.</p>
            <Link href="/resume-reviewer">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                Review Resume →
              </button>
            </Link>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:border-yellow-400 transition shadow-sm">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-2 text-gray-900">Interview Tips</h3>
            <p className="text-gray-500 mb-4">Get role-specific interview tips, common questions, and preparation strategies.</p>
            <Link href="/interview-tips">
              <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm">
                Get Tips →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}