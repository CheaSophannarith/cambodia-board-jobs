import UserProfileForm from "@/components/Company/userProfile/UserProfileForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserProfile } from "@/app/actions/profile/userProfile/userProfile";


export default async function UserProfilePage() {

  const userProfile = await getUserProfile();

  return (
    <div className="min-h-screen px-4 py-4">
      {/* <UserDetail user={detailUser} /> */}
      <UserProfileForm userProfile={userProfile}/>
    </div>
  );
}
