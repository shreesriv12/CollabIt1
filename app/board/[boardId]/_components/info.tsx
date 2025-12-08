// Enhanced Info Component with better styling and animations
"use client";

import { useQuery } from "convex/react";
import { Menu, Download, Loader2, Sparkles } from "lucide-react";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useTransition, useCallback } from "react";
import { toast } from "sonner";

import { Actions } from "@/components/actions";
import { Hint } from "@/components/hint";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { exportCanvas } from "../../../../lib/pdfexport";

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
  const [isPending, startTransition] = useTransition();

  const handleExport = useCallback((format: 'jpg' | 'pdf') => {
    const mainElement = document.querySelector('main.h-full');
    if (!mainElement) {
      toast.error("Canvas element not found.");
      return;
    }
    
    const filename = data?.title.replace(/\s/g, '_') || boardId;

    startTransition(async () => {
      await exportCanvas(mainElement as HTMLElement, filename, format);
    });
  }, [boardId, data?.title]);

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
          className="text-base font-medium px-3 py-2 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 max-w-[200px] truncate"
        >
          <span className="truncate">{data.title}</span>
        </Button>
      </Hint>

      <TabSeparator />

      <ThemeToggle />
      
      <TabSeparator />
      
      <Actions 
        id={data._id} 
        title={data.title} 
        side="bottom" 
        sideOffset={10}
        customActions={[
          <Button 
            key="export-jpg"
            onClick={() => handleExport('jpg')}
            disabled={isPending}
            variant="ghost"
            className="w-full justify-start text-sm hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JPG
          </Button>,
          <Button 
            key="export-pdf"
            onClick={() => handleExport('pdf')}
            disabled={isPending}
            variant="ghost"
            className="w-full justify-start text-sm hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Export as PDF
          </Button>
        ]}
      >
        <div>
          <Hint label="Main menu" side="bottom" sideOffset={10}>
            <Button 
              size="icon" 
              variant="board" 
              disabled={isPending}
              className="hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200 relative overflow-hidden group"
            >
              {isPending ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <>
                  <Menu className="h-5 w-5 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </>
              )}
            </Button>
          </Hint>
        </div>
      </Actions>

      {/* <TabSeparator /> */}

      {/* <ThemeToggle /> */}
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div
      className="w-[300px] absolute top-2 left-2 bg-white dark:bg-neutral-800 rounded-lg px-3 h-12 flex items-center shadow-lg border border-gray-200 dark:border-neutral-700 z-30"
      aria-hidden
    >
      <div className="flex items-center gap-3 w-full">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
    </div>
  );
};
