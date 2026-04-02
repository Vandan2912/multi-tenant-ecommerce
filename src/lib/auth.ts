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
                const u = user as typeof user & {
                    tenantId: string;
                    role: string;
                    adminId: string;
                    isSuperAdmin?: boolean;
                };
                token.tenantId = u.tenantId;
                token.role = u.role;
                token.adminId = u.adminId;
                token.isSuperAdmin = u.isSuperAdmin ?? false;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.tenantId = token.tenantId as string;
            session.user.role = token.role as string;
            session.user.adminId = token.adminId as string;
            session.user.isSuperAdmin = token.isSuperAdmin as boolean;
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
                    email: string; password: string; domain: string;
                };
                if (!email || !password) return null;

                // ── Super admin path ───────────────────────────────
                if (email === process.env.SUPER_ADMIN_EMAIL) {
                    if (password !== process.env.SUPER_ADMIN_PASSWORD) return null;
                    return {
                        id: "superadmin",
                        email,
                        adminId: "superadmin",
                        tenantId: "",
                        role: "superadmin",
                        isSuperAdmin: true,
                    };
                }

                // ── Tenant admin path ──────────────────────────────
                if (!domain) return null;

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
                    isSuperAdmin: false,
                };
            },
        }),
    ],
});