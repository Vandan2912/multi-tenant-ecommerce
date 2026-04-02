"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const router = useRouter();
    const [fields, setFields] = useState({
        email: "", password: "", domain: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Pre-fill domain from current hostname
        setFields((f) => ({ ...f, domain: window.location.host }));
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await signIn("credentials", {
            email: fields.email,
            password: fields.password,
            domain: fields.domain,
            redirect: false,
        });

        setLoading(false);

        if (res?.error) {
            setError("Invalid email or password");
        } else {
            router.push("/admin");
            router.refresh();
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-sm text-gray-400 mt-1">Sign in to manage your store</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={fields.email}
                            onChange={(e) => setFields((f) => ({ ...f, email: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="admin@yourstore.com"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={fields.password}
                            onChange={(e) => setFields((f) => ({ ...f, password: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                            Store Domain
                        </label>
                        <input
                            type="text"
                            required
                            value={fields.domain}
                            onChange={(e) => setFields((f) => ({ ...f, domain: e.target.value }))}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 font-mono"
                            placeholder="localhost:3000"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Auto-filled from your current URL
                        </p>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}