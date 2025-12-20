"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import Link from "next/link";

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobTitle = searchParams.get("jobTitle") || "this position";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 md:p-12 border border-gray-200 text-center">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Application Submitted!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your application was successfully submitted for{" "}
            <span className="text-notice font-semibold">{jobTitle}</span>
          </p>

          {/* Back to Homepage Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-8 py-4 bg-notice text-white font-semibold rounded-lg hover:bg-notice/90 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Back to Homepage</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
