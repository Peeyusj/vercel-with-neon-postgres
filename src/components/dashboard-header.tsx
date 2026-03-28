"use client";

import { useRouter } from "next/navigation";
import { Wallet, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/themes/selector";
import { signOut } from "@/lib/auth/client";

export function DashboardHeader({
  name,
  walletBalance,
}: {
  name: string;
  walletBalance: string;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between border-b bg-card px-6 py-3">
      <div className="text-sm text-muted-foreground">
        Welcome, <span className="font-medium text-foreground">{name}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-sm">
          <Wallet className="h-4 w-4 text-green-500" />
          <span className="font-semibold">${parseFloat(walletBalance).toFixed(2)}</span>
        </div>
        <ThemeSelector />
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
