import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
    session: { strategy: "jwt" },
    pages: {
        signIn: "/admin/login",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.tenantId = (user as any).tenantId;
                token.role = (user as any).role;
                token.adminId = (user as any).adminId;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.tenantId = token.tenantId as string;
                session.user.role = token.role as string;
                session.user.adminId = token.adminId as string;
            }
            return session;
        },
    },
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                domain: { label: "Domain", type: "text" },
            },
            async authorize(credentials) {
                const { email, password, domain } = credentials as {
                    email: string;
                    password: string;
                    domain: string;
                };

                if (!email || !password || !domain) return null;

                const tenant = await db.tenant.findUnique({ where: { domain } });
                if (!tenant || !tenant.is_active) return null;

                const admin = await db.adminUser.findFirst({
                    where: { tenant_id: tenant.id, email },
                });

                if (!admin) return null;

                const valid = await bcrypt.compare(password, admin.password_hash);
                if (!valid) return null;

                return {
                    id: admin.id,
                    email: admin.email,
                    adminId: admin.id,
                    tenantId: tenant.id,
                    role: admin.role,
                };
            },
        }),
    ],
});