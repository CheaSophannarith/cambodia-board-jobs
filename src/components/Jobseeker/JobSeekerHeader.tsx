"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function JobSeekerHeader() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-white flex items-center gap-2 px-4 py-5 border-b border-gray-300">
      <SidebarTrigger className="mr-4" />
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {user?.user_metadata?.display_name || "Job Seeker"}
          </h2>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <button
            className="relative hover:bg-gray-100 p-2 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell size={24} className="text-notice" />
            {/* Notification badge - can be conditionally shown when there are notifications */}
            {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
          </button>
        </div>
      </div>
    </header>
  );
}
