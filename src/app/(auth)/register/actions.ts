"use server";

import { prisma } from "@/lib/prisma";

export async function createRegistrationRequest(
  _prev: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const note = String(formData.get("note") || "").trim();

  if (!name || !email || !phone)
    return { ok: false, error: "Name, email, and phone are required." };

  // Block if already a member
  const existingMember = await prisma.member.findUnique({ where: { email } });
  if (existingMember)
    return { ok: false, error: "An account with this email already exists. Try logging in." };

  // Check existing request
  const existingReq = await prisma.registrationRequest.findUnique({ where: { email } });
  if (existingReq) {
    if (existingReq.status === "PENDING")
      return { ok: false, error: "You've already submitted a request. Please wait for approval." };
    // Re-apply after rejection
    await prisma.registrationRequest.update({
      where: { email },
      data: { name, phone, address: address || undefined, note: note || undefined, status: "PENDING" },
    });
    return { ok: true };
  }

  await prisma.registrationRequest.create({
    data: { name, email, phone, address: address || undefined, note: note || undefined },
  });
  return { ok: true };
}
