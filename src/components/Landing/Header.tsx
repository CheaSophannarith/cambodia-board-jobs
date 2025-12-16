"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/app/actions/auth/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, loading } = useAuth();

  console.log(user);

  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#f1f2f2] z-50 w-screen">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-4 px-4 lg:px-6">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center space-x-4 md:space-x-8 lg:space-x-12">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Image
              src="/CBJobs.png"
              alt="cbjobs-logo"
              width={55}
              height={55}
              className="mb-2"
            />
            <h2 className="font-bold text-2xl">CBJobs</h2>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="#find-jobs"
              onClick={(e) => handleSmoothScroll(e, 'find-jobs')}
              className="font-medium text-base text-gray-600 hover:text-notice transition"
            >
              Find Jobs
            </Link>
            <Link
              href="#"
              className="font-medium text-base text-gray-600 hover:text-notice transition"
            >
              Browse Companies
            </Link>
          </nav>
        </div>

        {/* Right: Auth Links */}
        <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-10 h-10 rounded-full bg-notice flex items-center justify-center text-white font-semibold hover:bg-notice/90 transition">
                  {user.email?.charAt(0).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user.user_metadata?.user_type === "jobseeker" && (
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.user_metadata?.user_type === "company" && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-700 hover:text-notice transition text-sm md:text-base"
              >
                Sign In
              </Link>
              <div className="h-8 w-px bg-gray-300 hidden sm:block"></div>
              <Link
                href="/sign-up"
                className="font-medium text-white bg-notice px-3 md:px-4 py-2 transition text-sm md:text-base whitespace-nowrap"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
