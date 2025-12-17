"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/app/actions/auth/auth";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export default function Header() {
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  console.log(user);

  const router = useRouter();

  // Fix hydration error by only rendering user-specific content after mount
  useState(() => {
    setMounted(true);
  });

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // If element doesn't exist, navigate to home page with hash
      router.push(`/#${targetId}`);
    }
  };

  return (
    <header className="sticky top-0 left-0 right-0 bg-[#f1f2f2] z-50 shadow-sm border-b border-gray-200">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-3 px-4 lg:px-6">
        {/* Left: Logo and Navigation */}
        <div className="flex items-center gap-2 md:gap-8">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <Image
              src="/CBJobs.png"
              alt="cbjobs-logo"
              width={45}
              height={45}
              className="w-10 h-10 md:w-12 md:h-12"
              priority
            />
            <h2 className="font-bold text-lg md:text-2xl text-gray-900">
              CBJobs
            </h2>
          </Link>
          <nav className="hidden lg:flex items-center gap-6 ml-4">
            <Link
              href="#find-jobs"
              onClick={(e) => handleSmoothScroll(e, "find-jobs")}
              className="font-medium text-sm text-gray-600 hover:text-notice transition-colors"
            >
              Find Jobs
            </Link>
            <Link
              href="/companies"
              className="font-medium text-sm text-gray-600 hover:text-notice transition-colors"
            >
              Browse Companies
            </Link>
          </nav>
        </div>

        {/* Right: Auth Links */}
        <div className="flex items-center gap-2">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <button
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-700" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[350px] flex flex-col"
            >
              <SheetTitle className="flex flex-col items-center justify-center gap-2 pt-4 pb-2">
                <Image
                  src="/CBJobs.png"
                  alt="CBJobs logo"
                  width={60}
                  height={60}
                  className="w-14 h-14"
                />
                <span className="font-bold text-xl text-gray-900">CBJobs</span>
              </SheetTitle>
              <nav className="flex flex-col gap-1 flex-1">
                <Link
                  href="#find-jobs"
                  onClick={(e) => {
                    handleSmoothScroll(e, "find-jobs");
                    setMobileMenuOpen(false);
                  }}
                  className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
                >
                  Find Jobs
                </Link>
                <Link
                  href="/companies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
                >
                  Browse Companies
                </Link>

                {mounted && user && (
                  <>
                    <div className="h-px bg-gray-200 my-3"></div>
                    {user.user_metadata?.user_type === "jobseeker" && (
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
                      >
                        Profile
                      </Link>
                    )}
                    {user.user_metadata?.user_type === "company" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors text-left"
                    >
                      Logout
                    </button>
                  </>
                )}
              </nav>

              {/* Auth buttons at bottom */}
              {mounted && !user && (
                <div className="mt-auto border-t border-gray-200 pt-4">
                  {loading ? (
                    <div className="px-4 py-3">
                      <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-0">
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-medium text-base text-gray-700 hover:text-notice hover:bg-gray-100 px-4 py-4 transition-colors text-center border-b border-gray-200"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/sign-up"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-medium text-white bg-notice hover:bg-notice/90 px-4 py-4 transition-colors text-center"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-3">
            {!mounted ? (
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
            ) : loading ? (
              <div className="w-10 h-10 rounded-full bg-gray-300 animate-pulse"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-10 h-10 rounded-full bg-notice flex items-center justify-center text-white font-semibold hover:bg-notice/90 transition-all hover:scale-105">
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
                  className="font-medium text-gray-700 hover:text-notice transition-colors text-sm px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="font-medium text-white bg-notice hover:bg-notice/90 px-4 py-2 transition-all text-sm whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
