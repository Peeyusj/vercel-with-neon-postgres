"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    // If not loading and no session, redirect to sign-in
    if (!isPending && !session) {
      router.push("/sign-in");
    }
    // If logged in, redirect to dashboard
    else if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-lg text-zinc-600">Redirecting...</p>
      </div>
    </div>
  );
}
