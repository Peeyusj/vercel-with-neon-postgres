"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/themes/selector";
import { signOut } from "@/lib/auth/client";

export function DashboardHeader({
  name,
  lostMoney,
  wonMoney,
  onMenuToggle,
}: {
  name: string;
  lostMoney?: string;
  wonMoney?: string;
  onMenuToggle?: () => void;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const lost = parseFloat(lostMoney || "0");
  const won = parseFloat(wonMoney || "0");

  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 gap-2">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1 rounded hover:bg-muted"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-sm text-muted-foreground hidden sm:block">
          Welcome,{" "}
          <span className="font-medium text-foreground">{name}</span>
        </div>
        <div className="text-sm font-medium text-foreground sm:hidden">{name}</div>
      </div>

      <div className="flex items-center gap-2">
        {won > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-green-50 dark:bg-green-950/30 px-2 py-1.5 text-sm border border-green-200 dark:border-green-900">
            <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
            <span className="font-semibold text-green-600 dark:text-green-400">
              +${won.toFixed(2)}
            </span>
          </div>
        )}
        {lost > 0 && (
          <div className="flex items-center gap-1 rounded-lg bg-red-50 dark:bg-red-950/30 px-2 py-1.5 text-sm border border-red-200 dark:border-red-900">
            <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
            <span className="font-semibold text-red-600 dark:text-red-400">
              -${lost.toFixed(2)}
            </span>
          </div>
        )}
        <ThemeSelector />
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
