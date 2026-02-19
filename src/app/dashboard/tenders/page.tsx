"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Upload, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TendersFilters } from "@/features/tenders/TendersFilters";
import { TendersTable } from "@/features/tenders/TendersTable";
import { TendersPageSkeleton } from "@/features/tenders/TendersPageSkeleton";
import { useTendersPage } from "@/features/tenders/useTendersPage";

function TendersContent() {
    const {
        data,
        meta,
        isLoading,
        isError,
        refetch,
        filters,
        setFilter,
        sortBy,
        sortOrder,
        setSort,
        setPage,
    } = useTendersPage();

    if (isLoading) return <TendersPageSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in-50">
                <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    Failed to load tenders
                </h2>
                <p className="text-slate-400 max-w-sm text-center mb-6">
                    We couldn&apos;t fetch your tender data. Please check your connection
                    and try again.
                </p>
                <Button className="btn-primary" onClick={() => refetch()}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Tenders
                    </h1>
                    <p className="text-slate-400 mt-1">
                        View, filter, and manage all your uploaded tender documents.
                    </p>
                </div>
                <Link href="/dashboard/tenders/upload">
                    <Button className="btn-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        Analyze New Tender
                    </Button>
                </Link>
            </div>

            {/* Filters */}
            <TendersFilters filters={filters} onFilterChange={setFilter} />

            {/* Table */}
            <TendersTable
                data={data}
                meta={meta}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSort={setSort}
                onPageChange={setPage}
            />
        </div>
    );
}

export default function TendersPage() {
    return (
        <Suspense fallback={<TendersPageSkeleton />}>
            <TendersContent />
        </Suspense>
    );
}
