export type TaskType = "task" | "bug" | "feature" | "epic";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  type?: TaskType;
  assignee?: {
    name: string;
    avatar?: string;
  };
}
