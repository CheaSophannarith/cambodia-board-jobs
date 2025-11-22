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

const items = [
  { title: "Dashboard", href: "/dashboard", icon: ChartNoAxesCombined },
  {
    title: "Company Profile",
    href: "/company-profile",
    icon: Building2,
  },
  {
    title: "Company Users",
    href: "/company-users",
    icon: User,
  },
  { title: "Job Lists", href: "/job-list", icon: TableProperties },
  {
    title: "All Applications",
    href: "/company/all-application",
    icon: FileUser,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const { user, avartarUrl } = useAuth();

  console.log("Sidebar User:", user);

  return (
    <Sidebar>
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
      <SidebarContent>
        <SidebarMenu>
          {items.map((item) => {
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
          })}
        </SidebarMenu>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <Link href="/company/user-profile" className="w-full">
          <div className="flex items-center gap-3 px-4 py-3">
            {avartarUrl && avartarUrl.startsWith('http') ? (
              <Image
                src={avartarUrl}
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
                Company Account
              </span>
            </div>
          </div>
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
