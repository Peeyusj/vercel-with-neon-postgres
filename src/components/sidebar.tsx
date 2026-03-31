"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  History,
  Award,
  Settings,
  Users,
  FileSpreadsheet,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const userLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/matches", label: "Matches", icon: Trophy },
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

interface SidebarProps {
  role: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({
  role,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const links = role === "ADMIN" ? [...userLinks, ...adminLinks] : userLinks;

  const navContent = (
    <>
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
                onClick={onMobileClose}
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
    </>
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-card transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <span className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            IPL Predict
          </span>
          <button
            onClick={onMobileClose}
            className="p-1 rounded hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r bg-card transition-all duration-200 h-full",
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
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
        {navContent}
      </aside>
    </>
  );
}
