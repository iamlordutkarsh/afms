import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const member = await prisma.member.findUnique({ where: { id: session.user.id } });
  if (!member) redirect("/login");

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Profile</h1>
      <ProfileForm
        member={{
          name: member.name,
          email: member.email,
          phone: member.phone,
          address: member.address ?? "",
        }}
      />
      <ChangePasswordForm />
    </div>
  );
}
