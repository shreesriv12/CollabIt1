"use client";

import Image from "next/image";
import Link from "next/link";
import { Poppins, Playfair_Display } from "next/font/google";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Zap,
  Users,
  Shield,
  Palette,
  Sparkles,
  Check,
  Code2,
  MessageCircle,
} from "lucide-react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700"],
});

export default function LandingPage() {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  const handleSignUp = () => {
    router.push("/sign-up");
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-8">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Introducing CollabX 2.0 - Now with AI Mindmaps
            </span>
          </div>

          <h1
            className={cn(
              "text-6xl sm:text-7xl font-bold mb-6 leading-tight",
              playfair.className
            )}
          >
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Collaborate Smarter,
            </span>
            <br />
            <span className="text-black dark:text-white">Build Faster Together</span>
          </h1>

          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The ultimate platform for real-time collaboration. Create stunning diagrams, 
            flowcharts, mind maps, and ERD schemas with your team. Powered by cutting-edge AI.
          </p>

          <div className="flex gap-4 justify-center mb-20 flex-wrap">
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-6 text-lg rounded-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2 group"
              onClick={handleSignUp}
            >
              Get Started Free <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              variant="outline"
              className="px-8 py-6 text-lg dark:border-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              onClick={handleSignIn}
            >
              Watch Demo
            </Button>
          </div>

          {/* Hero Image with shadow */}
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 h-96 flex items-center justify-center">
                <div className="text-center">
                  <Image
                    src="/logo.svg"
                    alt="CollabX"
                    height={100}
                    width={100}
                    className="mx-auto mb-6"
                  />
                  <p className="text-neutral-600 dark:text-neutral-300 font-semibold text-lg">
                    Your collaborative workspace awaits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-50/50 dark:bg-slate-800/50 border-y border-neutral-200 dark:border-slate-700">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { number: "10K+", label: "Active Teams" },
              { number: "50K+", label: "Diagrams Created" },
              { number: "99.9%", label: "Uptime" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className={cn("text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2", poppins.className)}>
                  {stat.number}
                </p>
                <p className="text-neutral-600 dark:text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2
            className={cn(
              "text-5xl font-bold text-center mb-20 text-black dark:text-white",
              playfair.className
            )}
          >
            Powerful Features for Modern Teams
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Real-time collaboration with instant updates across all devices",
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Team Collaboration",
                description: "Work seamlessly with unlimited team members in real-time",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure & Private",
                description: "Enterprise-grade encryption and data protection",
              },
              {
                icon: <Palette className="h-8 w-8" />,
                title: "Customizable Themes",
                description: "Light and dark modes with personalization options",
              },
              {
                icon: <Code2 className="h-8 w-8" />,
                title: "Smart Shapes",
                description: "Advanced shapes, flowcharts, UML diagrams, and more",
              },
              {
                icon: <MessageCircle className="h-8 w-8" />,
                title: "Comments & Feedback",
                description: "Built-in commenting for seamless communication",
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                title: "AI-Powered",
                description: "Generate mind maps and diagrams with AI assistance",
              },
              {
                icon: <Check className="h-8 w-8" />,
                title: "Export Options",
                description: "Export to PDF, PNG, JPG, and more formats",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-xl bg-white dark:bg-slate-800 border border-neutral-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')]"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            className={cn(
              "text-5xl font-bold mb-6 text-white",
              playfair.className
            )}
          >
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl text-blue-50 mb-12">
            Join thousands of teams already creating amazing diagrams and collaborating in real-time.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
              onClick={handleSignUp}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/20 px-8 py-6 text-lg"
              onClick={handleSignIn}
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-slate-800 bg-neutral-50 dark:bg-slate-900 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className={cn("font-bold text-lg mb-4 text-black dark:text-white", poppins.className)}>
                Product
              </h3>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><Link href="#" className="hover:text-blue-600 transition">Features</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Pricing</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Security</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={cn("font-bold text-lg mb-4 text-black dark:text-white", poppins.className)}>
                Company
              </h3>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><Link href="#" className="hover:text-blue-600 transition">About</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={cn("font-bold text-lg mb-4 text-black dark:text-white", poppins.className)}>
                Resources
              </h3>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><Link href="#" className="hover:text-blue-600 transition">Docs</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">API</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className={cn("font-bold text-lg mb-4 text-black dark:text-white", poppins.className)}>
                Legal
              </h3>
              <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                <li><Link href="#" className="hover:text-blue-600 transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Terms</Link></li>
                <li><Link href="#" className="hover:text-blue-600 transition">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-200 dark:border-slate-800 pt-8 flex justify-between items-center">
            <p className="text-neutral-600 dark:text-neutral-400">
              © 2025 CollabX. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition">Twitter</Link>
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition">GitHub</Link>
              <Link href="#" className="text-neutral-600 dark:text-neutral-400 hover:text-blue-600 transition">LinkedIn</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}