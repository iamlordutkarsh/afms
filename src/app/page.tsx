import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ADMIN_ROLES } from "@/lib/constants";

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = session.user.role;
  redirect(ADMIN_ROLES.includes(role) ? "/admin/dashboard" : "/member/dashboard");
}
