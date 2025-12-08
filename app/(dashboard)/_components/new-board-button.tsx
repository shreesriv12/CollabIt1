"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { cn } from "@/lib/utils";

type NewBoardButtonProps = {
  orgId: string;
  disabled?: boolean;
};

export const NewBoardButton = ({ orgId, disabled }: NewBoardButtonProps) => {
  const router = useRouter();
  const { mutate, pending } = useApiMutation(api.board.create);

  const onClick = () => {
    mutate({
      orgId,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created.");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board."));
  };

  return (
    <button
      disabled={pending || disabled}
      aria-disabled={pending || disabled}
      onClick={onClick}
      className={cn(
        "col-span-1 aspect-[100/127] bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-lg flex flex-col items-center justify-center py-6 border-2 border-dashed border-blue-300 dark:border-blue-700 shadow-lg",
        pending || disabled
          ? "opacity-75 cursor-not-allowed"
          : "hover:from-blue-700 hover:to-purple-700 dark:hover:from-blue-600 dark:hover:to-purple-600 hover:scale-105 hover:shadow-xl transition-all duration-300 hover:-translate-y-1",
      )}
    >
      <div aria-hidden />
      <Plus className="h-12 w-12 text-white stroke-1" />
      <p className="text-sm text-white font-light">New board</p>
    </button>
  );
};
