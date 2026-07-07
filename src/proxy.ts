// Next.js 16: this file is `proxy.ts` (formerly middleware.ts).
import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = ["SUPER_ADMIN", "TREASURER", "SECRETARY"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isAdminArea = pathname.startsWith("/admin");
  const isMemberArea = pathname.startsWith("/member");

  if (isAdminArea) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (!ADMIN_ROLES.includes(token.role as string)) {
      const url = req.nextUrl.clone();
      url.pathname = "/member/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (isMemberArea && !token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/member/:path*"],
};
