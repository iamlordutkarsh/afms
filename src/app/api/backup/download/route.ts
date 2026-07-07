import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const backupDir = path.join(process.cwd(), "backups");
  await fs.mkdir(backupDir, { recursive: true });
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
  const filename = `backup-${ts}.db`;
  // Escape single quotes for the SQLite literal (cwd should be safe, but be defensive)
  const backupPath = path.join(backupDir, filename).replace(/'/g, "''");

  // VACUUM INTO creates a consistent snapshot without locking writers out
  await prisma.$queryRawUnsafe(`VACUUM INTO '${backupPath}'`);

  const buf = await fs.readFile(path.join(backupDir, filename));
  await fs.unlink(path.join(backupDir, filename)).catch(() => {});

  return new Response(buf, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
