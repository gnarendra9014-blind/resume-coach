import React from "react";

export interface ResumeData {
  personal: {
    name: string;
    contact: string;
  };
  summary: string;
  experience: { title: string; company: string; date: string; points: string[] }[];
  education: { degree: string; school: string; date: string; details: string }[];
  projects: { name: string; tech: string; date: string; points: string[] }[];
  skills: string[];
}

export const ModernTemplate = ({ data }: { data: ResumeData }) => (
  <div style={{ padding: "40px", fontFamily: "Helvetica, Arial, sans-serif", color: "#333", backgroundColor: "#fff", minHeight: "1056px", boxSizing: "border-box" }}>
    <header style={{ borderBottom: "3px solid #60a5fa", paddingBottom: "20px", marginBottom: "20px" }}>
      <h1 style={{ fontSize: "36px", margin: "0 0 8px 0", color: "#1f2937", fontWeight: 800, textTransform: "uppercase", letterSpacing: "2px" }}>{data.personal?.name || "JANE DOE"}</h1>
      <p style={{ margin: 0, color: "#6b7280", fontSize: "14px", fontWeight: 600 }}>{data.personal?.contact || "hello@example.com | 123-456-7890 | linkedin.com/in/jane"}</p>
    </header>
    
    <section style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "18px", color: "#60a5fa", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Professional Summary</h2>
      <p style={{ margin: 0, fontSize: "14px", lineHeight: 1.6 }}>{data.summary}</p>
    </section>

    {data.experience && data.experience.length > 0 && (
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", color: "#60a5fa", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Experience</h2>
        {data.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{exp.title} <span style={{ color: "#6b7280", fontWeight: 400 }}>at {exp.company}</span></h3>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{exp.date}</span>
            </div>
            <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px", fontSize: "14px", lineHeight: 1.5 }}>
              {exp.points?.map((p, j) => <li key={j} style={{ marginBottom: "4px" }}>{p}</li>)}
            </ul>
          </div>
        ))}
      </section>
    )}

    {data.projects && data.projects.length > 0 && (
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", color: "#60a5fa", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Projects</h2>
        {data.projects.map((proj, i) => (
          <div key={i} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{proj.name}</h3>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{proj.date}</span>
            </div>
            <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#60a5fa", fontWeight: 600 }}>{proj.tech}</p>
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "14px", lineHeight: 1.5 }}>
              {proj.points?.map((p, j) => <li key={j} style={{ marginBottom: "4px" }}>{p}</li>)}
            </ul>
          </div>
        ))}
      </section>
    )}

    {data.education && data.education.length > 0 && (
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", color: "#60a5fa", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>Education</h2>
        {data.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>{edu.degree}</h3>
              <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: 600 }}>{edu.date}</span>
            </div>
            <p style={{ margin: 0, fontSize: "14px", color: "#374151", fontWeight: 600 }}>{edu.school}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#6b7280" }}>{edu.details}</p>
          </div>
        ))}
      </section>
    )}

    {data.skills && data.skills.length > 0 && (
      <section style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", color: "#60a5fa", borderBottom: "1px solid #e5e7eb", paddingBottom: "8px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Skills</h2>
        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "14px", lineHeight: 1.6 }}>
          {data.skills.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      </section>
    )}
  </div>
);

export const ClassicTemplate = ({ data }: { data: ResumeData }) => (
  <div style={{ padding: "40px 50px", fontFamily: "'Times New Roman', Times, serif", color: "#000", backgroundColor: "#fff", minHeight: "1056px", boxSizing: "border-box" }}>
    <header style={{ textAlign: "center", marginBottom: "24px" }}>
      <h1 style={{ fontSize: "32px", margin: "0 0 4px 0", fontWeight: 700 }}>{data.personal?.name || "JANE DOE"}</h1>
      <p style={{ margin: 0, fontSize: "12px" }}>{data.personal?.contact || "hello@example.com | 123-456-7890 | linkedin.com/in/jane"}</p>
    </header>
    
    {/* Body similar to Modern but serif and centered headers */}
    <section style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "16px", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px", textTransform: "uppercase", fontWeight: 700 }}>Summary</h2>
      <p style={{ margin: 0, fontSize: "12px", lineHeight: 1.5 }}>{data.summary}</p>
    </section>

    {/* Rest of the data mapped similarly but with Classic styling */}
    <section style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "16px", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px", textTransform: "uppercase", fontWeight: 700 }}>Professional Experience</h2>
      {data.experience?.map((exp, i) => (
        <div key={i} style={{ marginBottom: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontSize: "14px", fontWeight: 700 }}>{exp.company}</span>
            <span style={{ fontSize: "12px", fontStyle: "italic" }}>{exp.date}</span>
          </div>
          <div style={{ fontSize: "12px", fontStyle: "italic", marginBottom: "4px" }}>{exp.title}</div>
          <ul style={{ margin: 0, paddingLeft: "24px", fontSize: "12px", lineHeight: 1.5 }}>
            {exp.points?.map((p, j) => <li key={j} style={{ marginBottom: "2px" }}>{p}</li>)}
          </ul>
        </div>
      ))}
    </section>
    
    <section style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "16px", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px", textTransform: "uppercase", fontWeight: 700 }}>Education</h2>
      {data.education?.map((edu, i) => (
        <div key={i} style={{ marginBottom: "8px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: "12px" }}>{edu.school}</span><br />
            <span style={{ fontStyle: "italic", fontSize: "12px" }}>{edu.degree}</span>
            {edu.details && <div style={{ fontSize: "11px", marginTop: "2px" }}>{edu.details}</div>}
          </div>
          <div style={{ fontSize: "12px" }}>{edu.date}</div>
        </div>
      ))}
    </section>

    <section style={{ marginBottom: "20px" }}>
      <h2 style={{ fontSize: "16px", textAlign: "center", borderBottom: "1px solid #000", paddingBottom: "4px", marginBottom: "12px", textTransform: "uppercase", fontWeight: 700 }}>Skills</h2>
      <ul style={{ margin: 0, paddingLeft: "24px", fontSize: "12px", lineHeight: 1.5 }}>
          {data.skills?.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
    </section>
  </div>
);
