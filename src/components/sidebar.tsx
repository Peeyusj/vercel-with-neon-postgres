"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Wallet,
  History,
  Award,
  Settings,
  Users,
  FileSpreadsheet,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/matches", label: "Matches", icon: Trophy },
  { href: "/dashboard/wallet", label: "Wallet", icon: Wallet },
  { href: "/dashboard/predictions", label: "Voting History", icon: History },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Award },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/matches", label: "Manage Matches", icon: Trophy },
  { href: "/admin/configurations", label: "Configuration", icon: Settings },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/roles", label: "Roles", icon: Shield },
  { href: "/admin/bulk-upload", label: "Bulk Upload", icon: FileSpreadsheet },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === "ADMIN" ? [...userLinks, ...adminLinks] : userLinks;

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-card transition-all duration-200 h-full",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            IPL Predict
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded hover:bg-muted"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {role === "ADMIN" && !collapsed && (
        <div className="px-3 pt-4 pb-1">
          <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            User
          </span>
        </div>
      )}

      <nav className="flex-1 p-2 space-y-1">
        {links.map((link, index) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/dashboard" &&
              link.href !== "/admin" &&
              pathname.startsWith(link.href));

          // Insert admin section header
          const showAdminHeader =
            role === "ADMIN" && !collapsed && index === userLinks.length;

          return (
            <div key={link.href}>
              {showAdminHeader && (
                <div className="px-3 pt-4 pb-1">
                  <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                    Admin
                  </span>
                </div>
              )}
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                title={collapsed ? link.label : undefined}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
