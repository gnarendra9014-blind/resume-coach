import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Coach AI",
  description: "AI-powered career tools — Resume Builder, Mock Interview, Resume Reviewer, Interview Tips",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}