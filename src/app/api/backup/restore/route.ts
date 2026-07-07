import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > 200 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 200MB)" }, { status: 400 });

  const backupDir = path.join(process.cwd(), "backups");
  await fs.mkdir(backupDir, { recursive: true });
  const filename = `restore-${Date.now()}.db`;
  const restorePath = path.join(backupDir, filename);
  await fs.writeFile(restorePath, Buffer.from(await file.arrayBuffer()));

  // Verify it's a valid SQLite file (magic header: "SQLite format 3\000")
  const header = Buffer.alloc(16);
  const handle = await fs.open(restorePath, "r");
  await handle.read(header, 0, 16, 0);
  await handle.close();
  if (header.toString("ascii", 0, 15) !== "SQLite format 3") {
    await fs.unlink(restorePath).catch(() => {});
    return NextResponse.json({ error: "Not a valid SQLite database file." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    savedAt: restorePath,
    instructions:
      "To apply: 1) Stop the server (Ctrl+C). 2) Replace prisma/dev.db with this file. 3) Restart with npm run dev.",
  });
}
