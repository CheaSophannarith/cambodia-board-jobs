import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-notice text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-6 sm:pt-10 sm:pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/CBJobs.png"
                alt="CBJobs logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <h3 className="font-bold text-xl">CBJobs</h3>
            </div>
            <p className="text-sm text-white/80 text-center sm:text-left">
              Find your dream job in Cambodia
            </p>
          </div>

          {/* Quick Links */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/#find-jobs"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Find Jobs
                </Link>
              </li>
              <li>
                <Link
                  href="/companies"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Browse Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* For Job Seekers */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sign-up"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Create Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4">For Employers</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/sign-up"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Post a Job
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/company-profile"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  Company Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 pt-8 border-t border-white/20">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} CBJobs. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white/80">
                Owner of this website:
              </span>
              <div className="flex items-center gap-3">
                <a
                  href="https://www.facebook.com/rith.rith.582103/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="https://www.instagram.com/lafiikhai2_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://t.me/FiiKhai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/chea-sophannarith-b21511239/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/80 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
