import { z } from "zod";
import { ROLES } from "@/lib/constants";

const roleValues = ROLES as readonly string[];

export const memberCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().min(3, "Email is required").transform((s) => s.toLowerCase()),
  phone: z.string().trim().min(4, "Phone is required"),
  role: z.string().refine((v) => roleValues.includes(v), "Invalid role"),
  address: z.string().trim().optional(),
});

export const memberUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  phone: z.string().trim().min(4).optional(),
  role: z.string().refine((v) => roleValues.includes(v)).optional(),
  address: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});

export const settingsSchema = z.object({
  associationName: z.string().trim().min(1, "Association name is required"),
  upiId: z.string().trim().optional(),
  upiPayeeName: z.string().trim().optional(),
  receiptPrefix: z.string().trim().min(1).max(8),
  fiscalYearStartMonth: z.coerce.number().int().min(1).max(12),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().refine((v) => v === "INCOME" || v === "EXPENSE", "Invalid type"),
  description: z.string().trim().optional(),
});

export type ActionResult = { ok: boolean; error?: string; tempPassword?: string; name?: string; receiptNo?: string };

export const transactionSchema = z.object({
  type: z.string().refine((v) => v === "INCOME" || v === "EXPENSE", "Invalid type"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  date: z.string().min(1, "Date is required"),
  method: z
    .string()
    .refine((v) => ["", "CASH", "UPI", "BANK_TRANSFER", "CHEQUE"].includes(v))
    .optional(),
  categoryId: z.string().optional(),
  memberId: z.string().optional(),
  note: z.string().optional(),
  utrNo: z.string().optional(),
  billUrl: z.string().optional(),
  payee: z.string().optional(),
});
