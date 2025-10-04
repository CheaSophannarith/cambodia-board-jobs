import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "../../components/Company/AppSidebar"
import { Header } from "../../components/Company/Header"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Company - Cambodia Board Jobs",
    description: "Company page for Cambodia Board Jobs.",
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <Header />
        {children}
      </main>
    </SidebarProvider>
  )
}