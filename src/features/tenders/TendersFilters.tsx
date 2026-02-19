"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { TendersFilterParams } from "@/types/tenders";
import type { TenderStatus, VerdictStatus } from "@/types/index";

interface TendersFiltersProps {
    filters: TendersFilterParams;
    onFilterChange: (key: keyof TendersFilterParams, value: string | undefined) => void;
}

const STATUS_OPTIONS: { label: string; value: TenderStatus | "" }[] = [
    { label: "All Statuses", value: "" },
    { label: "Analyzed", value: "EXTRACTED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Uploaded", value: "UPLOADED" },
    { label: "Failed", value: "FAILED" },
];

const ELIGIBILITY_OPTIONS: { label: string; value: VerdictStatus | "" }[] = [
    { label: "All Eligibility", value: "" },
    { label: "Eligible", value: "ELIGIBLE" },
    { label: "Borderline", value: "BORDERLINE" },
    { label: "Ineligible", value: "INELIGIBLE" },
];

export function TendersFilters({ filters, onFilterChange }: TendersFiltersProps) {
    const [searchInput, setSearchInput] = useState(filters.search ?? "");

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange("search", searchInput || undefined);
        }, 300);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // Sync external filter changes
    useEffect(() => {
        setSearchInput(filters.search ?? "");
    }, [filters.search]);

    const hasActiveFilters =
        filters.status || filters.eligibility || filters.search || filters.dateFrom || filters.dateTo;

    const clearAll = useCallback(() => {
        onFilterChange("status", undefined);
        onFilterChange("eligibility", undefined);
        onFilterChange("search", undefined);
        onFilterChange("dateFrom", undefined);
        onFilterChange("dateTo", undefined);
        setSearchInput("");
    }, [onFilterChange]);

    return (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                        placeholder="Search tenders…"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10 bg-white/5 border-white/10 focus:border-blue-500/50 text-white placeholder:text-slate-500"
                    />
                </div>

                {/* Status */}
                <select
                    value={filters.status ?? ""}
                    onChange={(e) => onFilterChange("status", e.target.value || undefined)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none min-w-[150px]"
                >
                    {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Eligibility */}
                <select
                    value={filters.eligibility ?? ""}
                    onChange={(e) => onFilterChange("eligibility", e.target.value || undefined)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none min-w-[150px]"
                >
                    {ELIGIBILITY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Date From */}
                <input
                    type="date"
                    value={filters.dateFrom ?? ""}
                    onChange={(e) => onFilterChange("dateFrom", e.target.value || undefined)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer [color-scheme:dark]"
                    placeholder="From"
                />

                {/* Date To */}
                <input
                    type="date"
                    value={filters.dateTo ?? ""}
                    onChange={(e) => onFilterChange("dateTo", e.target.value || undefined)}
                    className="h-10 rounded-md border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer [color-scheme:dark]"
                    placeholder="To"
                />
            </div>

            {hasActiveFilters && (
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAll}
                        className="text-slate-400 hover:text-white text-xs gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
}
