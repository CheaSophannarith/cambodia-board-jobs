import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex items-center gap-2 px-4 py-5 border-b border-gray-300">
      <SidebarTrigger className="mr-4" />
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 relative overflow-hidden">
            <Image
              src="/aba.jpg"
              alt="cbjobs-logo"
              width={40}
              height={40}
              className="flex-shrink-0 max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-sm font-light text-gray-500">Company</p>
            <h2 className="text-lg font-semibold">ABC Bank</h2>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Bell size={25} className="ml-auto text-notice" />
          <Button className="text-white bg-notice py-4 px-3 rounded-none">
            + Post a job
          </Button>
        </div>
      </div>
    </header>
  );
}
