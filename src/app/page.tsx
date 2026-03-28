"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Database, Zap, LogOut, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export default function Home() {
  const router = useRouter();
  
  // 1. Ask Better Auth if someone is currently logged in
  const { data: session, isPending } = authClient.useSession();

  // 2. Create a function to handle logging out
  const handleSignOut = async () => {
    await authClient.signOut();
    router.refresh(); // Refresh the page to clear the state
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800">
      
      {/* Background Gradients */}
      <div className="absolute top-0 -z-10 h-full w-full bg-zinc-950">
        <div className="absolute bottom-auto left-auto right-0 top-0 h-[500px] w-[500px] -translate-x-[30%] translate-y-[20%] rounded-full bg-[rgba(120,119,198,0.3)] opacity-50 blur-[80px]"></div>
      </div>

      <div className="container relative z-10 flex flex-col items-center text-center px-4 sm:px-6">
        
        <div className="mb-8 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-sm text-zinc-300 backdrop-blur-xl">
          <Sparkles className="mr-2 h-4 w-4 text-blue-400" />
          <span className="flex gap-2">
            Better Auth & Neon DB Integration <span className="hidden sm:inline">is now live</span>
          </span>
        </div>

        {/* 3. DYNAMIC HERO HEADLINE */}
        <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-7xl">
          {session ? (
            <>
              Welcome back, <br className="hidden sm:block" />
              <span className="bg-gradient-to-br from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {session.user.name}
              </span>
            </>
          ) : (
            <>
              Build the future with <br className="hidden sm:block" />
              <span className="bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
                Next.js & Postgres
              </span>
            </>
          )}
        </h1>
        
        <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
          {session 
            ? "You are securely authenticated and connected to the Neon database. Your session is active." 
            : "A production-ready fullstack template engineered for speed. Featuring Edge rendering, serverless database scaling, and zero-config authentication."
          }
        </p>

        {/* 4. DYNAMIC CALL TO ACTIONS */}
        <div className="mt-10 flex w-full flex-col justify-center gap-4 sm:flex-row min-h-[48px]">
          {isPending ? (
            <div className="text-zinc-500 animate-pulse">Loading session...</div>
          ) : session ? (
            <>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 group">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={handleSignOut}
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-12 px-8 text-base border-zinc-800 bg-zinc-900/50 hover:bg-red-950 hover:text-red-400 hover:border-red-900 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button size="lg" className="w-full h-12 px-8 text-base bg-white text-black hover:bg-zinc-200 group">
                  Start Building
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full h-12 px-8 text-base border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="mt-20 grid grid-cols-2 gap-8 text-sm text-zinc-500 sm:grid-cols-2 md:flex md:gap-16">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-zinc-400" />
            <span>Vercel Edge</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-zinc-400" />
            <span>Neon Serverless</span>
          </div>
        </div>

      </div>
    </div>
  );
}