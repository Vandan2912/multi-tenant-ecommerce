import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user?.isSuperAdmin) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex">
            {/* Sidebar */}
            <aside className="w-52 shrink-0 border-r border-white/10 flex flex-col">
                <div className="px-5 py-5 border-b border-white/10">
                    <p className="font-bold text-sm text-white">⚡ Super Admin</p>
                    <p className="text-gray-500 text-xs mt-0.5">Platform control</p>
                </div>
                <nav className="flex-1 px-3 py-4 space-y-1">
                    {[
                        { href: "/superadmin", label: "All Tenants" },
                        { href: "/superadmin/new", label: "Onboard Client" },
                    ].map(({ href, label }) => (
                        <a key={href} href={href}
                            className="block px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                            {label}
                        </a>
                    ))}
                </nav>
                <div className="px-3 py-4 border-t border-white/10">
                    <a href="/admin/login"
                        className="block px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-white hover:bg-white/5">
                        Sign Out
                    </a>
                </div>
            </aside>

            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}