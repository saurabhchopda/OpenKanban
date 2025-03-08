import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, LayoutGrid, Clock, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import NewBoardModal from "./NewBoardModal";
import { toast } from "sonner";

const BASE_API_URL = "http://127.0.0.1:5000";

interface Board {
  id: string;
  title: string;
  description?: string;
  columns?: Array<any>;
  created_at: string;
}

interface BoardData {
  title: string;
  description?: string;
}

const Dashboard: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!currentUser && !loading) {
      navigate("/login");
      return;
    }

    // Fetch boards
    const fetchBoards = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${BASE_API_URL}/api/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch boards");
        }

        const data = await response.json();
        setBoards(data);
      } catch (error) {
        console.error("Error fetching boards:", error);
        toast.error("Could not load your boards");
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, [currentUser, navigate, loading, toast]);

  const createBoard = async (boardData: BoardData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${BASE_API_URL}/api/boards`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boardData),
      });

      if (!response.ok) {
        throw new Error("Failed to create board");
      }

      const newBoard = await response.json();
      setBoards([...boards, newBoard]);
      setIsModalOpen(false);

      toast.success("Board created successfully");

      // Navigate to the new board
      navigate(`/board/${newBoard.id}`);
    } catch (error) {
      console.error("Error creating board:", error);
      toast.error("Could not create board");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Boards</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          New Board
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards.length > 0 ? (
          boards.map((board) => (
            <Link key={board.id} to={`/board/${board.id}`} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{board.title}</CardTitle>
                  {board.description && (
                    <CardDescription>{board.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-slate-500">
                    <LayoutGrid className="h-4 w-4 mr-1" />
                    <span>{board.columns?.length || 3} columns</span>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 mt-2">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>
                      Created: {new Date(board.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full">
                    <Activity className="h-4 w-4 mr-2" />
                    Open Board
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="col-span-full p-6">
            <CardContent className="text-center">
              <p className="text-slate-500 mb-4">No boards found</p>
              <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create your first board
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <NewBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateBoard={createBoard}
      />
    </div>
  );
};

export default Dashboard;
