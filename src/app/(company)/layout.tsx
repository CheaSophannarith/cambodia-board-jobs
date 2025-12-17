"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "../../components/Company/AppSidebar";
import { Header } from "../../components/Company/Header";
import { AuthProvider } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full">
          <Header />
          {children}
        </main>
      </SidebarProvider>
    </AuthProvider>
  );
}
