"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Hexagon } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    
    const { data, error: authError } = await authClient.signUp.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
    });

    if (authError) {
      setError(authError.message!);
      setIsLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2 bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Left Side Branding */}
      <div className="relative hidden flex-col bg-zinc-900 p-10 text-white lg:flex justify-between overflow-hidden">
        <div className="absolute inset-0 bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        <div className="relative z-20 flex items-center text-lg font-medium tracking-tight">
          <Hexagon className="mr-2 h-6 w-6" />
          Acme Corp
        </div>
        
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl leading-relaxed">
              "This template saved me dozens of hours of configuration. Having Neon, Better Auth, and Vercel working together out of the box is basically a superpower."
            </p>
            <footer className="text-sm text-zinc-400">Sofia Davis, Lead Engineer</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="flex items-center justify-center p-8 lg:p-12">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Create an account</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your details below to kickstart your journey.
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required disabled={isLoading} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="name@example.com" required disabled={isLoading} className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required disabled={isLoading} className="h-11" />
              </div>
            </div>

            {error && <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}