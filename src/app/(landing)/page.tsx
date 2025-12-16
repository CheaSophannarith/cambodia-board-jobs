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
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // Small delay to ensure the page has rendered
    }
  }, []);

  return (
    <div>
      <SearchableJobSection
        heroContent={
          <>
            <div className="space-y-2">
              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800">
                Explore
              </h1>
              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-gray-800">
                Exciting Jobs
              </h1>
              <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl text-notice">
                Start Your Career
              </h1>
              <Image
                src="/Victor-Line.png"
                alt="victor"
                height={8}
                width={400}
                className="mt-2"
              />
            </div>
            <p className="text-gray-500 text-lg md:text-xl font-extralight max-w-2xl">
              Great platform for the job seeker that is searching
              <br />
              new career heights and passionate about startups.
            </p>
          </>
        }
        promotionalContent={<PromotionalSection />}
      />
    </div>
  );
}
