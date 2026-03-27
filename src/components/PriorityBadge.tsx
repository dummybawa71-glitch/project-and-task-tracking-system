import { Badge } from "@/components/ui/badge";
import { TaskPriority } from "@/types/project";

const priorityConfig: Record<TaskPriority, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-muted text-muted-foreground" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning border-warning/20" },
  high: { label: "High", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const config = priorityConfig[priority];
  return (
    <Badge variant="outline" className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </Badge>
  );
}
