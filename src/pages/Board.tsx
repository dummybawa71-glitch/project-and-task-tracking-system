import { useState } from "react";
import { useProjects } from "@/context/ProjectContext";
import { Task, TaskStatus } from "@/types/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { TaskDialog } from "@/components/TaskDialog";
import { Plus, GripVertical, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const columns: { status: TaskStatus; label: string; color: string }[] = [
  { status: "todo", label: "To Do", color: "bg-muted-foreground/30" },
  { status: "in_progress", label: "In Progress", color: "bg-primary" },
  { status: "done", label: "Done", color: "bg-success" },
];

export default function Board() {
  const { projects, tasks, moveTask, deleteTask } = useProjects();
  const [taskOpen, setTaskOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDrop = (status: TaskStatus) => {
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
    setDragOver(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Board</h1>
          <p className="text-muted-foreground text-sm mt-1">Drag tasks between columns to update status</p>
        </div>
        <Button onClick={() => setTaskOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 min-h-[60vh]">
        {columns.map(col => {
          const colTasks = tasks.filter(t => t.status === col.status);
          return (
            <div
              key={col.status}
              className={`rounded-xl p-4 transition-colors ${
                dragOver === col.status ? "bg-primary/5 ring-2 ring-primary/20" : "bg-muted/40"
              }`}
              onDragOver={e => { e.preventDefault(); setDragOver(col.status); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={() => handleDrop(col.status)}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <h2 className="text-sm font-semibold">{col.label}</h2>
                <span className="ml-auto text-xs text-muted-foreground font-medium bg-background px-2 py-0.5 rounded-full">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {colTasks.map(task => {
                    const project = projects.find(p => p.id === task.projectId);
                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={`cursor-grab active:cursor-grabbing ${draggedTask === task.id ? "opacity-50" : ""}`}
                      >
                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-3.5">
                            <div className="flex items-start gap-2">
                              <GripVertical className="h-4 w-4 text-muted-foreground/40 mt-0.5 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-snug">{task.title}</p>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                  {project && (
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(${project.color})` }} />
                                      <span className="text-xs text-muted-foreground">{project.name}</span>
                                    </div>
                                  )}
                                  <PriorityBadge priority={task.priority} />
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/50 hover:text-destructive shrink-0" onClick={() => deleteTask(task.id)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>

      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  );
}
