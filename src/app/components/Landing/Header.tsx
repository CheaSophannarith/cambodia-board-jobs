import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#f1f2f2] z-50 w-screen">
      <div className="flex justify-between items-center max-w-7xl mx-auto py-4 px-4 lg:px-6 overflow-hidden">
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
              href="#"
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
        </div>
      </div>
    </header>
  );
}
