"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Hexagon } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    const { data, error: authError } = await authClient.signIn.email({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    });

    if (authError) {
      setError(authError.message || "Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2 bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Right Side Form (Flipped order for variety) */}
      <div className="flex items-center justify-center p-8 lg:p-12 order-2 lg:order-1">
        <div className="mx-auto w-full max-w-[400px] space-y-8">
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-950/50 p-3 rounded-md border border-red-200 dark:border-red-900">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="px-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link
              href="/sign-up"
              className="underline underline-offset-4 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Left Side Branding */}
      <div className="relative hidden flex-col bg-zinc-900 p-10 text-white lg:flex justify-between overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-zinc-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

        <div className="relative z-20 flex items-center justify-end text-lg font-medium tracking-tight w-full">
          Acme Corp
          <Hexagon className="ml-2 h-6 w-6" />
        </div>

        <div className="relative z-20 mt-auto text-right">
          <blockquote className="space-y-2">
            <p className="text-xl leading-relaxed">
              "Secure, fast, and seamless. Exactly what modern development
              should feel like."
            </p>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
