export type TaskType = "task" | "bug" | "feature" | "epic";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  board_id: number;
  title: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  type?: TaskType;
  assignee_id?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
}
