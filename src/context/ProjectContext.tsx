import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Project, Task, TaskStatus, TaskPriority } from "@/types/project";

interface ProjectContextType {
  projects: Project[];
  tasks: Task[];
  addProject: (name: string, description: string, color: string) => void;
  updateProject: (id: string, data: Partial<Omit<Project, "id" | "createdAt">>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, title: string, description: string, priority: TaskPriority) => void;
  updateTask: (id: string, data: Partial<Omit<Task, "id" | "createdAt">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, status: TaskStatus) => void;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

const COLORS = ["220 70% 50%", "160 60% 45%", "38 92% 50%", "0 72% 51%", "280 60% 55%", "200 80% 55%"];

function genId() {
  return crypto.randomUUID();
}

const STORAGE_KEY = "taskflow_data";

function loadData(): { projects: Project[]; tasks: Task[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // seed data
  const now = new Date().toISOString();
  const p1 = { id: genId(), name: "Website Redesign", description: "Redesign the company website with a modern look", color: COLORS[0], createdAt: now, updatedAt: now };
  const p2 = { id: genId(), name: "Mobile App", description: "Build a cross-platform mobile application", color: COLORS[1], createdAt: now, updatedAt: now };
  const tasks: Task[] = [
    { id: genId(), projectId: p1.id, title: "Create wireframes", description: "Design initial wireframes for all pages", status: "done", priority: "high", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p1.id, title: "Design system setup", description: "Set up colors, typography and components", status: "in_progress", priority: "high", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p1.id, title: "Homepage implementation", description: "Code the new homepage design", status: "todo", priority: "medium", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p1.id, title: "Contact form", description: "Build and validate contact form", status: "todo", priority: "low", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p2.id, title: "Setup React Native", description: "Initialize project with Expo", status: "done", priority: "high", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p2.id, title: "Authentication flow", description: "Implement login and signup screens", status: "in_progress", priority: "high", createdAt: now, updatedAt: now },
    { id: genId(), projectId: p2.id, title: "Push notifications", description: "Integrate push notification service", status: "todo", priority: "medium", createdAt: now, updatedAt: now },
  ];
  return { projects: [p1, p2], tasks };
}

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addProject = useCallback((name: string, description: string, color: string) => {
    const now = new Date().toISOString();
    setData(d => ({ ...d, projects: [...d.projects, { id: genId(), name, description, color, createdAt: now, updatedAt: now }] }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Omit<Project, "id" | "createdAt">>) => {
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p) }));
  }, []);

  const deleteProject = useCallback((id: string) => {
    setData(d => ({ projects: d.projects.filter(p => p.id !== id), tasks: d.tasks.filter(t => t.projectId !== id) }));
  }, []);

  const addTask = useCallback((projectId: string, title: string, description: string, priority: TaskPriority) => {
    const now = new Date().toISOString();
    setData(d => ({ ...d, tasks: [...d.tasks, { id: genId(), projectId, title, description, status: "todo" as const, priority, createdAt: now, updatedAt: now }] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t) }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setData(d => ({ ...d, tasks: d.tasks.filter(t => t.id !== id) }));
  }, []);

  const moveTask = useCallback((id: string, status: TaskStatus) => {
    setData(d => ({ ...d, tasks: d.tasks.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t) }));
  }, []);

  return (
    <ProjectContext.Provider value={{ projects: data.projects, tasks: data.tasks, addProject, updateProject, deleteProject, addTask, updateTask, deleteTask, moveTask }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProjects must be used within ProjectProvider");
  return ctx;
}
