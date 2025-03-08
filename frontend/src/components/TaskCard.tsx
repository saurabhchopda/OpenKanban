import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDrag, useDrop } from "react-dnd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, AlignLeft } from "lucide-react";
import { Task } from "@/types/task";

interface TaskCardProps {
  task: Task;
  columnId: number;
  onMove: (
    taskId: number,
    sourceColumnId: number,
    targetColumnId: number
  ) => void;
}

interface DragItem {
  id: number;
  columnId: number;
}

interface Assignee {
  name: string;
  avatar?: string;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onMove }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task.id, columnId },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "TASK",
    drop: (item: DragItem) => {
      if (item.columnId !== columnId) {
        onMove(item.id, item.columnId, columnId);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(node);
        drop(node);
      }}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="mb-2"
    >
      <Card className={`cursor-pointer ${isOver ? "border-blue-500" : ""}`}>
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-sm">{task.title}</h4>
            {task.priority && (
              <Badge variant={getPriorityVariant(task.priority)}>
                {task.priority}
              </Badge>
            )}
          </div>

          {task.description && (
            <div className="flex items-center text-xs text-slate-500 mb-2">
              <AlignLeft className="h-3 w-3 mr-1" />
              <span>Has description</span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center text-xs text-slate-500 mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            {task.type && (
              <Badge variant="outline" className="text-xs">
                {task.type}
              </Badge>
            )}

            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignee.avatar}
                  alt={task.assignee.name}
                />
                <AvatarFallback>
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const getPriorityVariant = (
  priority: string
): "default" | "destructive" | "secondary" | "outline" => {
  switch (priority.toLowerCase()) {
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    case "low":
      return "secondary";
    default:
      return "outline";
  }
};

const getInitials = (name: string): string => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

export default TaskCard;
