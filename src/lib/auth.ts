import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/constants";

// Fly.io / HTTPS: let NextAuth auto-detect secure cookies from NEXTAUTH_URL.
// For LAN-only HTTP deployment (no HTTPS), uncomment the cookies override below.
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";
        if (!email || !password) return null;
        const member = await prisma.member.findUnique({ where: { email } });
        if (!member || !member.isActive) return null;
        const ok = await bcrypt.compare(password, member.passwordHash);
        if (!ok) return null;
        return { id: member.id, email: member.email, name: member.name, role: member.role as Role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
};

/** Read the session in Server Components / Route Handlers (Next 16 async cookies). */
export async function auth() {
  return getServerSession(authOptions);
}
