import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { IdCardDocument } from "@/lib/id-card/id-card-pdf";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const [members, assocRow] = await Promise.all([
    prisma.member.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.setting.findUnique({ where: { key: "associationName" } }),
  ]);

  if (members.length === 0) return new NextResponse("No active members", { status: 404 });

  const validThrough = new Date();
  validThrough.setFullYear(validThrough.getFullYear() + 1);

  const stream = await renderToStream(
    <IdCardDocument
      associationName={assocRow?.value || ""}
      validThrough={validThrough.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      members={members.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        phone: m.phone,
        role: m.role,
        joinedAt: m.joinedAt.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
      }))}
    />,
  );

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="all-id-cards.pdf"',
    },
  });
}
