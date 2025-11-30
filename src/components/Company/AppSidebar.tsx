"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

import {
  ChartNoAxesCombined,
  Building2,
  TableProperties,
  FileUser,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiredRole?: string;
};

const items: NavigationItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: ChartNoAxesCombined },
  {
    title: "Company Profile",
    href: "/company-profile",
    icon: Building2,
    requiredRole: "admin", // Only visible to admin
  },
  {
    title: "Company Users",
    href: "/company-users",
    icon: User,
    requiredRole: "admin", // Only visible to admin
  },
  { title: "Job Lists", href: "/job-list", icon: TableProperties },
  {
    title: "All Applications",
    href: "/all-application",
    icon: FileUser,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const { user, avartarUrl, role, loading } = useAuth();

  const [profileUrl, setProfileUrl] = useState<string>("/default-avatar.png");

  // Filter navigation items based on user role
  const visibleItems = items.filter((item) => {
    if (!item.requiredRole) return true;
    return role === item.requiredRole;
  });

  useEffect(() => {
    if (avartarUrl) {
      const supabase = createClient();
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(avartarUrl);

      if (data?.publicUrl) {
        // Add timestamp to prevent caching issues
        setProfileUrl(`${data.publicUrl}?t=${new Date().getTime()}`);
      }
    }
  }, [avartarUrl]);

  console.log("Sidebar User:", user);

  return (
    <Sidebar>
      <Link href="/">
        <SidebarHeader className="border-b border-gray-300">
          <div className="flex items-center gap-2 px-4 py-[22px]">
            <Image
              src="/CBJobs.png"
              alt="cbjobs-logo"
              width={40}
              height={40}
              className="flex-shrink-0 -mt-3"
            />
            <span className="text-2xl font-bold leading-none">CBJobs</span>
          </div>
        </SidebarHeader>
      </Link>
      <SidebarContent>
        <SidebarMenu>
          {loading ? (
            // Show skeleton/placeholder while loading to prevent flash
            <>
              <SidebarMenuItem>
                <div className="h-12 bg-gray-200 animate-pulse rounded mt-2" />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="h-12 bg-gray-200 animate-pulse rounded mt-2" />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <div className="h-12 bg-gray-200 animate-pulse rounded mt-2" />
              </SidebarMenuItem>
            </>
          ) : (
            visibleItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`hover:bg-notice hover:text-white hover:px-3 hover:rounded-none ${
                      isActive ? "bg-notice text-white px-3 rounded-none" : ""
                    }`}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center py-6 mt-2"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Link href="/user-profile" className="w-full">
          <div className="flex items-center gap-3 px-4 py-3">
            {profileUrl && profileUrl.startsWith("http") ? (
              <Image
                src={profileUrl}
                alt="User avatar"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-notice flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.user_metadata?.display_name}
              </span>
              <span className="text-xs text-muted-foreground">
                {role === "admin" ? "Company Account" : "User Account"}
              </span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
