"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export const Loading = () => {
  return (
    <div className="h-full w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="relative">
        {/* Rotating rings around logo */}
        <motion.div
          className="absolute -inset-8 rounded-full border-4 border-blue-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -inset-6 rounded-full border-4 border-purple-500/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Logo with scale animation */}
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
          }}
        >
          <Image
            src="/logo.svg"
            alt="CollabIt Logo"
            width={120}
            height={120}
          />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.div
        className="mt-8 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CollabIt
        </h3>
        
        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-2 w-2 rounded-full bg-blue-500"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};
