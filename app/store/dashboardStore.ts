import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SavedResume = {
  id: string;
  name: string;
  role: string;
  createdAt: number;
  resumeText: string;
  atsScore: number | null;
  status: "draft" | "applied" | "interviewing" | "rejected" | "offer";
};

type DashboardStore = {
  resumes: SavedResume[];
  saveResume: (resume: SavedResume) => void;
  updateStatus: (id: string, status: SavedResume["status"]) => void;
  deleteResume: (id: string) => void;
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      resumes: [],
      saveResume: (resume) =>
        set((state) => {
          const exists = state.resumes.find((r) => r.id === resume.id);
          if (exists) {
            return {
              resumes: state.resumes.map((r) =>
                r.id === resume.id ? resume : r
              ),
            };
          }
          return { resumes: [...state.resumes, resume] };
        }),
      updateStatus: (id, status) =>
        set((state) => ({
          resumes: state.resumes.map((r) =>
            r.id === id ? { ...r, status } : r
          ),
        })),
      deleteResume: (id) =>
        set((state) => ({
          resumes: state.resumes.filter((r) => r.id !== id),
        })),
    }),
    {
      name: "resume-coach-dashboard", // unique name to save to local storage
    }
  )
);
