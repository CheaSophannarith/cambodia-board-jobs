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
      <div className="bg-[url('/Poster.png')] bg-cover bg-center h-screen max-w-7xl mx-auto mt-3">
        <div className="flex flex-col justify-center items-start space-y-4 px-4 py-16">
          {heroContent}
          <SearchForm onSearch={handleSearch} />
          <div className="flex justify-center space-x-20 text-notice font-bold text-4xl mt-20 px-20">
            <div className="flex flex-col gap-2 items-center">
              <h1>Active Jobs</h1>
              <p>1000+</p>
            </div>
            <div className="flex flex-col gap-2 items-center">
              <h1>Companies</h1>
              <p>300+</p>
            </div>
          </div>
        </div>
      </div>
      {promotionalContent}
      <div id="find-jobs" className="max-w-7xl mx-auto mb-8 px-4">
        <h1 className="uppercase text-2xl text-notice font-bold mb-8">
          List All Job
        </h1>
        <JobSearch searchFilters={searchFilters} />
      </div>
    </>
  );
}
