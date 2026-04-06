"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PriceRangeSlider } from "./PriceRangeSlider";

type Category = {
    id: string;
    name: string;
    slug: string;
    children: { id: string; name: string; slug: string }[];
};

type Brand = {
    id: string;
    name: string;
    slug: string;
};

type Props = {
    categoryTree: Category[];
    brands: Brand[];
    priceRange: { min: number; max: number };
    primaryColor: string;
    // current active filters
    activeCategory?: string;
    activeBrands: string[];
    activeMin?: number;
    activeMax?: number;
    activeInStock: boolean;
};

export function FilterSidebar({
    categoryTree, brands, priceRange, primaryColor,
    activeCategory, activeBrands, activeMin, activeMax, activeInStock,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    function updateParam(key: string, value: string | null) {
        const p = new URLSearchParams(params.toString());
        if (value === null) p.delete(key);
        else p.set(key, value);
        p.delete("page");
        router.push(`${pathname}?${p.toString()}`);
    }

    function toggleBrand(slug: string) {
        const current = new Set(activeBrands);
        if (current.has(slug)) current.delete(slug);
        else current.add(slug);

        const p = new URLSearchParams(params.toString());
        if (current.size > 0) p.set("brands", Array.from(current).join(","));
        else p.delete("brands");
        p.delete("page");
        router.push(`${pathname}?${p.toString()}`);
    }

    function toggleInStock() {
        updateParam("instock", activeInStock ? null : "true");
    }

    const hasFilters =
        activeCategory || activeBrands.length > 0 ||
        activeMin !== undefined || activeMax !== undefined || activeInStock;

    function clearAll() {
        router.push(pathname);
    }

    return (
        <div className="space-y-6">

            {/* Clear all */}
            {hasFilters && (
                <button onClick={clearAll}
                    className="w-full text-xs text-red-500 hover:text-red-700 font-medium text-left">
                    × Clear all filters
                </button>
            )}

            {/* Categories */}
            {categoryTree.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Categories
                    </p>
                    <ul className="space-y-0.5">
                        <li>
                            <button
                                onClick={() => updateParam("category", null)}
                                className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${!activeCategory
                                        ? "font-semibold text-white"
                                        : "text-gray-600 hover:bg-gray-100"
                                    }`}
                                style={!activeCategory ? { backgroundColor: primaryColor } : {}}
                            >
                                All
                            </button>
                        </li>
                        {categoryTree.map((cat) => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => updateParam("category", cat.slug)}
                                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors font-medium ${activeCategory === cat.slug
                                            ? "text-white"
                                            : "text-gray-700 hover:bg-gray-100"
                                        }`}
                                    style={activeCategory === cat.slug ? { backgroundColor: primaryColor } : {}}
                                >
                                    {cat.name}
                                </button>
                                {cat.children.length > 0 && (
                                    <ul className="ml-3 mt-0.5 space-y-0.5">
                                        {cat.children.map((sub) => (
                                            <li key={sub.id}>
                                                <button
                                                    onClick={() => updateParam("category", sub.slug)}
                                                    className={`w-full text-left text-sm px-3 py-1.5 rounded-lg transition-colors ${activeCategory === sub.slug
                                                            ? "text-white"
                                                            : "text-gray-500 hover:bg-gray-100"
                                                        }`}
                                                    style={activeCategory === sub.slug ? { backgroundColor: primaryColor } : {}}
                                                >
                                                    {sub.name}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Price range */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Price Range
                </p>
                <PriceRangeSlider
                    min={priceRange.min}
                    max={priceRange.max}
                    currentMin={activeMin}
                    currentMax={activeMax}
                    primaryColor={primaryColor}
                />
            </div>

            {/* Brands */}
            {brands.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Brands
                    </p>
                    <ul className="space-y-1">
                        {brands.map((b) => {
                            const checked = activeBrands.includes(b.slug);
                            return (
                                <li key={b.id}>
                                    <button
                                        onClick={() => toggleBrand(b.slug)}
                                        className="w-full flex items-center gap-2.5 text-sm text-left px-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <span
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "border-transparent" : "border-gray-300"
                                                }`}
                                            style={checked ? { backgroundColor: primaryColor } : {}}
                                        >
                                            {checked && (
                                                <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                                                    <path d="M8.5 2L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5"
                                                        strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                                </svg>
                                            )}
                                        </span>
                                        <span className={checked ? "font-semibold text-gray-800" : "text-gray-600"}>
                                            {b.name}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* In stock toggle */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Availability
                </p>
                <button
                    onClick={toggleInStock}
                    className="flex items-center gap-2.5 text-sm text-left px-1 py-1 rounded-lg hover:bg-gray-50 w-full"
                >
                    <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${activeInStock ? "border-transparent" : "border-gray-300"
                            }`}
                        style={activeInStock ? { backgroundColor: primaryColor } : {}}
                    >
                        {activeInStock && (
                            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="currentColor">
                                <path d="M8.5 2L4 7.5 1.5 5" stroke="currentColor" strokeWidth="1.5"
                                    strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            </svg>
                        )}
                    </span>
                    <span className={activeInStock ? "font-semibold text-gray-800" : "text-gray-600"}>
                        In stock only
                    </span>
                </button>
            </div>
        </div>
    );
}