"use client";

import { useEffect } from "react";
import Image from "next/image";
import PromotionalSection from "@/components/Landing/PromotionalSection";
import SearchableJobSection from "@/components/Landing/SearchableJobSection";

export default function Home() {
  useEffect(() => {
    // Handle scrolling to hash on page load
    const hash = window.location.hash;
    if (hash) {
      const targetId = hash.substring(1); // Remove the # character
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100); // Small delay to ensure the page has rendered
    }
  }, []);

  return (
    <div>
      <SearchableJobSection
        heroContent={
          <>
            <div className="space-y-1 sm:space-y-2">
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-800 leading-tight">
                Explore
              </h1>
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-gray-800 leading-tight">
                Exciting Jobs
              </h1>
              <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-notice leading-tight">
                Start Your Career
              </h1>
              <Image
                src="/Victor-Line.png"
                alt="victor"
                height={8}
                width={400}
                className="mt-2 w-full max-w-[250px] sm:max-w-[300px] md:max-w-[350px] lg:max-w-[400px] h-auto"
              />
            </div>
            <p className="text-gray-500 text-base sm:text-lg md:text-xl font-light max-w-2xl leading-relaxed">
              Great platform for the job seeker that is searching
              <br className="hidden sm:block" />
              new career heights and passionate about startups.
            </p>
          </>
        }
        promotionalContent={<PromotionalSection />}
      />
    </div>
  );
}
