"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

export default function SignUpPage() {
  const router = useRouter();
  const { openSignUp } = useClerk(); // Use the useClerk hook

  const handleSignUp = () => {
    openSignUp(); // Open the Clerk Sign Up modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-colors">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 border-b border-neutral-200 dark:border-slate-800 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Image
                  src="/logo.svg"
                  alt="CollabX Logo"
                  height={40}
                  width={40}
                  className="group-hover:scale-110 transition-transform"
                />
              </div>
              <span
                className={cn(
                  "font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
                  poppins.className
                )}
              >
                collabX
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={handleSignUp}
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sign Up Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className={cn("text-5xl font-bold mb-6", playfair.className)}>
            Create Your Account
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-12">
            Join us and start collaborating today!
          </p>
          <Button onClick={handleSignUp} className="px-8 py-4 text-lg">
            Sign Up
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-slate-800 bg-neutral-50 dark:bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-neutral-600 dark:text-neutral-400">
            © 2025 CollabX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}