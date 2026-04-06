"use client";

import {
    useState, useEffect, useRef, useCallback,
} from "react";
import { useRouter } from "next/navigation";

type Result = {
    id: string;
    name: string;
    brand: string | null;
    category: string | null;
    image: string | null;
    price: number | null;
};

type Props = {
    primaryColor: string;
};

export function SearchModal({ primaryColor }: Props) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);
    const [active, setActive] = useState(-1);

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();
    const router = useRouter();

    // Open with Cmd+K / Ctrl+K
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen((o) => !o);
            }
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
            setResults([]);
            setActive(-1);
        }
    }, [open]);

    // Debounced search
    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setLoading(false);
        setActive(-1);
    }, []);

    function handleChange(val: string) {
        setQuery(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 250);
    }

    // Keyboard navigation
    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, -1));
        } else if (e.key === "Enter") {
            if (active >= 0 && results[active]) {
                navigate(results[active].id);
            } else if (query.trim()) {
                navigateSearch();
            }
        }
    }

    function navigate(productId: string) {
        setOpen(false);
        router.push(`/products/${productId}`);
    }

    function navigateSearch() {
        setOpen(false);
        router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white/80 hover:text-white text-sm"
                aria-label="Search"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline text-xs bg-white/10 px-1.5 py-0.5 rounded font-mono">
                    ⌘K
                </kbd>
            </button>
        );
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div
                className="fixed top-[10vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4"
                onClick={() => setOpen(false)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Search input */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                        <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => handleChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search products, brands, categories..."
                            className="flex-1 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                        />
                        {loading && (
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin shrink-0" />
                        )}
                        <kbd
                            onClick={() => setOpen(false)}
                            className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                        >
                            Esc
                        </kbd>
                    </div>

                    {/* Results */}
                    {results.length > 0 && (
                        <ul className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
                            {results.map((r, i) => (
                                <li key={r.id}>
                                    <button
                                        onClick={() => navigate(r.id)}
                                        onMouseEnter={() => setActive(i)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${active === i ? "bg-gray-50" : "hover:bg-gray-50"
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                                            {r.image ? (
                                                <img src={r.image} alt={r.name}
                                                    className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">
                                                    📦
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{r.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {[r.brand, r.category].filter(Boolean).join(" · ")}
                                            </p>
                                        </div>

                                        {/* Price */}
                                        {r.price !== null && (
                                            <p className="text-sm font-bold shrink-0"
                                                style={{ color: primaryColor }}>
                                                ₹{r.price.toLocaleString("en-IN")}
                                            </p>
                                        )}

                                        {/* Active indicator */}
                                        {active === i && (
                                            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                    d="M9 5l7 7-7 7" />
                                            </svg>
                                        )}
                                    </button>
                                </li>
                            ))}

                            {/* View all results */}
                            {query.trim() && (
                                <li>
                                    <button
                                        onClick={navigateSearch}
                                        className="w-full px-4 py-3 text-sm text-left transition-colors hover:bg-gray-50 flex items-center justify-between"
                                        style={{ color: primaryColor }}
                                    >
                                        <span>
                                            View all results for{" "}
                                            <span className="font-semibold">"{query}"</span>
                                        </span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                                d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </li>
                            )}
                        </ul>
                    )}

                    {/* Empty state */}
                    {!loading && query.trim().length >= 2 && results.length === 0 && (
                        <div className="px-4 py-10 text-center text-gray-400">
                            <p className="text-2xl mb-2">🔍</p>
                            <p className="text-sm font-medium">No results for "{query}"</p>
                            <p className="text-xs mt-1">Try a different keyword</p>
                        </div>
                    )}

                    {/* Initial state */}
                    {query.trim().length === 0 && (
                        <div className="px-4 py-6 text-center text-gray-400">
                            <p className="text-sm">Type to search products, brands or categories</p>
                            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                                <span className="flex items-center gap-1">
                                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">↑↓</kbd>
                                    Navigate
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">↵</kbd>
                                    Select
                                </span>
                                <span className="flex items-center gap-1">
                                    <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">Esc</kbd>
                                    Close
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}