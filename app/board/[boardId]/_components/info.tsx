"use client";

import { useQuery } from "convex/react";
import { Menu } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hint";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";

const TabSeparator = () => <div className="text-neutral-300 dark:text-neutral-600 px-1.5">|</div>;

const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

type InfoProps = {
  boardId: string;
};

export const Info = ({ boardId }: InfoProps) => {
  const { onOpen } = useRenameModal();
  const data = useQuery(api.board.get, {
    id: boardId as Id<"boards">,
  });

  if (!data) return <InfoSkeleton />;

  return (
    <div className="absolute top-2 left-2 bg-white dark:bg-neutral-800 rounded-lg px-2 h-12 flex items-center shadow-lg border border-gray-200 dark:border-neutral-700 z-30">
      <Hint label="Go to boards" side="bottom" sideOffset={10}>
        <Button variant="board" className="px-2" asChild>
          <Link href="/">
            <Image
              src="/logo.svg"
              alt="CollabIt Logo"
              height={40}
              width={40}
            />
            <span
              className={cn(
                "font-semibold text-xl ml-2 text-black dark:text-white",
                font.className,
              )}
            >
              collabIt
            </span>
          </Link>
        </Button>
      </Hint>

      <TabSeparator />

      <Hint label="Edit title" side="bottom" sideOffset={10}>
        <Button
          onClick={() => onOpen(data._id, data.title)}
          variant="board"
          className="text-base font-normal px-2"
        >
          {data.title}
        </Button>
      </Hint>

      <TabSeparator />

      <Actions id={data._id} title={data.title} side="bottom" sideOffset={10}>
        <div className="">
          <Hint label="Main menu" side="bottom" sideOffset={10}>
            <Button size="icon" variant="board">
              <Menu />
            </Button>
          </Hint>
        </div>
      </Actions>

      <TabSeparator />

      <ThemeToggle />
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div
      className="w-[300px] absolute top-2 left-2 bg-white dark:bg-neutral-800 rounded-lg px-2 h-12 flex items-center shadow-lg border border-gray-200 dark:border-neutral-700 z-30"
      aria-hidden
    />
  );
};
