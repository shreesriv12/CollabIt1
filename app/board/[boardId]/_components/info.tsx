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
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useRenameModal } from "@/store/use-rename-modal";
import { exportCanvas } from "../../../../lib/pdfexport";

const TabSeparator = () => (
  <div className="text-neutral-300 dark:text-neutral-600 px-1.5 transition-colors">|</div>
);

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
    <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl px-3 h-14 flex items-center shadow-lg shadow-black/5 dark:shadow-black/20 gap-2 border border-neutral-200/50 dark:border-neutral-700/50 transition-all hover:shadow-xl">
      <Hint label="Go to boards" side="bottom" sideOffset={10}>
        <Button 
          variant="board" 
          className="px-2 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-200" 
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <Image
                src="/logo.svg"
                alt="Miro Clone Logo"
                height={36}
                width={36}
                className="transition-transform hover:scale-110 duration-200"
              />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
            </div>
            <span
              className={cn(
                "font-semibold text-xl bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent",
                font.className,
              )}
            >
              collabX
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
    </div>
  );
};

export const InfoSkeleton = () => {
  return (
    <div
      className="w-[350px] absolute top-4 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl px-3 h-14 flex items-center shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 animate-pulse"
      aria-hidden
    >
      <div className="flex items-center gap-3 w-full">
        <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-24 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
        <div className="h-5 w-32 rounded-lg bg-neutral-200 dark:bg-neutral-700" />
      </div>
    </div>
  );
};

// Enhanced ColorPicker Component
export const ColorPicker = ({ onChange }: { onChange: (color: Color) => void }) => {
  const colors = [
    { r: 243, g: 82, b: 35, name: "Red" },
    { r: 255, g: 249, b: 177, name: "Yellow" },
    { r: 68, g: 202, b: 99, name: "Green" },
    { r: 39, g: 142, b: 237, name: "Blue" },
    { r: 155, g: 105, b: 245, name: "Purple" },
    { r: 252, g: 142, b: 42, name: "Orange" },
    { r: 0, g: 0, b: 0, name: "Black" },
    { r: 255, g: 255, b: 255, name: "White" },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center max-w-[180px] pr-3 mr-3 border-r border-neutral-200 dark:border-neutral-700">
      {colors.map((color, index) => (
        <ColorButton key={index} color={color} onClick={onChange} name={color.name} />
      ))}
    </div>
  );
};

type ColorButtonProps = {
  onClick: (color: Color) => void;
  color: Color;
  name: string;
};

const ColorButton = ({ color, onClick, name }: ColorButtonProps) => {
  return (
    <Hint label={name} side="top" sideOffset={8}>
      <button
        className="w-9 h-9 items-center flex justify-center hover:scale-110 transition-all duration-200 group relative"
        onClick={() => onClick(color)}
        aria-label={`Select ${name} color`}
      >
        <div
          className="h-8 w-8 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 shadow-sm group-hover:shadow-md transition-all duration-200 relative overflow-hidden"
          style={{ background: colorToCSS(color) }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </button>
    </Hint>
  );
};

// Enhanced Canvas Main Container
export const EnhancedCanvasWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="h-full w-full relative bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 touch-none overflow-hidden">
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(0 0 0 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(0 0 0 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Gradient orbs for visual interest */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </main>
  );
};

// Enhanced Drawing Tools Panel
export const EnhancedDrawingTools = ({
  strokeWidth,
  strokeColor,
  fillColor,
  onStrokeWidthChange,
  onStrokeColorChange,
  onFillColorChange,
}: any) => {
  return (
    <div className="absolute top-[50%] -translate-y-1/2 left-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-black/5 dark:shadow-black/20 border border-neutral-200/50 dark:border-neutral-700/50 space-y-4 max-w-[220px]">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          Stroke Width
        </label>
        <input
          type="range"
          min="1"
          max="12"
          value={strokeWidth}
          onChange={(e) => onStrokeWidthChange(Number(e.target.value))}
          className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer accent-blue-500"
        />
        <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center font-medium">
          {strokeWidth}px
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
          Stroke Color
        </label>
        <ColorPicker onChange={onStrokeColorChange} />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
          Fill Color
        </label>
        <ColorPicker onChange={onFillColorChange} />
      </div>
    </div>
  );
};
