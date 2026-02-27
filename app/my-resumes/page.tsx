"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MyResumes() {
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        window.location.href = "/login";
        return;
      }
      setUser(userData.user);
      const { data } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });
      setResumes(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const deleteResume = async (id: string) => {
    await supabase.from("resumes").delete().eq("id", id);
    setResumes(resumes.filter((r) => r.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">📁 My Saved Resumes</h1>
          <p className="text-gray-400 text-sm">All your AI generated resumes in one place</p>
        </div>
        <a href="/resume-builder" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
          + New Resume
        </a>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {loading ? (
          <p className="text-gray-400 text-center">Loading your resumes...</p>
        ) : resumes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg mb-4">You haven't saved any resumes yet!</p>
            <a href="/resume-builder" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg">
              Build Your First Resume →
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Resume List */}
            <div className="space-y-3">
              <h2 className="text-gray-400 text-sm font-semibold mb-4">YOUR RESUMES ({resumes.length})</h2>
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  onClick={() => setSelected(resume)}
                  className={`bg-gray-900 border rounded-xl p-4 cursor-pointer transition ${
                    selected?.id === resume.id ? "border-blue-500" : "border-gray-800 hover:border-gray-600"
                  }`}
                >
                  <p className="font-semibold text-sm truncate">{resume.name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Resume Content */}
            <div className="md:col-span-2">
              {selected ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-blue-400">{selected.name}</h2>
                    <button
                      onClick={() => deleteResume(selected.id)}
                      className="text-red-400 hover:text-red-300 text-sm border border-red-900 px-3 py-1 rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">{selected.content}</pre>
                </div>
              ) : (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex items-center justify-center h-64">
                  <p className="text-gray-500">← Click a resume to view it</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}