import { Metadata } from "next";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignupForm } from "@/components/auth/signup-form";

const metadata: Metadata = {
  title: "Sign Up - Cambodia Board Jobs",
  description: "Create an account to access Cambodia Board Jobs.",
};

export default function SignUp() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="w-[45%] min-h-screen">
        <Image
          src="/login_image.png"
          alt="Cambodia Board Jobs Logo"
          className="w-full h-full object-cover"
          width={800}
          height={800}
        />
      </div>
      <div className="w-[55%] flex items-center justify-center">
        <Tabs defaultValue="account" className="w-[500px]">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger
              value="account"
              className="data-[state=active]:bg-notice data-[state=active]:text-white rounded-none text-2xl py-4 px-4"
            >
              Job Seeker
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="data-[state=active]:bg-notice data-[state=active]:text-white rounded-none text-2xl py-4 px-4"
            >
              Company
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <SignupForm userType="jobseeker" />
          </TabsContent>
          <TabsContent value="password">
            <SignupForm userType="company" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
