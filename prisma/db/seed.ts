import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Enable WAL mode (persists in the DB header — concurrent reads during writes).
  // $queryRaw (not $executeRaw) because the pragma returns a row.
  await prisma.$queryRawUnsafe("PRAGMA journal_mode=WAL;");

  // --- Super Admin (from env, with safe defaults) ---
  const email = (process.env.SUPERADMIN_EMAIL || "admin@anmol.local").trim().toLowerCase();
  const password = process.env.SUPERADMIN_PASSWORD || "ChangeMe@2026";
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.member.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", isActive: true },
    create: {
      email,
      name: "Super Admin",
      phone: "0000000000",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.log(`✔ Seeded super admin: ${email}`);

  // --- Default categories ---
  const categories = [
    { name: "Membership Fee", type: "INCOME" },
    { name: "Donation", type: "INCOME" },
    { name: "Special Fund", type: "INCOME" },
    { name: "Maintenance", type: "EXPENSE" },
    { name: "Event", type: "EXPENSE" },
    { name: "Stationery", type: "EXPENSE" },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { name_type: { name: c.name, type: c.type } },
      update: {},
      create: c,
    });
  }
  console.log(`✔ Seeded ${categories.length} categories`);

  // --- Default settings ---
  const settings = [
    { key: "associationName", value: "Our Association" },
    { key: "upiId", value: "" },
    { key: "upiPayeeName", value: "" },
    { key: "receiptPrefix", value: "RCT" },
    { key: "fiscalYearStartMonth", value: "4" }, // April
    { key: "lastReceiptSeq", value: "0" },
    { key: "lastReceiptYear", value: "" },
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }
  console.log(`✔ Seeded ${settings.length} settings`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
