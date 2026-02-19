"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TendersPageSkeleton() {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-32 bg-white/10" />
                    <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
                </div>
                <Skeleton className="h-10 w-44 rounded-lg bg-white/10" />
            </div>

            {/* Filter bar */}
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <Skeleton className="h-10 flex-1 bg-white/10 rounded-md" />
                    <Skeleton className="h-10 w-[150px] bg-white/10 rounded-md" />
                    <Skeleton className="h-10 w-[150px] bg-white/10 rounded-md" />
                    <Skeleton className="h-10 w-[140px] bg-white/10 rounded-md" />
                    <Skeleton className="h-10 w-[140px] bg-white/10 rounded-md" />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                {/* Header row */}
                <div className="border-b border-white/10 px-5 py-3.5 flex gap-8">
                    {[120, 140, 100, 100, 80, 70, 80, 60].map((w, i) => (
                        <Skeleton key={i} className="h-4 bg-white/10 rounded" style={{ width: w }} />
                    ))}
                </div>
                {/* Body rows */}
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        className="border-b border-white/5 px-5 py-4 flex items-center gap-8"
                    >
                        <Skeleton className="h-5 w-[160px] bg-white/10" />
                        <Skeleton className="h-5 w-[120px] bg-white/10 hidden lg:block" />
                        <Skeleton className="h-5 w-[90px] bg-white/10 hidden lg:block" />
                        <Skeleton className="h-5 w-[90px] bg-white/10 hidden lg:block" />
                        <Skeleton className="h-5 w-[70px] bg-white/10" />
                        <Skeleton className="h-5 w-[60px] bg-white/10 hidden lg:block" />
                        <Skeleton className="h-5 w-[70px] bg-white/10" />
                        <Skeleton className="h-5 w-[50px] bg-white/10" />
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-2">
                <Skeleton className="h-4 w-40 bg-white/10" />
                <div className="flex gap-2">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-8 w-8 bg-white/10 rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
}
