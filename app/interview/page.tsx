"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function InterviewPage() {
  const [role, setRole] = useState("");
  const [mode, setMode] = useState<"text" | "voice" | "video" | null>(null);
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [micMuted, setMicMuted] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const recognitionRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (started && mode === "video") {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
      startCamera();
    }
    return () => {
      clearInterval(timerRef.current);
      stopCamera();
    };
  }, [started]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.log("Camera not available");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const toggleCamera = () => {
    if (camOn) { stopCamera(); setCamOn(false); }
    else { startCamera(); setCamOn(true); }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    setSpeaking(true);
    utterance.onend = () => {
      setSpeaking(false);
      setAvatarLoading(false);
    };
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, messages: newMessages }),
    });
    const data = await res.json();
    const aiMessage: Message = { role: "assistant", content: data.result };
    setMessages([...newMessages, aiMessage]);
    setLoading(false);
    if (mode === "voice") speak(data.result);
    if (mode === "video") {
      setAvatarLoading(true);
      speak(data.result);
    }
  };

  const startListening = () => {
    if (micMuted) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert("Please use Chrome for voice mode."); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setListening(false);
      sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const startInterview = async () => {
    if (!role || !mode) return;
    setLoading(true);
    setMessages([]);
    const res = await fetch("/api/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, messages: [] }),
    });
    const data = await res.json();
    setMessages([{ role: "assistant", content: data.result }]);
    setStarted(true);
    setLoading(false);
    if (mode === "voice") speak(data.result);
    if (mode === "video") {
      setAvatarLoading(true);
      speak(data.result);
    }
  };

  const endCall = () => {
    setStarted(false);
    setMode(null);
    setMessages([]);
    setInput("");
    setRole("");
    setCallDuration(0);
    setAvatarLoading(false);
    window.speechSynthesis.cancel();
    clearInterval(timerRef.current);
    stopCamera();
  };

  const AIFace = () => (
    <div className="relative flex flex-col items-center justify-center flex-1 w-full h-full">
      {avatarLoading && (
        <>
          <div className="absolute w-52 h-52 rounded-full border-2 border-blue-400 opacity-20 animate-ping"></div>
          <div className="absolute w-44 h-44 rounded-full border-2 border-blue-400 opacity-30 animate-ping" style={{ animationDelay: "0.3s" }}></div>
        </>
      )}
      <div
        className={`w-36 h-36 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 ${avatarLoading ? "bg-blue-600 scale-110" : "bg-blue-800"}`}
        style={{ boxShadow: avatarLoading ? "0 0 40px rgba(59,130,246,0.6)" : "none" }}
      >
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" fill="#1e40af" stroke="#3b82f6" strokeWidth="2"/>
          <ellipse cx="28" cy="32" rx="5" ry={avatarLoading ? 2 : 5} fill="white"/>
          <ellipse cx="52" cy="32" rx="5" ry={avatarLoading ? 2 : 5} fill="white"/>
          <circle cx="28" cy="32" r="2.5" fill="#1e3a8a"/>
          <circle cx="52" cy="32" r="2.5" fill="#1e3a8a"/>
          {avatarLoading ? (
            <ellipse cx="40" cy="54" rx="10" ry="6" fill="white" opacity="0.9"/>
          ) : loading ? (
            <ellipse cx="40" cy="54" rx="6" ry="3" fill="white" opacity="0.7"/>
          ) : (
            <path d="M 30 52 Q 40 60 50 52" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
          )}
          {avatarLoading && (
            <>
              <line x1="64" y1="44" x2="64" y2="54" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
              <line x1="68" y1="40" x2="68" y2="58" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
              <line x1="72" y1="44" x2="72" y2="54" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round"/>
            </>
          )}
        </svg>
      </div>
      <div className="mt-6 text-center z-10">
        <span className="text-white font-bold text-lg block">AI Interviewer</span>
        <span className={`text-sm mt-1 block ${avatarLoading ? "text-blue-400" : loading ? "text-yellow-400" : "text-green-400"}`}>
          {avatarLoading ? "🔊 Speaking..." : loading ? "💭 Thinking..." : "● Online"}
        </span>
      </div>
      {avatarLoading && (
        <div className="flex gap-1 mt-4 z-10">
          {[1,2,3,4,5,6,7].map((i) => (
            <div key={i} className="w-1.5 bg-blue-400 rounded-full animate-bounce"
              style={{ height: `${8 + (i % 3) * 8}px`, animationDelay: `${i * 0.08}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );

  // SETUP PAGE
  if (!started) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <a href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
            <span className="text-xl font-bold text-gray-800">Resume Coach</span>
          </a>
          <a href="/" className="text-sm text-gray-500 hover:text-gray-800 transition">← Back to Home</a>
        </nav>

        <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1 rounded-full mb-6">
              🎤 AI Mock Interview
            </div>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
              Practice Interviews<br />Like a <span className="text-green-600">Pro</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 max-w-md">
              Choose your preferred mode and practice with a strict AI interviewer!
            </p>
            <div className="flex flex-wrap gap-3">
              {["Real conversation", "Instant feedback", "Role specific", "Build confidence"].map((f) => (
                <span key={f} className="bg-white border border-gray-200 text-gray-600 text-sm px-4 py-2 rounded-full shadow-sm">{f}</span>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="bg-[#1a2035] rounded-2xl shadow-2xl p-4 w-80 border border-[#2d3748]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-white text-xs font-bold">Mock Interview</span>
                <span className="text-green-400 text-xs">● Live</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#2d3748] rounded-xl h-28 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl mb-1">🧑‍💼</div>
                  <span className="text-white text-xs">AI Interviewer</span>
                </div>
                <div className="bg-[#2d3748] rounded-xl h-28 flex flex-col items-center justify-center">
                  <span className="text-4xl mb-1">📷</span>
                  <span className="text-white text-xs">Your Camera</span>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs">📵</div>
                <div className="w-8 h-8 bg-[#3d4f6b] rounded-full flex items-center justify-center text-xs">🎤</div>
                <div className="w-8 h-8 bg-[#3d4f6b] rounded-full flex items-center justify-center text-xs">📷</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-xl mx-auto px-6 pb-20">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Set Up Your Interview</h2>
            <input
              type="text"
              placeholder="e.g. Software Developer, Data Analyst..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition mb-6"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            <p className="text-gray-700 font-semibold mb-3">Choose Interview Mode</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setMode("text")}
                className={`p-4 rounded-xl border-2 text-left transition ${mode === "text" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
              >
                <div className="text-2xl mb-2">⌨️</div>
                <div className="font-bold text-gray-800 text-sm">Text</div>
                <div className="text-gray-400 text-xs mt-1">Type answers</div>
              </button>
              <button
                onClick={() => setMode("voice")}
                className={`p-4 rounded-xl border-2 text-left transition ${mode === "voice" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"}`}
              >
                <div className="text-2xl mb-2">🎤</div>
                <div className="font-bold text-gray-800 text-sm">Voice</div>
                <div className="text-gray-400 text-xs mt-1">Speak answers</div>
              </button>
              <button
                onClick={() => setMode("video")}
                className={`p-4 rounded-xl border-2 text-left transition ${mode === "video" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}
              >
                <div className="text-2xl mb-2">🎥</div>
                <div className="font-bold text-gray-800 text-sm">Video</div>
                <div className="text-gray-400 text-xs mt-1">AI face + webcam</div>
              </button>
            </div>

            {mode === "video" && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-700">
                🎥 Video mode shows an animated AI face. Click mic and speak — it auto-sends to AI instantly!
              </div>
            )}
            {mode === "voice" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-xs text-green-700">
                🎤 Voice mode — click mic and speak, your answer auto-sends to AI instantly!
              </div>
            )}

            <button
              onClick={startInterview}
              disabled={loading || !role || !mode}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-4 rounded-full font-bold text-lg transition shadow-lg"
            >
              {loading ? "Starting..." : "Start Interview →"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // VIDEO CALL UI
  if (mode === "video") {
    return (
      <div className="h-screen bg-[#0f1726] flex flex-col overflow-hidden">
        <div className="bg-[#1a2035] px-6 py-3 flex items-center justify-between border-b border-[#2d3748]">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-bold text-sm px-2 py-1 rounded-md">RC</div>
            <span className="text-white font-semibold">Video Interview</span>
            <span className="text-gray-400 text-sm">— {role}</span>
          </div>
          <div className="bg-[#2d3748] px-3 py-1 rounded-full text-green-400 text-sm font-mono">
            ● {formatTime(callDuration)}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col p-4 gap-4">
            <div className="grid grid-cols-2 gap-4 flex-1">

              {/* AI Animated Face */}
              <div className={`bg-[#1a2035] rounded-2xl border-2 relative overflow-hidden flex flex-col items-center justify-center ${avatarLoading ? "border-blue-500" : "border-[#2d3748]"}`}>
                {avatarLoading && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-pulse z-10"></div>}
                <AIFace />
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-lg z-10">
                  {role} Interviewer
                </div>
              </div>

              {/* User Webcam */}
              <div className={`bg-[#1a2035] rounded-2xl border-2 relative overflow-hidden ${listening ? "border-green-500" : "border-[#2d3748]"}`}>
                {listening && <div className="absolute top-0 left-0 right-0 h-1 bg-green-500 animate-pulse z-10"></div>}
                {camOn ? (
                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover rounded-2xl"/>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-4xl mb-4">👤</div>
                    <span className="text-gray-400 text-sm">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-lg z-10">
                  You {micMuted ? "🔇" : listening ? "🎤" : ""}
                </div>
                {listening && (
                  <div className="absolute top-3 right-3 z-10 flex gap-1">
                    {[1,2,3].map((i) => (
                      <div key={i} className="w-1.5 bg-green-400 rounded-full animate-bounce" style={{ height: `${8 + i * 4}px`, animationDelay: `${i * 0.1}s` }}></div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="bg-[#1a2035] rounded-2xl px-6 py-4 flex items-center justify-between border border-[#2d3748]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMicMuted(!micMuted)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${micMuted ? "bg-red-600" : "bg-[#2d3748] hover:bg-[#3d4f6b]"}`}
                >
                  {micMuted ? "🔇" : "🎤"}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition ${!camOn ? "bg-red-600" : "bg-[#2d3748] hover:bg-[#3d4f6b]"}`}
                >
                  {camOn ? "📷" : "🚫"}
                </button>
              </div>

              {/* Big mic button - auto sends on stop */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={listening ? stopListening : startListening}
                  disabled={loading || avatarLoading || micMuted}
                  className={`w-20 h-20 rounded-full text-3xl transition shadow-lg flex items-center justify-center ${
                    listening
                      ? "bg-green-500 animate-pulse ring-4 ring-green-300 ring-opacity-50"
                      : "bg-[#3d4f6b] hover:bg-[#4a5f80]"
                  } disabled:opacity-40`}
                >
                  {listening ? "⏹" : "🎙️"}
                </button>
                <span className="text-gray-400 text-xs">
                  {listening ? "Listening... tap to stop" : avatarLoading ? "AI speaking..." : loading ? "Processing..." : "Tap to speak"}
                </span>
              </div>

              <button
                onClick={endCall}
                className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-2xl transition shadow-lg"
              >
                📵
              </button>
            </div>
          </div>

          {/* Chat Sidebar */}
          <div className="w-80 bg-[#1a2035] border-l border-[#2d3748] flex flex-col">
            <div className="px-4 py-3 border-b border-[#2d3748]">
              <h3 className="text-white font-semibold text-sm">💬 Interview Chat</h3>
              <p className="text-gray-400 text-xs mt-1">{messages.length} messages</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-gray-500 text-xs mb-1">{msg.role === "user" ? "You" : "AI Interviewer"}</span>
                  <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed max-w-full ${
                    msg.role === "assistant"
                      ? "bg-[#2d3748] text-gray-200 rounded-tl-none"
                      : "bg-blue-600 text-white rounded-tr-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {(loading || avatarLoading) && (
                <div className="flex items-start">
                  <div className="bg-[#2d3748] rounded-xl rounded-tl-none px-3 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TEXT / VOICE CHAT UI
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <a href="/" className="flex items-center gap-2">
          <div className="bg-blue-600 text-white font-bold text-lg px-3 py-1 rounded-md">RC</div>
          <span className="text-xl font-bold text-gray-800">Resume Coach</span>
        </a>
        <button onClick={endCall} className="text-sm text-red-400 hover:text-red-600 border border-red-200 px-3 py-1 rounded-full transition">
          End Interview
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-72px)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">AI</div>
          <div>
            <div className="font-bold text-gray-800">AI Interviewer</div>
            <div className="text-green-500 text-xs">● {role} — {mode === "voice" ? "🎤 Voice Mode" : "⌨️ Text Mode"}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 flex-shrink-0">AI</div>
              )}
              <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm"
                  : "bg-green-600 text-white rounded-tr-none"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 mt-1">AI</div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          {mode === "voice" ? (
            <div className="flex items-center gap-4">
              <button
                onClick={listening ? stopListening : startListening}
                disabled={loading || speaking}
                className={`w-14 h-14 rounded-full text-2xl transition shadow-md flex items-center justify-center flex-shrink-0 ${
                  listening
                    ? "bg-red-500 animate-pulse text-white ring-4 ring-red-300 ring-opacity-50"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {listening ? "⏹" : "🎤"}
              </button>
              <div className="flex-1">
                <p className="text-gray-400 text-sm">
                  {listening ? "🎤 Listening... tap to stop & auto-send" : speaking ? "🔊 AI is speaking..." : loading ? "💭 Processing..." : "Tap mic to speak — auto sends when done!"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <textarea
                rows={2}
                placeholder="Type your answer... (Enter to send)"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-green-500 transition resize-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-200 text-white px-5 py-3 rounded-full font-bold transition shadow-md"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}