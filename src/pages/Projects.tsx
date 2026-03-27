import { useState } from "react";
import { useProjects } from "@/context/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";
import { TaskDialog } from "@/components/TaskDialog";
import { PriorityBadge } from "@/components/PriorityBadge";
import { motion } from "framer-motion";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Projects() {
  const { projects, tasks, deleteProject, deleteTask } = useProjects();
  const [projOpen, setProjOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | undefined>();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your projects and their tasks</p>
        </div>
        <Button onClick={() => setProjOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Project
        </Button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid gap-6">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const done = projectTasks.filter(t => t.status === "done").length;
          const pct = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;

          return (
            <motion.div key={project.id} variants={item}>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: `hsl(${project.color})` }} />
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => { setSelectedProject(project.id); setTaskOpen(true); }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteProject(project.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {project.description && <p className="text-sm text-muted-foreground mt-1">{project.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">{pct}%</span>
                  </div>
                </CardHeader>
                {projectTasks.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {projectTasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-2 h-2 rounded-full ${
                              task.status === "done" ? "bg-success" : task.status === "in_progress" ? "bg-primary" : "bg-muted-foreground/40"
                            }`} />
                            <span className={`text-sm truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <PriorityBadge priority={task.priority} />
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/70" onClick={() => deleteTask(task.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {projects.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg">No projects yet</p>
          <p className="text-sm mt-1">Create your first project to get started</p>
        </div>
      )}

      <ProjectDialog open={projOpen} onOpenChange={setProjOpen} />
      <TaskDialog open={taskOpen} onOpenChange={o => { setTaskOpen(o); if (!o) setSelectedProject(undefined); }} projectId={selectedProject} />
    </div>
  );
}
