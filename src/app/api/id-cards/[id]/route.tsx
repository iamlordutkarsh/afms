import { NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { IdCardDocument } from "@/lib/id-card/id-card-pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const member = await prisma.member.findUnique({ where: { id } });
  if (!member) return new NextResponse("Not found", { status: 404 });

  const assocRow = await prisma.setting.findUnique({ where: { key: "associationName" } });

  const validThrough = new Date();
  validThrough.setFullYear(validThrough.getFullYear() + 1);

  const stream = await renderToStream(
    <IdCardDocument
      associationName={assocRow?.value || ""}
      validThrough={validThrough.toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
      members={[
        {
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          role: member.role,
          joinedAt: member.joinedAt.toLocaleDateString("en-IN", { year: "numeric", month: "short" }),
        },
      ]}
    />,
  );

  return new Response(stream as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="id-card-${member.name.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
