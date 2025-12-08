"use client";

import { useState } from "react";
import { Kanban, Layout, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/hint";
import { cn } from "@/lib/utils";
import { Canvas } from "./canvas";
import { KanbanBoard } from "./kanban/kanban-board";
import { AnalyticsDashboard } from "./kanban/analytics-dashboard";
import type { Id } from "@/convex/_generated/dataModel";

type BoardViewProps = {
  boardId: string;
};

type ViewMode = "canvas" | "kanban" | "analytics";

export const BoardView = ({ boardId }: BoardViewProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("canvas");

  return (
    <div className="h-full w-full relative">
      {/* View Toggle */}
      <div className="absolute top-2 right-2 z-50 bg-white dark:bg-neutral-800 rounded-lg shadow-lg flex gap-1 p-1.5 border border-gray-200 dark:border-neutral-700">
        <Hint label="Canvas View" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("canvas")}
            className={cn(
              "h-9 w-9",
              viewMode === "canvas" 
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                : "hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300"
            )}
          >
            <Layout className="h-4 w-4" />
          </Button>
        </Hint>
        <Hint label="Kanban View" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("kanban")}
            className={cn(
              "h-9 w-9",
              viewMode === "kanban" 
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                : "hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300"
            )}
          >
            <Kanban className="h-4 w-4" />
          </Button>
        </Hint>
        <Hint label="Analytics" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setViewMode("analytics")}
            className={cn(
              "h-9 w-9",
              viewMode === "analytics" 
                ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700" 
                : "hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300"
            )}
          >
            <BarChart3 className="h-4 w-4" />
          </Button>
        </Hint>
      </div>

      {/* Render active view */}
      {viewMode === "canvas" ? (
        <Canvas boardId={boardId} />
      ) : viewMode === "kanban" ? (
        <KanbanBoard boardId={boardId as Id<"boards">} />
      ) : (
        <AnalyticsDashboard boardId={boardId as Id<"boards">} />
      )}
    </div>
  );
};
