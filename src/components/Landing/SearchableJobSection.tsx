"use client";

import { useState, ReactNode } from "react";
import SearchForm from "./SearchForm";
import JobSearch from "./JobSearch";

interface SearchableJobSectionProps {
  heroContent: ReactNode;
  promotionalContent: ReactNode;
}

export default function SearchableJobSection({
  heroContent,
  promotionalContent,
}: SearchableJobSectionProps) {
  const [searchFilters, setSearchFilters] = useState<{
    title?: string;
    location?: string;
  }>({});

  const handleSearch = (title?: string, location?: string) => {
    setSearchFilters({ title, location });

    const element = document.getElementById("find-jobs");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <div className="w-full mt-0 mb-0">
        <div className="bg-[url('/mobile-responsive.png')] md:bg-[url('/Poster.png')] bg-cover bg-center min-h-screen max-w-7xl mx-auto">
          <div className="flex flex-col justify-start items-start space-y-4 sm:space-y-6 px-2 sm:px-4 md:px-8 lg:px-12 pt-4 sm:pt-8 md:pt-8 lg:pt-12 pb-16 sm:pb-20 md:pb-4 lg:pb-8">
            {heroContent}
            <SearchForm onSearch={handleSearch} />
            <div className="flex justify-center md:justify-start items-center gap-8 sm:gap-12 md:gap-16 lg:gap-20 text-notice font-bold mt-6 sm:mt-8 md:mt-10 w-full">
              <div className="flex flex-col gap-2 items-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">1000+</h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center">Active Jobs</p>
              </div>
              <div className="flex flex-col gap-2 items-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">300+</h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-center">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {promotionalContent}
      <div id="find-jobs" className="max-w-7xl mx-auto mb-8 px-4 sm:px-6 md:px-8">
        <h1 className="uppercase text-xl sm:text-2xl md:text-3xl text-notice font-bold mb-6 sm:mb-8">
          List All Job
        </h1>
        <JobSearch searchFilters={searchFilters}/>
      </div>
    </>
  );
}
