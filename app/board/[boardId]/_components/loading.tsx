"use client";

import ReactLoading from "react-loading";
import { motion } from "framer-motion";

export const Loading = () => {
  return (
    <main className="h-full w-full relative bg-gradient-to-br from-blue-50 via-white to-purple-50 touch-none flex items-center justify-center">
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center gap-6 p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28 }}
        >
          {/* Polished central loader */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-20 blur-3xl" />
            <div className="relative z-10 rounded-full p-6 bg-white/60 dark:bg-black/40 backdrop-blur-sm">
              <ReactLoading type="spin" color="#3b82f6" height={88} width={88} />
            </div>
          </div>

          <motion.div
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
          >
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Preparing your workspace
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Hang tight — restoring collaborators and syncing changes.
            </p>
          </motion.div>

          <div className="flex items-center gap-3 mt-3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
};
