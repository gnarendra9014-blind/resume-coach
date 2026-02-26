import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <h1 className="text-2xl font-bold text-blue-400">🎯 Resume Coach AI</h1>
        <p className="text-gray-400 text-sm">Your personal AI-powered career assistant</p>
      </div>

      {/* Feature Cards */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center mb-2">What do you want to do?</h2>
        <p className="text-gray-400 text-center mb-10">Choose a feature to get started</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-blue-500 transition">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-2">Resume Builder</h3>
            <p className="text-gray-400">Fill in your details and AI will generate a professional resume for you instantly.</p>
            <Link href="/resume-builder">
              <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                Build Resume →
              </button>
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-green-500 transition">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold mb-2">Mock Interview</h3>
            <p className="text-gray-400">Practice real interview questions for your target role and get AI feedback on your answers.</p>
            <Link href="/interview">
              <button className="mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm">
                Start Interview →
              </button>
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-purple-500 transition">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Resume Reviewer</h3>
            <p className="text-gray-400">Paste your existing resume and get detailed AI feedback on how to improve it.</p>
            <Link href="/resume-reviewer">
              <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                Review Resume →
              </button>
            </Link>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-yellow-500 transition">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold mb-2">Interview Tips</h3>
            <p className="text-gray-400">Get role-specific interview tips, common questions, and preparation strategies.</p>
            <Link href="/interview-tips">
              <button className="mt-4 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm">
                Get Tips →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
