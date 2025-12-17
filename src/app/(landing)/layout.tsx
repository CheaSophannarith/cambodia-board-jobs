import type { Metadata } from "next";
import Header from "../../components/Landing/Header";
import Footer from "../../components/Landing/Footer";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "Cambodia Board Jobs",
  description: "Find your dream job in Cambodia with Cambodia Board Jobs.",
};

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="md:pt-20 flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  );
}
