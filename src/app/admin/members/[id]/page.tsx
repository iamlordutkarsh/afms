import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditMemberForm } from "./edit-form";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) notFound();

  return (
    <EditMemberForm
      member={{
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        address: member.address,
        isActive: member.isActive,
      }}
    />
  );
}
