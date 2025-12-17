"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function PromotionalSection() {
  const { user, loading } = useAuth();

  return (
    <div className="max-w-7xl mx-auto mt-8 sm:mt-12 md:mt-12 lg:mt-16 mb-4 px-4 sm:px-6 md:px-8 py-4 sm:py-6">
      <div className="relative bg-notice text-white overflow-hidden rounded-none sm:rounded-none">
        <div
          className="absolute inset-0 bg-notice"
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 85%)",
          }}
        />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 p-6 sm:p-8 md:p-10 lg:p-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Start posting jobs today
            </h1>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </p>
            {!loading && !user && (
              <Link
                href="/sign-up"
                className="mt-4 sm:mt-6 bg-white text-notice px-4 sm:px-6 py-2 sm:py-3 rounded font-medium inline-block w-fit hover:bg-gray-100 transition text-sm sm:text-base"
              >
                Sign up for free
              </Link>
            )}
          </div>

          <div className="flex items-center justify-center lg:justify-end mt-6 lg:mt-0">
            <div className="relative w-full max-w-2xl">
              <Image
                src="/dashboard.png"
                alt="Dashboard Preview"
                width={800}
                height={600}
                className="shadow-2xl w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
