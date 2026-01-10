"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getUnreadNotificationsCount,
  getAllNotifications,
  deleteNotification,
} from "@/app/actions/notification/notification";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const router = useRouter();
  const { companyName, companyLogoUrl, companyId } = useAuth();
  const [logoUrl, setLogoUrl] = useState<string>();
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleReadNotification = async (notification: any) => {
    if (notification.related_application_id) {
      // Optimistically update the notification count and mark as read
      if (!notification.is_read) {
        setNotificationCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      setIsSheetOpen(false);
      router.push(
        `/all-application/${notification.related_application_id}?read=true`
      );
    }
  };

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

    // Refetch when window regains focus or becomes visible
    const handleFocus = () => {
      fetchNotificationCount();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchNotificationCount();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [companyId]);

  // Fetch all notifications when sheet opens
  useEffect(() => {
    const fetchNotifications = async () => {
      if (companyId && isSheetOpen) {
        const notifs = await getAllNotifications(Number(companyId));
        setNotifications(notifs);
      }
    };

    fetchNotifications();
  }, [companyId, isSheetOpen]);

  const handleDeleteNotification = async (notificationId: number) => {
    const result = await deleteNotification(notificationId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      // Update count
      if (companyId) {
        const count = await getUnreadNotificationsCount(Number(companyId));
        setNotificationCount(count);
      }
    }
  };

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
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <div className="relative cursor-pointer">
                <Bell size={25} className="text-notice" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
              <SheetHeader className="border-b pb-4">
                <SheetTitle className="text-xl font-bold text-notice">
                  Notifications
                </SheetTitle>
                <SheetDescription className="text-gray-600">
                  Your recent notifications from the past month
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 border-notice bg-notice/5 rounded-r-lg shadow-sm hover:shadow-md transition-all flex items-start justify-between cursor-pointer ${
                        notification.is_read ? "opacity-40" : "opacity-100"
                      }`}
                      onClick={() => handleReadNotification(notification)}
                    >
                      <div className="flex-1 pr-3">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-base text-notice">
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="ml-2 px-2 py-0.5 bg-notice text-white text-xs font-semibold rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center">
                          <span className="mr-1">📅</span>
                          <span suppressHydrationWarning>
                            {new Date(
                              notification.created_at
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id);
                        }}
                        className="ml-2 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete notification"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/create-job">
            <Button className="text-white bg-notice py-4 px-3 rounded-none hover:bg-notice/80">
              + Post a job
            </Button>
          </Link>
          <Link href="/subscription">
            <Button className="text-notice border-1 border-notice bg-white py-4 px-3 rounded-none hover:text-notice/80 hover:bg-white hover:border-notice/80">
              Subscriptions
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
