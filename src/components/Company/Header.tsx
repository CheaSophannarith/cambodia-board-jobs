"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { getUnreadNotificationsCount } from "@/app/actions/notification/notification";

export function Header() {
  const { companyName, companyLogoUrl, companyId } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>();
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    if (companyLogoUrl) {
      const supabase = createClient();
      const { data } = supabase.storage
        .from("company-logos")
        .getPublicUrl(companyLogoUrl);

      if (data?.publicUrl) {
        setLogoUrl(data.publicUrl);
      }
    }
  }, [companyLogoUrl]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (companyId) {
        const count = await getUnreadNotificationsCount(Number(companyId));
        setNotificationCount(count);
      }
    };

    fetchNotificationCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <header className="sticky top-0 z-50 bg-white flex items-center gap-2 px-4 py-5 border-b border-gray-300">
      <SidebarTrigger className="mr-4" />
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <div className="w-10 h-10 relative overflow-hidden rounded-md">
              <Image
                src={logoUrl}
                alt="Company logo"
                width={40}
                height={40}
                className="flex-shrink-0 max-w-full max-h-full object-contain"
              />
            </div>
          )}
          <div className="flex flex-col">
            <p className="text-sm font-light text-gray-500">Company</p>
            <h2 className="text-lg font-semibold">{companyName}</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="relative cursor-pointer">
            <Bell size={25} className="text-notice" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </div>
          <Link href="/create-job">
            <Button className="text-white bg-notice py-4 px-3 rounded-none hover:bg-notice/80">
              + Post a job
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
