import { Input } from "@/components/ui/input";
import type { Metadata } from "next";
import Image from "next/image";
import { Search } from "lucide-react";
import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Cambodia Board Jobs",
  description: "Find your dream job in Cambodia with Cambodia Board Jobs.",
};

export default function Home() {
  return (
    <div>
      <div className="bg-[url('/Poster.png')] bg-cover bg-center h-screen max-w-7xl mx-auto mt-3">
        <div className="flex flex-col justify-center items-start space-y-4 px-4 py-16">
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
          <div className="bg-white px-4 py-6 md:py-8 w-full max-w-4xl mt-8 flex flex-col md:flex-row items-stretch gap-4 md:gap-3 shadow-lg">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Search size={24} className="text-black flex-shrink-0" />
              <Input
                type="text"
                className="border-0 border-b border-gray-300 rounded-none transition focus:outline-none focus:ring-0 focus-visible:ring-0 bg-transparent py-4 md:py-6 flex-1 placeholder:text-lg"
                placeholder="Job title or keyword"
              />
            </div>
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <MapPin size={22} className="text-black flex-shrink-0" />
              <Select>
                <SelectTrigger className="w-full border-0 rounded-none focus:outline-none focus:ring-0 focus-visible:ring-0 bg-transparent py-4 md:py-6 border-b border-gray-300 text-lg">
                  <SelectValue
                    placeholder="Location"
                    className="placeholder:text-lg text-gray-500"
                  />
                </SelectTrigger>
                <SelectContent
                  align="start"
                  side="bottom"
                  className="w-[var(--radix-select-trigger-width)]"
                >
                  <SelectItem value="phnom-penh">Phnom Penh</SelectItem>
                  <SelectItem value="siem-reap">Siem Reap</SelectItem>
                  <SelectItem value="preah-sihanouk">Preah Sihanouk</SelectItem>
                  <SelectItem value="kampong-cham">Kampong Cham</SelectItem>
                  <SelectItem value="battambang">Battambang</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-none bg-notice hover:bg-notice/90 font-bold py-4 md:py-6 flex-shrink-0 whitespace-nowrap px-6 transition-colors">
              Search my job
            </Button>
          </div>
          <div className="flex space-x-20 text-notice font-bold text-4xl mt-20 px-20">
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
    </div>
  );
}
