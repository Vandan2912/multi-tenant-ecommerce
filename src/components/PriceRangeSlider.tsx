"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

type Props = {
    min: number;
    max: number;
    currentMin?: number;
    currentMax?: number;
    primaryColor: string;
};

export function PriceRangeSlider({
    min, max, currentMin, currentMax, primaryColor,
}: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useSearchParams();

    const [low, setLow] = useState(currentMin ?? min);
    const [high, setHigh] = useState(currentMax ?? max);

    useEffect(() => {
        setLow(currentMin ?? min);
        setHigh(currentMax ?? max);
    }, [currentMin, currentMax, min, max]);

    const apply = useCallback(() => {
        const p = new URLSearchParams(params.toString());
        if (low > min) p.set("min", String(low)); else p.delete("min");
        if (high < max) p.set("max", String(high)); else p.delete("max");
        p.delete("page");
        router.push(`${pathname}?${p.toString()}`);
    }, [low, high, min, max, params, pathname, router]);

    const reset = () => {
        setLow(min);
        setHigh(max);
        const p = new URLSearchParams(params.toString());
        p.delete("min");
        p.delete("max");
        p.delete("page");
        router.push(`${pathname}?${p.toString()}`);
    };

    const pct = (val: number) =>
        Math.round(((val - min) / (max - min)) * 100);

    const isFiltered = low > min || high < max;

    return (
        <div className="space-y-3">
            {/* Price display */}
            <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">
                    ₹{low.toLocaleString("en-IN")}
                </span>
                <span className="text-gray-400">—</span>
                <span className="font-semibold text-gray-700">
                    ₹{high.toLocaleString("en-IN")}
                </span>
            </div>

            {/* Dual range track */}
            <div className="relative h-1.5 bg-gray-200 rounded-full">
                {/* Active track */}
                <div
                    className="absolute h-full rounded-full"
                    style={{
                        left: `${pct(low)}%`,
                        right: `${100 - pct(high)}%`,
                        backgroundColor: primaryColor,
                    }}
                />

                {/* Low thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={Math.max(1, Math.floor((max - min) / 100))}
                    value={low}
                    onChange={(e) => {
                        const val = Math.min(Number(e.target.value), high - 1);
                        setLow(val);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                    style={{ zIndex: low > max - (max - min) * 0.1 ? 5 : 3 }}
                />

                {/* High thumb */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={Math.max(1, Math.floor((max - min) / 100))}
                    value={high}
                    onChange={(e) => {
                        const val = Math.max(Number(e.target.value), low + 1);
                        setHigh(val);
                    }}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
                    style={{ zIndex: 4 }}
                />

                {/* Visible thumb dots */}
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow pointer-events-none"
                    style={{
                        left: `calc(${pct(low)}% - 8px)`,
                        borderColor: primaryColor,
                    }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 shadow pointer-events-none"
                    style={{
                        left: `calc(${pct(high)}% - 8px)`,
                        borderColor: primaryColor,
                    }}
                />
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Min (₹)</label>
                    <input
                        type="number"
                        min={min}
                        max={high - 1}
                        value={low}
                        onChange={(e) => setLow(Math.max(min, Math.min(Number(e.target.value), high - 1)))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Max (₹)</label>
                    <input
                        type="number"
                        min={low + 1}
                        max={max}
                        value={high}
                        onChange={(e) => setHigh(Math.min(max, Math.max(Number(e.target.value), low + 1)))}
                        className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1"
                    />
                </div>
            </div>

            {/* Apply + reset */}
            <div className="flex gap-2">
                <button
                    onClick={apply}
                    className="flex-1 py-1.5 text-xs font-semibold text-white rounded-lg transition-opacity hover:opacity-90"
                    style={{ backgroundColor: primaryColor }}
                >
                    Apply
                </button>
                {isFiltered && (
                    <button
                        onClick={reset}
                        className="px-3 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}