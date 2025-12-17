import { Metadata } from "next";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/components/auth/login-form";

const metadata: Metadata = {
  title: "Login - Cambodia Board Jobs",
  description: "Create an account to access Cambodia Board Jobs.",
};

export default function Login() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:block md:w-[45%] min-h-screen">
        <Image
          src="/login_image.png"
          alt="Cambodia Board Jobs Logo"
          className="w-full h-full object-cover"
          width={800}
          height={800}
        />
      </div>
      <div className="w-full md:w-[55%] flex items-center justify-center px-4 py-8">
        <Tabs defaultValue="account" className="w-full max-w-[500px]">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-notice data-[state=active]:text-white rounded-none text-base sm:text-xl md:text-2xl py-3 sm:py-4 px-2 sm:px-4"
            >
              Job Seeker
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-notice data-[state=active]:text-white rounded-none text-base sm:text-xl md:text-2xl py-3 sm:py-4 px-2 sm:px-4"
            >
              Company
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <LoginForm userType="jobseeker" />
          </TabsContent>
          <TabsContent value="password">
            <LoginForm userType="company" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
