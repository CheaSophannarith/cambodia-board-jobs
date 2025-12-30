"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Home,
  User,
  FileText,
  Lock,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

const items: NavigationItem[] = [
  { title: "Home", href: "/", icon: Home },
  { title: "Profile", href: "/profile", icon: User },
  { title: "My Applications", href: "/applications", icon: FileText },
  { title: "Change Password", href: "/change-password", icon: Lock },
];

export function JobSeekerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadAvatar() {
      if (user?.id) {
        const supabase = createClient();
        const { data: profileData } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("user_id", user.id)
          .single();

        if (profileData?.avatar_url) {
          // Handle both old file paths and new full URLs
          let url = profileData.avatar_url;
          if (!url.startsWith("http")) {
            url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${profileData.avatar_url}`;
          }
          setAvatarUrl(url);
        }
      }
    }
    loadAvatar();
  }, [user]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Failed to logout. Please try again.");
        setIsLoggingOut(false);
        return;
      }

      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");
      setIsLoggingOut(false);
    }
  };

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
            items.map((item) => {
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
                      prefetch={true}
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
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="px-2 py-2 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-2 py-2">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
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
                {user?.user_metadata?.display_name || "Job Seeker"}
              </span>
              <span className="text-xs text-muted-foreground">
                Job Seeker Account
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
