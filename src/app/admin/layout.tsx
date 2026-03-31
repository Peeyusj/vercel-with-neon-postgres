"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { useProfile } from "@/hooks/use-profile";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { profile, loading: profileLoading } = useProfile();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  useEffect(() => {
    if (!profileLoading && profile && profile.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [profileLoading, profile, router]);

  if (isPending || profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session || !profile || profile.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        role="ADMIN"
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <DashboardHeader
          name={session.user.name}
          lostMoney={profile.lostMoney}
          wonMoney={profile.wonMoney}
          onMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
