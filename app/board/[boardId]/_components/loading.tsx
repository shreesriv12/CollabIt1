"use client";

import ReactLoading from "react-loading";
import { motion } from "framer-motion";

import { InfoSkeleton } from "./info";
import { ParticipantsSkeleton } from "./participants";
import { ToolbarSkeleton } from "./toolbar";

export const Loading = () => {
  return (
    <main className="h-full w-full relative bg-gradient-to-br from-blue-50 via-white to-purple-50 touch-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Tetris Loader */}
          <div className="relative">
            {/* Glow effect behind loader */}
            <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 rounded-full" />
            
            <ReactLoading
              type="spinningBubbles"
              color="#3b82f6"
              height={120}
              width={120}
            />
          </div>

          {/* Loading Text with animation */}
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading CollabIt
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              Preparing your collaborative workspace...
            </p>
          </motion.div>

          {/* Animated progress dots */}
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>

      <InfoSkeleton />
      <ParticipantsSkeleton />
      <ToolbarSkeleton />
    </main>
  );
};
