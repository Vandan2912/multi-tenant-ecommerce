"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

const OPTIONS = [
    { value: "newest", label: "Newest First" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
    { value: "name_asc", label: "Name: A to Z" },
];

export function SortSelect({ current }: { current?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    function handleChange(val: string) {
        const p = new URLSearchParams(params.toString());
        if (val === "newest") p.delete("sort");
        else p.set("sort", val);
        p.delete("page");
        router.push(`${pathname}?${p.toString()}`);
    }

    return (
        <select
            value={current ?? "newest"}
            onChange={(e) => handleChange(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200 bg-white cursor-pointer"
        >
            {OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
            ))}
        </select>
    );
}