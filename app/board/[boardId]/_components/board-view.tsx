"use client";

import { useState } from "react";
import { Kanban, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { Canvas } from "./canvas";
import { KanbanBoard } from "./kanban/kanban-board";
import type { Id } from "@/convex/_generated/dataModel";

type BoardViewProps = {
  boardId: string;
};

type ViewMode = "canvas" | "kanban";

export const BoardView = ({ boardId }: BoardViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");

  return (
    <div className="h-full w-full relative">
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-md rounded-xl shadow-lg flex gap-2 p-2 border border-gray-200/50">
        <Hint label="Canvas View" side="bottom">
          <Button
            variant={viewMode === "canvas" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("canvas")}
            className={viewMode === "canvas" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "hover:bg-gray-100"}
          >
            <Layout className="h-5 w-5" />
          </Button>
        </Hint>
        <Hint label="Kanban View" side="bottom">
          <Button
            variant={viewMode === "kanban" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("kanban")}
            className={viewMode === "kanban" ? "bg-gradient-to-r from-blue-600 to-purple-600" : "hover:bg-gray-100"}
          >
            <Kanban className="h-5 w-5" />
          </Button>
        </Hint>
      </div>

      {/* Render active view */}
      {viewMode === "canvas" ? (
        <Canvas boardId={boardId} />
      ) : (
        <KanbanBoard boardId={boardId as Id<"boards">} />
      )}
    </div>
  );
};
