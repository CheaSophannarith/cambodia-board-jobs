"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface SeekerApplicationProps {
  userType: string;
  displayName: string;
}

const locations = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampong Cham",
  "Kampong Chhnang",
  "Kampong Speu",
  "Kandal",
  "Takeo",
  "Prey Veng",
  "Svay Rieng",
  "Kampot",
  "Pursat",
  "Banteay Meanchey",
  "Oddar Meanchey",
  "Preah Vihear",
  "Ratanakiri",
  "Stung Treng",
  "Koh Kong",
  "Mondulkiri",
  "Kratie",
  "Tbong Khmum",
  "Kep",
  "Pailin",
  "Kompong Thom",
];

export default function SeekerApplication({
  userType,
  displayName,
}: SeekerApplicationProps) {
  const [name, setName] = useState(displayName);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (formData: FormData) => {
    return;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w">
        <h1 className="text-3xl font-bold text-notice mt-12">
          Create your profile as {userType}
        </h1>
        <form action={handleSubmit} className="space-y-4 mt-12">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full h-auto px-4 py-5 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-notice rounded-none">
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px] overflow-y-auto">
                {locations.map((location) => (
                  <SelectItem
                    key={location}
                    value={location.toLowerCase().replace(/\s+/g, "-")}
                  >
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>
      </div>
    </div>
  );
}
