"use client";

import { useState } from "react";
import { FilterSidebar } from "./FilterSidebar";

type Props = React.ComponentProps<typeof FilterSidebar> & {
    activeCount: number;
};

export function FilterDrawer({ activeCount, ...sidebarProps }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
                </svg>
                Filters
                {activeCount > 0 && (
                    <span
                        className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: sidebarProps.primaryColor }}
                    >
                        {activeCount}
                    </span>
                )}
            </button>

            {/* Backdrop */}
            {open && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 md:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 left-0 w-72 bg-white z-50 shadow-2xl transition-transform duration-300 md:hidden overflow-y-auto ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-gray-800">Filters</h2>
                    <button onClick={() => setOpen(false)}
                        className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
                        ×
                    </button>
                </div>
                <div className="px-5 py-4">
                    <FilterSidebar {...sidebarProps} />
                </div>
                <div className="px-5 pb-6">
                    <button
                        onClick={() => setOpen(false)}
                        className="w-full py-3 text-white font-semibold rounded-xl text-sm"
                        style={{ backgroundColor: sidebarProps.primaryColor }}
                    >
                        Show Results
                    </button>
                </div>
            </div>
        </>
    );
}