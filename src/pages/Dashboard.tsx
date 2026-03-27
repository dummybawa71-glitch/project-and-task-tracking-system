import { useProjects } from "@/context/ProjectContext";
import { motion } from "framer-motion";
import { FolderKanban, ListChecks, CheckCircle2, Clock, Plus, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/PriorityBadge";
import { useState } from "react";
import { TaskDialog } from "@/components/TaskDialog";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  const { projects, tasks } = useProjects();
  const [taskOpen, setTaskOpen] = useState(false);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === "done").length;
  const inProgress = tasks.filter(t => t.status === "in_progress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;

  const statusData = [
    { name: "To Do", value: todoTasks, color: "hsl(220, 15%, 70%)" },
    { name: "In Progress", value: inProgress, color: "hsl(220, 70%, 50%)" },
    { name: "Done", value: doneTasks, color: "hsl(160, 60%, 45%)" },
  ].filter(d => d.value > 0);

  const projectData = projects.map(p => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    tasks: tasks.filter(t => t.projectId === p.id).length,
    done: tasks.filter(t => t.projectId === p.id && t.status === "done").length,
    color: `hsl(${p.color})`,
  }));

  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const stats = [
    { label: "Total Projects", value: projects.length, icon: FolderKanban, color: "text-primary" },
    { label: "Total Tasks", value: totalTasks, icon: ListChecks, color: "text-info" },
    { label: "In Progress", value: inProgress, icon: Clock, color: "text-warning" },
    { label: "Completed", value: doneTasks, icon: CheckCircle2, color: "text-success" },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your projects and tasks</p>
        </div>
        <Button onClick={() => setTaskOpen(true)} size="sm">
          <Plus className="h-4 w-4 mr-1" /> New Task
        </Button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(s => (
          <motion.div key={s.label} variants={item}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold mt-1">{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 ${s.color} opacity-80`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Task Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item} initial="hidden" animate="show">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Tasks by Project</CardTitle>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 8, fontSize: 13 }} />
                  <Bar dataKey="tasks" fill="hsl(220, 70%, 50%)" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="done" fill="hsl(160, 60%, 45%)" radius={[4, 4, 0, 0]} name="Done" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={item} initial="hidden" animate="show">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.map(t => {
                const project = projects.find(p => p.id === t.projectId);
                return (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project ? `hsl(${project.color})` : undefined }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{project?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <span className="text-xs text-muted-foreground capitalize">{t.status.replace("_", " ")}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <TaskDialog open={taskOpen} onOpenChange={setTaskOpen} />
    </div>
  );
}
