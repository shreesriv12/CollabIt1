"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { MoreHorizontal, Plus, Trash2, Pencil } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Card } from "./card";
import type { List as ListType } from "@/types/kanban";

type ListProps = {
  list: ListType;
  layoutMode?: "horizontal" | "grid";
};

export const List = ({ list, layoutMode = "horizontal" }: ListProps) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");

  const cards = useQuery(api.cards.getByList, { listId: list._id });
  const createCard = useMutation(api.cards.create);
  const updateList = useMutation(api.lists.update);
  const deleteList = useMutation(api.lists.remove);

  const { setNodeRef, isOver } = useDroppable({
    id: list._id,
    data: {
      type: "list",
      list,
    },
  });

  const cardIds = cards?.map((card) => card._id) || [];

  const handleUpdateTitle = async () => {
    if (!title.trim()) {
      setTitle(list.title);
      setIsEditingTitle(false);
      return;
    }

    try {
      await updateList({
        id: list._id,
        title: title.trim(),
      });
      setIsEditingTitle(false);
      toast.success("List updated");
    } catch (error) {
      toast.error("Failed to update list");
    }
  };

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;

    try {
      await createCard({
        listId: list._id,
        boardId: list.boardId,
        title: newCardTitle.trim(),
      });
      setNewCardTitle("");
      setIsAddingCard(false);
      toast.success("Card created");
    } catch (error) {
      toast.error("Failed to create card");
    }
  };

  const handleDeleteList = async () => {
    try {
      await deleteList({ id: list._id });
      toast.success("List deleted");
    } catch (error) {
      toast.error("Failed to delete list");
    }
  };

  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-xl p-4 flex flex-col shadow-lg border hover:shadow-xl transition-all duration-200 ${
      layoutMode === "horizontal" ? "w-80 flex-shrink-0 max-h-full" : "w-full h-fit"
    } ${
      isOver ? "border-blue-500 dark:border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 shadow-2xl scale-[1.02]" : "border-gray-200 dark:border-neutral-700"
    }`}>
      {/* List Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-neutral-700">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUpdateTitle();
              }
              if (e.key === "Escape") {
                setTitle(list.title);
                setIsEditingTitle(false);
              }
            }}
            className="h-9 font-bold text-base border-gray-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white"
            autoFocus
          />
        ) : (
          <h3
            className="font-bold text-base text-gray-900 dark:text-white flex-1 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all duration-200"
            onClick={() => setIsEditingTitle(true)}
          >
            {list.title}
          </h3>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-neutral-700">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit title
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteList}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete list
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards Container */}
      <div 
        ref={setNodeRef} 
        className={`flex-1 overflow-y-auto mb-3 space-y-0 scrollbar-thin pr-1 rounded-lg transition-all duration-200 ${
          layoutMode === "horizontal" ? "min-h-[120px] max-h-[calc(100vh-300px)]" : "min-h-[120px] max-h-[600px]"
        } ${
          isOver ? "bg-blue-100/30 dark:bg-blue-950/30 ring-2 ring-blue-400 dark:ring-blue-600 ring-inset" : ""
        }`}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {cards?.map((card) => (
            <Card key={card._id} card={card} />
          ))}
        </SortableContext>
        {/* Empty state indicator when hovering over empty list */}
        {isOver && cards?.length === 0 && (
          <div className="flex items-center justify-center h-full text-blue-600 dark:text-blue-400 font-medium text-sm animate-pulse">
            Drop card here
          </div>
        )}
      </div>

      {/* Add Card Section */}
      {isAddingCard ? (
        <div className="mt-2 p-3 bg-white dark:bg-neutral-700 rounded-lg border border-gray-300 dark:border-neutral-600 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Input
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            className="mb-2 bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 focus:border-blue-500 text-gray-900 dark:text-white"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddCard();
              }
              if (e.key === "Escape") {
                setIsAddingCard(false);
                setNewCardTitle("");
              }
            }}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAddCard} className="bg-blue-600 hover:bg-blue-700">
              Add Card
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle("");
              }}
              className="hover:bg-blue-100"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="ghost"
          className="w-full justify-start text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
          onClick={() => setIsAddingCard(true)}
        >
          <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
          Add a card
        </Button>
      )}
    </div>
  );
};
