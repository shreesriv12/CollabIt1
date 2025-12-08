"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme ? savedTheme === "dark" : prefersDark;
    
    setIsDarkTheme(shouldBeDark);
    applyTheme(shouldBeDark);
  }, []);

  const applyTheme = (isDark: boolean) => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add("dark");
    } else {
      htmlElement.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    applyTheme(newTheme);
  };

  if (!isMounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative rounded-full hover:bg-accent transition-colors"
      title={isDarkTheme ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkTheme ? (
        <Moon className="h-5 w-5 text-yellow-500 transition-all" />
      ) : (
        <Sun className="h-5 w-5 text-orange-500 transition-all" />
      )}
    </Button>
  );
};