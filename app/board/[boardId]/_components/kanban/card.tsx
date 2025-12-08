"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Card as CardType } from "@/types/kanban";

type CardProps = {
  card: CardType;
};

export const Card = ({ card }: CardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");

  const updateCard = useMutation(api.cards.update);
  const deleteCard = useMutation(api.cards.remove);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card._id,
    data: {
      type: "card",
      card,
    },
  });

  const handleUpdate = async () => {
    try {
      await updateCard({
        id: card._id,
        title: title || "Untitled",
        description: description || undefined,
      });
      setIsEditing(false);
      toast.success("Card updated");
    } catch (error) {
      toast.error("Failed to update card");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCard({ id: card._id });
      toast.success("Card deleted");
    } catch (error) {
      toast.error("Failed to delete card");
    }
  };

  if (isEditing) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-300 p-4 mb-3 animate-in fade-in zoom-in-95 duration-200">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-3 font-semibold border-blue-300 focus:border-blue-500 bg-white"
          placeholder="Card title"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleUpdate();
            }
            if (e.key === "Escape") {
              setIsEditing(false);
              setTitle(card.title);
              setDescription(card.description || "");
            }
          }}
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mb-3 min-h-[80px] border-blue-300 focus:border-blue-500 bg-white resize-none"
          placeholder="Add description..."
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleUpdate} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Save
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setTitle(card.title);
              setDescription(card.description || "");
            }}
            className="hover:bg-white"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-white rounded-xl shadow-md border-2 border-gray-200 p-4 mb-3
        hover:shadow-lg hover:border-blue-400 cursor-grab active:cursor-grabbing 
        transition-all duration-200 group hover:scale-[1.02] hover:-translate-y-1
        ${isDragging ? "opacity-30 z-50 scale-105" : ""}
      `}
      onDoubleClick={() => setIsEditing(true)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 break-words mb-1">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed bg-gray-50 p-2 rounded-md">
              {card.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
