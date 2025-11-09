import { getDetailUser } from "@/app/actions/user/getDetailUser";
import UserDetail from "@/components/Company/user/UserDetail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Key } from "lucide-react";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = String(id);

  const detailUser = await getDetailUser(userId);

  if (!detailUser) {
    return <div>User not found.</div>;
  }

  return (
    <div className="min-h-screen px-4 py-4">
      <div className="flex items-center mb-4 gap-4">
        <Button variant="outline" asChild className="border-primary">
          <Link href="/company-users">Back</Link>
        </Button>
      </div>
      <UserDetail user={detailUser} />
    </div>
  );
}
