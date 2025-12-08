"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { Plus, Users, LayoutGrid, LayoutList } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useOthers, useSelf, useUpdateMyPresence } from "@/liveblocks.config";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { List } from "./list";
import { Card } from "./card";
import type { Card as CardType } from "@/types/kanban";

type KanbanBoardProps = {
  boardId: Id<"boards">;
};

export const KanbanBoard = ({ boardId }: KanbanBoardProps) => {
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isProcessingDrag, setIsProcessingDrag] = useState(false);
  const [layoutMode, setLayoutMode] = useState<"horizontal" | "grid">("horizontal");

  const lists = useQuery(api.lists.get, { boardId });
  const allCards = useQuery(api.cards.getByBoard, { boardId });
  const createList = useMutation(api.lists.create);
  const moveCard = useMutation(api.cards.move);
  const reorderCards = useMutation(api.cards.reorder);

  // Real-time presence
  const others = useOthers();
  const self = useSelf();
  const updateMyPresence = useUpdateMyPresence();

  // Set presence to indicate viewing Kanban board
  useEffect(() => {
    updateMyPresence({ 
      cursor: null, // Not tracking cursor in Kanban view
    });
  }, [updateMyPresence]);

  const activeUsers = others.length + (self ? 1 : 0);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  const handleAddList = async () => {
    if (!newListTitle.trim()) return;

    try {
      await createList({
        boardId,
        title: newListTitle.trim(),
      });
      setNewListTitle("");
      setIsAddingList(false);
      toast.success("List created");
    } catch (error) {
      toast.error("Failed to create list");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Visual feedback during drag - could add optimistic updates here if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) {
      return;
    }

    if (isProcessingDrag) {
      toast.error("Please wait for the previous operation to complete");
      return;
    }

    const activeCardData = active.data.current?.card as CardType | undefined;
    const overListData = over.data.current?.list;
    const overCardData = over.data.current?.card as CardType | undefined;

    if (!activeCardData) return;

    setIsProcessingDrag(true);

    const activeCardId = activeCardData._id;
    const activeListId = activeCardData.listId;

    // Determine the target list ID
    let targetListId: Id<"lists">;
    if (overCardData) {
      // Dropped over a card - use that card's list
      targetListId = overCardData.listId;
    } else if (overListData) {
      // Dropped over an empty list area
      targetListId = overListData._id;
    } else {
      // Couldn't determine target - cancel
      return;
    }

    // Case 1: Moving to a different list
    if (targetListId !== activeListId) {
      try {
        const cardsInTargetList = (allCards?.filter(
          (card) => card.listId === targetListId
        ) || []).sort((a, b) => a.order - b.order);

        let newOrder: number;

        if (overCardData && overCardData.listId === targetListId) {
          // Insert at the position of the card we're hovering over
          const overIndex = cardsInTargetList.findIndex((c) => c._id === overCardData._id);
          newOrder = overIndex >= 0 ? overIndex : cardsInTargetList.length;
        } else {
          // Dropped in empty space - add to end
          newOrder = cardsInTargetList.length;
        }

        await moveCard({
          cardId: activeCardId,
          newListId: targetListId,
          newOrder,
        });

        // Reorder remaining cards in target list
        const updatedCards = [...cardsInTargetList];
        updatedCards.splice(newOrder, 0, activeCardData);
        
        await reorderCards({
          listId: targetListId,
          cardOrders: updatedCards.map((card, index) => ({
            id: card._id,
            order: index,
          })),
        });

        toast.success("Card moved to another list");
      } catch (error) {
        console.error("Failed to move card:", error);
        toast.error("Failed to move card");
      } finally {
        setIsProcessingDrag(false);
      }
    }
    // Case 2: Reordering within the same list
    else if (overCardData && activeCardId !== overCardData._id) {
      try {
        const cardsInList = (allCards?.filter(
          (card) => card.listId === activeListId
        ) || []).sort((a, b) => a.order - b.order);

        const oldIndex = cardsInList.findIndex((c) => c._id === activeCardId);
        const newIndex = cardsInList.findIndex((c) => c._id === overCardData._id);

        if (oldIndex === -1 || newIndex === -1) {
          setIsProcessingDrag(false);
          return;
        }

        const reorderedCards = arrayMove(cardsInList, oldIndex, newIndex);

        await reorderCards({
          listId: activeListId,
          cardOrders: reorderedCards.map((card, index) => ({
            id: card._id,
            order: index,
          })),
        });

        toast.success("Card reordered");
      } catch (error) {
        console.error("Failed to reorder cards:", error);
        toast.error("Failed to reorder cards");
      } finally {
        setIsProcessingDrag(false);
      }
    } else {
      setIsProcessingDrag(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className={`h-full w-full p-6 relative bg-gray-50 dark:bg-neutral-900 ${
        layoutMode === "horizontal" ? "overflow-x-auto overflow-y-hidden scrollbar-hide-horizontal" : "overflow-auto scrollbar-thin"
      }`}>
        {/* Layout Toggle */}
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg px-2 py-2 flex items-center gap-1 border border-gray-200 dark:border-neutral-700">
            <button
              onClick={() => setLayoutMode("horizontal")}
              className={`p-2 rounded transition-all duration-200 relative group ${
                layoutMode === "horizontal"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
              }`}
              title="Horizontal Scroll Layout"
            >
              <LayoutList className="h-4 w-4" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Horizontal
              </span>
            </button>
            <button
              onClick={() => setLayoutMode("grid")}
              className={`p-2 rounded transition-all duration-200 relative group ${
                layoutMode === "grid"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700"
              }`}
              title="Flexible Grid Layout"
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Grid
              </span>
            </button>
          </div>
        </div>

        {/* Active Users Indicator */}
        {activeUsers > 1 && (
          <div className="absolute top-6 right-6 bg-white dark:bg-neutral-800 rounded-lg shadow-lg px-4 py-2 flex items-center gap-2 z-10 border border-gray-200 dark:border-neutral-700 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-500">
              {activeUsers} active
            </span>
          </div>
        )}

        <div className={`${
          layoutMode === "horizontal"
            ? "flex gap-6 h-full pb-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-4 auto-rows-min"
        }`}>
          {/* Render Lists */}
          {lists?.map((list) => (
            <List key={list._id} list={list} layoutMode={layoutMode} />
          ))}

          {/* Add List Button/Form */}
          {isAddingList ? (
            <div className={`bg-white dark:bg-neutral-800 rounded-lg p-4 border-2 border-dashed border-gray-300 dark:border-neutral-600 shadow-lg animate-in fade-in zoom-in-95 duration-200 ${
              layoutMode === "horizontal" ? "w-80 flex-shrink-0" : "w-full"
            }`}>
              <Input
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                placeholder="Enter list title..."
                className="mb-3 border-gray-300 dark:border-neutral-600 focus:border-blue-500 focus:ring-blue-500 dark:bg-neutral-700 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddList();
                  }
                  if (e.key === "Escape") {
                    setIsAddingList(false);
                    setNewListTitle("");
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddList} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add List
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsAddingList(false);
                    setNewListTitle("");
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="ghost"
              className={`h-fit justify-start bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-750 border-2 border-dashed border-gray-300 dark:border-neutral-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 group ${
                layoutMode === "horizontal" ? "w-80 flex-shrink-0" : "w-full"
              }`}
              onClick={() => setIsAddingList(true)}
            >
              <Plus className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors" />
              <span className="text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-500 font-medium">Add a list</span>
            </Button>
          )}
        </div>
      </div>

      <DragOverlay dropAnimation={{
        duration: 200,
        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
      }}>
        {activeCard ? (
          <div className="rotate-6 scale-105 opacity-90">
            <Card card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
