"use client";

import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchFormProps {
  onSearch?: (title?: string, location?: string) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = () => {
    onSearch?.(title || undefined, location || undefined);
  }

  return (
    <div className="bg-white px-4 py-6 md:py-8 w-full max-w-4xl mt-8 flex flex-col md:flex-row items-stretch gap-4 md:gap-3 shadow-lg">
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <Search size={24} className="text-black flex-shrink-0" />
        <Input
          type="text"
          className="border-0 border-b border-gray-300 rounded-none transition focus:outline-none focus:ring-0 focus-visible:ring-0 bg-transparent py-4 md:py-6 flex-1 placeholder:text-lg"
          placeholder="Job title or keyword"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <MapPin size={22} className="text-black flex-shrink-0" />
        <Select value={location} onValueChange={setLocation}>
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
            <SelectItem value="Phnom Penh">Phnom Penh</SelectItem>
            <SelectItem value="Siem Reap">Siem Reap</SelectItem>
            <SelectItem value="Preah Sihanouk">Preah Sihanouk</SelectItem>
            <SelectItem value="Kampong Cham">Kampong Cham</SelectItem>
            <SelectItem value="Battambang">Battambang</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button className="rounded-none bg-notice hover:bg-notice/90 font-bold py-4 md:py-6 flex-shrink-0 whitespace-nowrap px-6 transition-colors" onClick={handleSearch}>
        Search my job
      </Button>
    </div>
  );
}
