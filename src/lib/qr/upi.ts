import QRCode from "qrcode";

/** Builds a UPI deep link: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...&tr=... */
export function buildUpiDeepLink(p: {
  upiId: string;
  payeeName: string;
  amount?: number;
  note?: string;
  ref?: string;
}): string {
  const params = new URLSearchParams();
  params.set("pa", p.upiId);
  params.set("pn", p.payeeName);
  if (p.amount && p.amount > 0) params.set("am", p.amount.toFixed(2));
  params.set("cu", "INR");
  if (p.note) params.set("tn", p.note.slice(0, 50)); // many UPI apps truncate ~50 chars
  if (p.ref) params.set("tr", p.ref);
  return `upi://pay?${params.toString()}`;
}

/** Generates a base64 PNG data URL for the given text (the UPI deep link). */
export async function generateQrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, { margin: 1, width: 260 });
}
