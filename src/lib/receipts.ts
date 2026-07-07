import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/** Prisma interactive-transaction client (the `tx` inside `$transaction`). */
export type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/** Fiscal year for a date, given the month (1–12) the FY starts. */
export function fiscalYear(date: Date, startMonth: number): number {
  const m = date.getMonth() + 1;
  return m >= startMonth ? date.getFullYear() : date.getFullYear() - 1;
}

async function getSetting(tx: TransactionClient, key: string, fallback: string): Promise<string> {
  const row = await tx.setting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

/**
 * Generates the next receipt number (`PREFIX-FY-NNNNNN`) and advances the
 * counter. MUST be called inside a `prisma.$transaction` so the sequence and
 * the income row are written atomically.
 */
export async function nextReceiptNo(tx: TransactionClient, date: Date): Promise<string> {
  const prefix = await getSetting(tx, "receiptPrefix", "RCT");
  const fyStart = Number(await getSetting(tx, "fiscalYearStartMonth", "4"));
  const fy = fiscalYear(date, fyStart);

  let seq = Number(await getSetting(tx, "lastReceiptSeq", "0"));
  const lastYearRaw = await getSetting(tx, "lastReceiptYear", "");
  const lastYear = lastYearRaw ? Number(lastYearRaw) : null;
  if (lastYear !== fy) seq = 0;
  seq += 1;

  await tx.setting.upsert({
    where: { key: "lastReceiptSeq" },
    update: { value: String(seq) },
    create: { key: "lastReceiptSeq", value: String(seq) },
  });
  await tx.setting.upsert({
    where: { key: "lastReceiptYear" },
    update: { value: String(fy) },
    create: { key: "lastReceiptYear", value: String(fy) },
  });

  return `${prefix}-${fy}-${String(seq).padStart(6, "0")}`;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(amount || 0);
}
