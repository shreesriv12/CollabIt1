"use client";

import { useOrganization } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export const EmptyBoards = () => {
  const router = useRouter();
  const { mutate, pending } = useApiMutation(api.board.create);
  const { organization } = useOrganization();

  const onClick = () => {
    if (!organization) return;

    mutate({
      orgId: organization.id,
      title: "Untitled",
    })
      .then((id) => {
        toast.success("Board created.");
        router.push(`/board/${id}`);
      })
      .catch(() => toast.error("Failed to create board."));
  };
  return (
    <div className="h-full flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
      <div className="animate-pulse">
        <Image src="/empty-boards.svg" alt="Empty" height={110} width={110} />
      </div>
      <h2 className="text-2xl font-bold mt-6 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Create your first board.</h2>

      <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
        Start by creating a board for your organization.
      </p>

      <div className="mt-6">
        <Button
          disabled={pending}
          aria-disabled={pending}
          onClick={onClick}
          size="lg"
        >
          Create board
        </Button>
      </div>
    </div>
  );
};
