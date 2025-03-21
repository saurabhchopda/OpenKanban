import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, MoreHorizontal } from "lucide-react";
import TaskCard from "./TaskCard";
import NewTaskModal from "./NewTaskModal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { Task } from "@/types/task";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BASE_API_URL = "http://127.0.0.1:5000";

interface Column {
  id: number;
  title: string;
  tasks: Task[];
}

const KanbanBoard: React.FC = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const [columns, setColumns] = useState<Column[]>([
    { id: 1, title: "To Do", tasks: [] },
    { id: 2, title: "In Progress", tasks: [] },
    { id: 3, title: "Blocked", tasks: [] },
    { id: 4, title: "Done", tasks: [] },
  ]);
  const [newColumnTitle, setNewColumnTitle] = useState<string>("");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [activeColumn, setActiveColumn] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { currentUser } = useAuth();
  const navigate = useNavigate();
  console.log("board_id", boardId);
  // Fetch data from backend
  useEffect(() => {
    if (!currentUser && !loading) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await fetch(`${BASE_API_URL}/api/boards/${boardId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        console.log(data);
        if (data.columns) {
          setColumns(data.columns);
        }
      } catch (error) {
        console.error("Error fetching board data:", error);
        toast.error("Could not load board data");
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchData();
    }
  }, [boardId]);

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Column = {
      id: Date.now(),
      title: newColumnTitle,
      tasks: [],
    };

    console.log(newColumn);

    const addColumnData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await fetch(`${BASE_API_URL}/api/boards/${boardId}/columns`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newColumn }),
        });
      } catch (error) {
        console.error("Error creating task:", error);
      }
    };
    addColumnData();
    setColumns([...columns, newColumn]);
    setNewColumnTitle("");
  };

  const moveTask = (
    taskId: number,
    sourceColumnId: number,
    targetColumnId: number
  ) => {
    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
        // Remove from source column
        if (column.id === sourceColumnId) {
          return {
            ...column,
            tasks: column.tasks.filter((t) => t.id !== taskId),
          };
        }

        // Add to target column
        if (column.id === targetColumnId) {
          const sourceColumn = prevColumns.find((c) => c.id === sourceColumnId);
          if (!sourceColumn) return column;
          const task = sourceColumn.tasks.find((t) => t.id === taskId);
          if (!task) return column;
          return {
            ...column,
            tasks: [...column.tasks, task],
          };
        }

        return column;
      });
    });

    // Update task status in backend
    const updateTaskStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await fetch(`${BASE_API_URL}/api/tasks/${taskId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: targetColumnId }),
        });
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    };

    updateTaskStatus();
  };

  const openTaskModal = (columnId: number) => {
    setActiveColumn(columnId);
    setIsTaskModalOpen(true);
  };

  const addTask = (taskData: Omit<Task, "id">) => {
    if (!activeColumn) return;

    const newTask: Task = {
      ...taskData,
      id: Date.now(),
      board_id: parseInt(boardId ? boardId : "1", 10),
      assignee_id: currentUser?.id,
    };

    console.log(newTask);

    setColumns((prevColumns) => {
      return prevColumns.map((column) => {
        if (column.id === activeColumn) {
          return {
            ...column,
            tasks: [...column.tasks, newTask],
          };
        }
        return column;
      });
    });

    setIsTaskModalOpen(false);

    // Create task in backend
    const createTask = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        await fetch(`${BASE_API_URL}/api/columns/${activeColumn}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...newTask, status: activeColumn }),
        });
      } catch (error) {
        console.error("Error creating task:", error);
      }
    };

    createTask();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Kanban Board</h1>

        <div className="flex space-x-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div key={column.id} className="w-72 flex-shrink-0">
              <Card>
                <div className="p-3 border-b bg-slate-50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{column.title}</h3>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3 max-h-[70vh] overflow-y-auto">
                  {column.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      columnId={column.id}
                      onMove={moveTask}
                    />
                  ))}

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-500 mt-2"
                    onClick={() => openTaskModal(column.id)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add task
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}

          <div className="w-72 flex-shrink-0">
            <Card>
              <CardContent className="p-3">
                <Input
                  placeholder="Add new column..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="mb-2"
                />
                <Button onClick={addColumn} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {isTaskModalOpen && (
        <NewTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onAddTask={addTask}
        />
      )}
    </DndProvider>
  );
};

export default KanbanBoard;
