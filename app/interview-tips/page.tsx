"use client";
import { useState } from "react";

const ROLES = [
  "Software Engineer", "Frontend Developer", "Backend Developer",
  "Full Stack Developer", "Data Analyst", "Data Scientist",
  "ML Engineer", "DevOps Engineer", "HR", "Product Manager",
];

const COMPANIES = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple",
  "Flipkart", "Swiggy", "Zomato", "Infosys", "TCS",
  "Wipro", "Accenture", "Startup", "Other",
];

const TOPIC_ICONS: Record<string, string> = {
  "DSA": "🧮", "OOP": "📦", "System Design": "🏗️",
  "Database": "🗄️", "OS": "💻", "Networking": "🌐",
  "Frontend": "🎨", "Backend": "⚙️", "Behavioural": "🤝",
  "Company Specific": "🏢", "Projects": "🚀", "Resume Tips": "📄",
  "ML & Statistics": "🤖", "HR Processes": "👥", "Product Thinking": "💡",
  "DevOps & Cloud": "☁️",
};

const DIFFICULTY_COLOR: Record<string, string> = {
  "Easy": "bg-green-100 text-green-600",
  "Medium": "bg-yellow-100 text-yellow-600",
  "Hard": "bg-red-100 text-red-600",
};

interface Question { title: string; difficulty: string; leetcode: string; youtube: string; }
interface Pattern { name: string; description: string; questions: Question[]; }
interface SectionData { patterns: Pattern[]; tips: string[]; resources: string[]; }
interface Section { title: string; topics: string[]; resources: string[]; difficulty: string; }
interface Roadmap { overview: string; timeline: string; sections: Section[]; tips: string[]; }

export default function InterviewTips() {
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [experience, setExperience] = useState("fresher");
  const [customRole, setCustomRole] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [rawTips, setRawTips] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [sectionData, setSectionData] = useState<Record<string, SectionData>>({});
  const [sectionLoading, setSectionLoading] = useState(false);

  const finalRole = role === "Other" ? customRole : role;
  const finalCompany = company === "Other" ? customCompany : company;

  const getTips = async () => {
    if (!finalRole || !finalCompany) return;
    setLoading(true);
    setRoadmap(null);
    setSectionData({});

    const res = await fetch("/api/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: finalRole, company: finalCompany, experience }),
    });
    const data = await res.json();
    setRawTips(data.result);

    try {
      const parsed = parseRoadmap(data.result, finalRole, finalCompany);
      setRoadmap(parsed);
      // Auto load first section
      if (parsed.sections.length > 0) {
        loadSectionData(parsed.sections[0].title, finalRole, finalCompany);
      }
    } catch (e) {
      setRoadmap(null);
    }
    setLoading(false);
  };

  const loadSectionData = async (sectionTitle: string, r?: string, c?: string) => {
    const useRole = r || finalRole;
    const useCompany = c || finalCompany;
    if (sectionData[sectionTitle]) return;
    setSectionLoading(true);
    try {
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: useRole, company: useCompany, experience, section: sectionTitle }),
      });
      const data = await res.json();
      if (data.sectionData) {
        setSectionData(prev => ({ ...prev, [sectionTitle]: data.sectionData }));
      }
    } catch (e) {
      console.error(e);
    }
    setSectionLoading(false);
  };

  const handleSectionClick = (index: number, title: string) => {
    setActiveSection(index);
    loadSectionData(title);
  };

  const extractSection = (text: string, keywords: string[]): string[] => {
    const lines = text.toLowerCase().split("\n");
    const found: string[] = [];
    lines.forEach(line => {
      keywords.forEach(kw => {
        if (line.includes(kw) && line.length > 5 && line.length < 200) {
          const clean = line.replace(/[-•*#]/g, "").trim();
          if (clean && !found.includes(clean)) found.push(clean);
        }
      });
    });
    return found.slice(0, 6);
  };

  const extractTips = (text: string): string[] => {
    const lines = text.split("\n").filter(l =>
      l.trim().startsWith("-") || l.trim().startsWith("•") || l.trim().match(/^\d+\./)
    );
    return lines.slice(0, 8).map(l => l.replace(/^[-•*\d.]+/, "").trim()).filter(Boolean);
  };

  const parseRoadmap = (text: string, role: string, company: string): Roadmap => {
    const r = role.toLowerCase();
    const isHR = r.includes("hr") || r.includes("human resource");
    const isPM = r.includes("product manager");
    const isData = r.includes("data analyst") || r.includes("data scientist");
    const isML = r.includes("ml") || r.includes("machine learning") || r.includes("data scientist");
    const isFrontend = r.includes("frontend");
    const isDevOps = r.includes("devops");
    const isSWE = r.includes("software") || r.includes("backend") || r.includes("full stack");

    const allSections = [
      {
        show: !isHR && !isPM,
        title: "DSA",
        topics: extractSection(text, ["array", "string", "tree", "graph", "dp", "sorting", "linked list", "stack", "queue", "heap"]),
        resources: ["LeetCode", "GeeksForGeeks", "NeetCode.io"],
        difficulty: isSWE || isML ? "High" : "Medium",
      },
      {
        show: !isHR && !isPM && !isData,
        title: "OOP",
        topics: extractSection(text, ["class", "object", "inheritance", "polymorphism", "encapsulation", "abstraction", "design pattern"]),
        resources: ["Refactoring Guru", "Head First Design Patterns"],
        difficulty: "Medium",
      },
      {
        show: isSWE || isML || isDevOps,
        title: "System Design",
        topics: extractSection(text, ["scalability", "load balancer", "cache", "microservice", "api", "cdn", "sharding"]),
        resources: ["System Design Primer", "ByteByteGo"],
        difficulty: "High",
      },
      {
        show: !isHR && !isPM,
        title: "Database",
        topics: extractSection(text, ["sql", "nosql", "query", "index", "normalization", "transaction", "join", "mongodb"]),
        resources: ["SQLZoo", "MongoDB Docs"],
        difficulty: "Medium",
      },
      {
        show: isSWE || isML || isDevOps,
        title: "OS",
        topics: extractSection(text, ["process", "thread", "memory", "deadlock", "scheduling", "semaphore", "mutex"]),
        resources: ["OS by Galvin", "GeeksForGeeks OS"],
        difficulty: "Medium",
      },
      {
        show: isFrontend,
        title: "Frontend",
        topics: extractSection(text, ["html", "css", "javascript", "react", "typescript", "dom", "browser", "webpack"]),
        resources: ["MDN Docs", "Frontend Mentor", "JavaScript.info"],
        difficulty: "High",
      },
      {
        show: isML,
        title: "ML & Statistics",
        topics: extractSection(text, ["regression", "classification", "neural", "statistics", "python", "numpy", "pandas", "tensorflow"]),
        resources: ["Kaggle", "fast.ai", "Andrew Ng Coursera"],
        difficulty: "High",
      },
      {
        show: isHR,
        title: "HR Processes",
        topics: extractSection(text, ["recruitment", "onboarding", "payroll", "labour law", "conflict", "performance", "policy"]),
        resources: ["SHRM", "HR Bartender", "LinkedIn Learning"],
        difficulty: "Medium",
      },
      {
        show: isPM,
        title: "Product Thinking",
        topics: extractSection(text, ["product", "metrics", "roadmap", "stakeholder", "user research", "prioritization", "agile"]),
        resources: ["Lenny's Newsletter", "Reforge", "Intercom Blog"],
        difficulty: "High",
      },
      {
        show: isDevOps,
        title: "DevOps & Cloud",
        topics: extractSection(text, ["docker", "kubernetes", "ci/cd", "jenkins", "aws", "azure", "terraform", "monitoring"]),
        resources: ["AWS Docs", "Docker Docs", "DevOps Roadmap"],
        difficulty: "High",
      },
      {
        show: isData,
        title: "Data & Analytics",
        topics: extractSection(text, ["excel", "tableau", "power bi", "statistics", "visualization", "python", "pandas", "sql"]),
        resources: ["Kaggle", "Mode Analytics", "Tableau Public"],
        difficulty: "Medium",
      },
      {
        show: true,
        title: "Behavioural",
        topics: extractSection(text, ["leadership", "conflict", "teamwork", "challenge", "star method", "communication"]),
        resources: ["STAR Method Guide", "Glassdoor Reviews"],
        difficulty: "Low",
      },
      {
        show: true,
        title: "Company Specific",
        topics: extractSection(text, [company.toLowerCase(), "culture", "values", "interview process", "rounds"]),
        resources: [`${company} Engineering Blog`, "Glassdoor", "Blind App"],
        difficulty: "Medium",
      },
    ];

    return {
      overview: `Personalized interview preparation roadmap for ${role} at ${company}.`,
      timeline: "4-8 weeks",
      sections: allSections
        .filter(s => s.show)
        .map(({ show, ...rest }) => rest)
        .map(s => s.topics.length === 0 ? { ...s, topics: ["See full guide below"] } : s),
      tips: extractTips(text),
    };
  };

  const difficultyColor = (d: string) => {
    if (d === "High") return "bg-red-100 text-red-600";
    if (d === "Medium") return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const renderMarkdown = (text: string) => {
    return text.split("\n").map((line, i) => {
      const trimmed = line.trim();
      if (!trimmed) return <div key={i} className="h-2" />;
      if (trimmed.startsWith("### ")) return <h3 key={i} className="font-extrabold text-gray-900 text-base mt-4 mb-2">{trimmed.replace("### ", "")}</h3>;
      if (trimmed.startsWith("## ")) return <h2 key={i} className="font-extrabold text-gray-900 text-lg mt-4 mb-2">{trimmed.replace("## ", "")}</h2>;
      if (trimmed.startsWith("# ")) return <h1 key={i} className="font-extrabold text-gray-900 text-xl mt-4 mb-2">{trimmed.replace("# ", "")}</h1>;
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) return <p key={i} className="font-bold text-gray-800 mt-2">{trimmed.replace(/\*\*/g, "")}</p>;
      if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) return (
        <div key={i} className="flex gap-2 ml-4 my-1">
          <span className="text-yellow-500 flex-shrink-0 mt-0.5">→</span>
          <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: trimmed.replace(/^[*-] /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
        </div>
      );
      if (trimmed.match(/^\d+\. /)) return (
        <div key={i} className="flex gap-2 ml-4 my-1">
          <span className="text-blue-500 flex-shrink-0 font-bold text-xs mt-1">{trimmed.match(/^\d+/)?.[0]}.</span>
          <span className="text-gray-600" dangerouslySetInnerHTML={{ __html: trimmed.replace(/^\d+\. /, "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
        </div>
      );
      return <p key={i} className="text-gray-600 my-1" dangerouslySetInnerHTML={{ __html: trimmed.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />;
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
      </nav>

      {!roadmap && !loading ? (
        <>
          <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-block bg-yellow-100 text-yellow-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">📚 Interview Prep Roadmap</div>
              <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
                Your Personal<br /><span className="text-yellow-500">Study Roadmap</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8 max-w-md">
                Select your target role and company — get a role-specific roadmap with patterns, YouTube links, and resources!
              </p>
              <div className="flex flex-wrap gap-3">
                {["Role-Specific Topics", "YouTube Links", "LeetCode Problems", "Company Tips", "Resources"].map((f) => (
                  <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
                ))}
              </div>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center text-lg">🏢</div>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Google • SWE</div>
                    <div className="text-gray-400 text-xs">Fresher • 6 weeks plan</div>
                  </div>
                </div>
                {[
                  { icon: "🧮", label: "DSA Patterns", color: "bg-red-50 border-red-200" },
                  { icon: "📦", label: "OOP & Design Patterns", color: "bg-blue-50 border-blue-200" },
                  { icon: "🏗️", label: "System Design", color: "bg-purple-50 border-purple-200" },
                  { icon: "🤝", label: "Behavioural", color: "bg-green-50 border-green-200" },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center gap-3 p-3 rounded-xl border mb-2 ${item.color}`}>
                    <span>{item.icon}</span>
                    <span className="text-gray-700 text-xs font-medium">{item.label}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <span className="text-red-500 text-xs">▶</span>
                      <span className="text-gray-400 text-xs">YouTube</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-2xl mx-auto px-6 pb-20">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Build Your Roadmap</h2>

              <div className="mb-5">
                <label className="text-gray-700 font-semibold text-sm mb-2 block">🎯 Target Role</label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {ROLES.map((r) => (
                    <button key={r} onClick={() => setRole(r)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition ${role === r ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-yellow-300"}`}>
                      {r}
                    </button>
                  ))}
                  <button onClick={() => setRole("Other")}
                    className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition ${role === "Other" ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-yellow-300"}`}>
                    Other
                  </button>
                </div>
                {role === "Other" && (
                  <input type="text" placeholder="Enter your role..." value={customRole} onChange={(e) => setCustomRole(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm mt-2" />
                )}
              </div>

              <div className="mb-5">
                <label className="text-gray-700 font-semibold text-sm mb-2 block">🏢 Target Company</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {COMPANIES.map((c) => (
                    <button key={c} onClick={() => setCompany(c)}
                      className={`px-3 py-2 rounded-xl border-2 text-xs font-medium transition ${company === c ? "border-yellow-500 bg-yellow-50 text-yellow-700" : "border-gray-200 text-gray-600 hover:border-yellow-300"}`}>
                      {c}
                    </button>
                  ))}
                </div>
                {company === "Other" && (
                  <input type="text" placeholder="Enter company name..." value={customCompany} onChange={(e) => setCustomCompany(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-yellow-500 text-sm mt-2" />
                )}
              </div>

              <div className="mb-6">
                <label className="text-gray-700 font-semibold text-sm mb-2 block">📊 Experience Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "fresher", label: "🌱 Fresher", desc: "0-1 years" },
                    { value: "mid", label: "💼 Mid Level", desc: "1-3 years" },
                    { value: "senior", label: "🚀 Senior", desc: "3+ years" },
                  ].map((e) => (
                    <button key={e.value} onClick={() => setExperience(e.value)}
                      className={`p-3 rounded-xl border-2 text-left transition ${experience === e.value ? "border-yellow-500 bg-yellow-50" : "border-gray-200 hover:border-yellow-300"}`}>
                      <div className="font-bold text-gray-800 text-sm">{e.label}</div>
                      <div className="text-gray-400 text-xs mt-1">{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={getTips} disabled={!finalRole || !finalCompany}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg">
                Generate My Roadmap →
              </button>
            </div>
          </div>
        </>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-4xl animate-bounce">📚</div>
          <h2 className="text-2xl font-bold text-gray-800">Building your roadmap...</h2>
          <p className="text-gray-500">Analyzing {finalCompany}'s interview patterns for {finalRole}</p>
          <div className="flex gap-2 mt-2">
            {["Topics", "Patterns", "Resources", "Company Tips"].map((t, i) => (
              <span key={t} className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{t}</span>
            ))}
          </div>
        </div>
      ) : roadmap ? (
        <div className="max-w-6xl mx-auto px-6 py-10">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-100 text-yellow-700 text-sm font-bold px-3 py-1 rounded-full">{finalCompany}</div>
                <div className="bg-blue-100 text-blue-700 text-sm font-bold px-3 py-1 rounded-full">{finalRole}</div>
                <div className="bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full capitalize">{experience}</div>
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Your Interview Roadmap</h2>
              <p className="text-gray-500 text-sm mt-1">⏱ {roadmap.timeline} — Click any section to load problems & YouTube links</p>
            </div>
            <button onClick={() => { setRoadmap(null); setRawTips(""); setSectionData({}); }}
              className="border-2 border-gray-200 hover:border-yellow-400 text-gray-500 hover:text-yellow-600 px-4 py-2 rounded-full text-sm font-semibold transition">
              ← New Roadmap
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1 space-y-2">
              {roadmap.sections.map((section, i) => (
                <button key={i} onClick={() => handleSectionClick(i, section.title)}
                  className={`w-full text-left p-4 rounded-2xl border-2 transition ${activeSection === i ? "border-yellow-500 bg-yellow-50" : "border-gray-100 bg-white hover:border-yellow-300"}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{TOPIC_ICONS[section.title] || "📌"}</span>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{section.title}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(section.difficulty)}`}>{section.difficulty}</span>
                    </div>
                  </div>
                </button>
              ))}

              <div className="bg-white rounded-2xl border border-gray-100 p-4 mt-4">
                <p className="text-gray-700 font-bold text-sm mb-3">⚡ Quick Tips</p>
                <ul className="space-y-2">
                  {roadmap.tips.slice(0, 5).map((tip, i) => (
                    <li key={i} className="text-gray-500 text-xs flex gap-2">
                      <span className="text-yellow-500 flex-shrink-0">→</span> {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3 space-y-4">
              {roadmap.sections[activeSection] && (
                <>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                        {TOPIC_ICONS[roadmap.sections[activeSection].title] || "📌"}
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-gray-900">{roadmap.sections[activeSection].title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor(roadmap.sections[activeSection].difficulty)}`}>
                          {roadmap.sections[activeSection].difficulty} Priority
                        </span>
                      </div>
                    </div>

                    {sectionLoading ? (
                      <div className="flex flex-col items-center py-12 gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl animate-spin">⚙️</div>
                        <p className="text-gray-500 text-sm">Loading problems & YouTube links...</p>
                      </div>
                    ) : sectionData[roadmap.sections[activeSection].title] ? (
                      <div className="space-y-6">
                        {/* Resources */}
                        <div className="flex flex-wrap gap-2">
                          {sectionData[roadmap.sections[activeSection].title].resources?.map((r, i) => (
                            <span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-xl font-medium">📚 {r}</span>
                          ))}
                        </div>

                        {/* Patterns */}
                        {sectionData[roadmap.sections[activeSection].title].patterns?.map((pattern, pi) => (
                          <div key={pi} className="border border-gray-100 rounded-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-5 py-3 border-b border-gray-100">
                              <h4 className="font-extrabold text-gray-800">{pattern.name}</h4>
                              {pattern.description && <p className="text-gray-500 text-xs mt-1">{pattern.description}</p>}
                            </div>
                            <div className="divide-y divide-gray-50">
                              {pattern.questions?.map((q, qi) => (
                                <div key={qi} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold flex-shrink-0 ${DIFFICULTY_COLOR[q.difficulty] || "bg-gray-100 text-gray-600"}`}>
                                    {q.difficulty}
                                  </span>
                                  <span className="text-gray-800 text-sm font-medium flex-1">{q.title}</span>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {q.leetcode && q.leetcode.includes("leetcode") && (
                                      <a href={q.leetcode} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-600 text-xs px-3 py-1.5 rounded-lg font-medium transition">
                                        🟠 LeetCode
                                      </a>
                                    )}
                                    {q.youtube && (
                                      <a href={q.youtube} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs px-3 py-1.5 rounded-lg font-medium transition">
                                        ▶ YouTube
                                      </a>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}

                        {/* Tips */}
                        {sectionData[roadmap.sections[activeSection].title].tips?.length > 0 && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                            <p className="text-yellow-700 font-bold text-sm mb-3">💡 Pro Tips</p>
                            <ul className="space-y-2">
                              {sectionData[roadmap.sections[activeSection].title].tips.map((tip, i) => (
                                <li key={i} className="text-gray-600 text-sm flex gap-2">
                                  <span className="text-yellow-500 flex-shrink-0">→</span> {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-4xl mb-3">👆</div>
                        <p className="text-sm">Click the section to load problems & YouTube links</p>
                      </div>
                    )}
                  </div>

                  {/* Full AI Guide */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <p className="text-gray-700 font-bold text-sm mb-4">🤖 Full AI Preparation Guide</p>
                    <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-y-auto text-sm leading-relaxed">
                      {renderMarkdown(rawTips)}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}