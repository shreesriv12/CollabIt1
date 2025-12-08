"use client";

import { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { Link2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ReactNode } from "react"; // Import ReactNode

import { useApiMutation } from "@/hooks/use-api-mutation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import { useRenameModal } from "@/store/use-rename-modal";
import { ConfirmModal } from "@/components/confirm-modal";
import { Button } from "@/components/ui/button";

interface ActionsProps {
  children: ReactNode;
  side?: DropdownMenuContentProps["side"];
  sideOffset?: DropdownMenuContentProps["sideOffset"];
  id: string;
  title: string;
  // --- NEW PROP ADDED ---
  customActions?: ReactNode[]; 
  // --- END NEW PROP ---
}

export const Actions = ({
  children,
  side,
  sideOffset,
  id,
  title,
  customActions, // Destructure the new prop
}: ActionsProps) => {
  const { onOpen } = useRenameModal();
  const { mutate, pending } = useApiMutation(api.board.remove);

  const onCopyLink = () => {
    navigator.clipboard
      .writeText(`${window.location.origin}/board/${id}`)
      .then(() => toast.success("Link copied!"))
      .catch(() => toast.error("Failed to copy link."));
  };

  const onDelete = () => {
    mutate({ id })
      .then(() => toast.success("Board deleted."))
      .catch(() => toast.error("Failed to delete board."));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        side={side}
        sideOffset={sideOffset}
        className="w-60"
      >
        {/* --- CUSTOM ACTIONS SECTION --- */}
        {customActions && customActions.length > 0 && (
          <>
            {customActions.map((action, index) => (
              <div key={index}>{action}</div>
            ))}
            <DropdownMenuSeparator />
          </>
        )}
        {/* --- END CUSTOM ACTIONS SECTION --- */}

        <DropdownMenuItem onClick={onCopyLink} className="p-3 cursor-pointer">
          <Link2 className="h-4 w-4 mr-2" />
          Copy board link
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => onOpen(id, title)}
          className="p-3 cursor-pointer"
        >
          <Pencil className="h-4 w-4 mr-2" />
          Rename
        </DropdownMenuItem>

        <ConfirmModal
          header="Delete board?"
          description="This action cannot be undone."
          disabled={pending}
          onConfirm={onDelete}
        >
          <Button
            variant="ghost"
            className="p-3 cursor-pointer text-sm w-full justify-start font-normal"
            disabled={pending}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </ConfirmModal>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};