"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { getCompanies } from "@/app/actions/landingpage/getCompanies";

const images = [
  {
    src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=600&fit=crop&q=80",
    alt: "Modern office building",
  },
  {
    src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1400&h=600&fit=crop&q=80",
    alt: "Team collaboration",
  },
  {
    src: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1400&h=600&fit=crop&q=80",
    alt: "Business professionals",
  },
];

export default function Companies() {
  const [api, setApi] = useState<CarouselApi>();
  const [companies, setCompanies] = useState<any[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) return;

    const intervalId = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [api]);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const data = await getCompanies();
      setCompanies(data);
      setFilteredCompanies(data);
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) =>
        company.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  return (
    <div className="w-full">
      {/* Carousel Section */}
      <div className="w-full pb-8">
        <Carousel
          setApi={setApi}
          className="w-full"
          opts={{
            align: "center",
            loop: true,
          }}
        >
          <CarouselContent>
            {images.map((image, index) => (
              <CarouselItem key={index}>
                <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden bg-gray-100">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    sizes="100vw"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
      </div>

      {/* Companies Listing Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Browse Companies</h1>
          <p className="text-gray-600 mb-6">
            Discover amazing companies hiring in Cambodia
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-notice focus:border-transparent"
            />
          </div>
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="border border-gray-200 p-6">
                  <div className="w-full h-32 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCompanies.map((company) => (
              <Link key={company.id} href={`/companies/${company.id}`}>
                <div className="border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
                  <div className="relative w-full h-32 mb-4 flex items-center justify-center">
                    <Image
                      src={company.logo_url || "/placeholder-company.png"}
                      alt={company.company_name}
                      width={120}
                      height={120}
                      className="object-contain"
                    />
                  </div>
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                    {company.company_name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 flex-1">
                    {company.industry || "No industry available"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No companies found</p>
            <p className="text-gray-400 text-sm mt-2">
              Try adjusting your search query
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
