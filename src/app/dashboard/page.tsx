"use client"

import Link from "next/link";
import { Upload, ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStats } from "@/features/dashboard/DashboardStats";
import { EmptyTenders } from "@/features/dashboard/EmptyTenders";
import { useDashboardData } from "@/hooks/useDashboardData";
import type { TenderSummary } from "@/types/dashboard";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function statusBadge(status: TenderSummary["status"]) {
    const map: Record<string, { label: string; cls: string }> = {
        EXTRACTED: { label: "Extracted", cls: "bg-green-500/20 text-green-400" },
        PROCESSING: { label: "Processing", cls: "bg-yellow-500/20 text-yellow-400" },
        UPLOADED: { label: "Uploaded", cls: "bg-blue-500/20 text-blue-400" },
        FAILED: { label: "Failed", cls: "bg-red-500/20 text-red-400" },
    };
    const s = map[status] ?? { label: status, cls: "bg-white/10 text-slate-400" };
    return (
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${s.cls}`}>
            {s.label}
        </span>
    );
}

function RecentTendersTable({ tenders }: { tenders: TenderSummary[] }) {
    const recent = tenders.slice(0, 5);
    return (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase border-b border-white/10">
                    <tr>
                        <th className="px-6 py-3">Tender</th>
                        <th className="px-6 py-3 hidden md:table-cell">Authority</th>
                        <th className="px-6 py-3 hidden lg:table-cell">Value</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 hidden md:table-cell">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {recent.map((t) => (
                        <tr
                            key={t.id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                            <td className="px-6 py-4">
                                <Link
                                    href={`/dashboard/tenders/${t.id}`}
                                    className="text-white font-medium hover:text-blue-400 transition-colors"
                                >
                                    {t.tenderNumber ?? t.fileName}
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-slate-400 hidden md:table-cell">
                                {t.issuingAuthority ?? "—"}
                            </td>
                            <td className="px-6 py-4 text-slate-400 hidden lg:table-cell">
                                {t.projectValue
                                    ? `₹${Number(t.projectValue).toLocaleString("en-IN")}`
                                    : "—"}
                            </td>
                            <td className="px-6 py-4">{statusBadge(t.status)}</td>
                            <td className="px-6 py-4 text-slate-500 hidden md:table-cell">
                                {formatDate(t.createdAt)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PageSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <Skeleton className="h-8 w-40 bg-white/10" />
                    <Skeleton className="h-4 w-72 mt-2 bg-white/10" />
                </div>
                <Skeleton className="h-10 w-44 rounded-lg bg-white/10" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card rounded-xl p-6">
                        <Skeleton className="h-4 w-24 mb-3 bg-white/10" />
                        <Skeleton className="h-8 w-12 mb-1 bg-white/10" />
                        <Skeleton className="h-3 w-28 bg-white/10" />
                    </div>
                ))}
            </div>
            <div>
                <Skeleton className="h-6 w-40 mb-4 bg-white/10" />
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full bg-white/10" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { tenders, stats, isLoading, isError } = useDashboardData();

    if (isLoading) return <PageSkeleton />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in-50">
                <div className="bg-red-500/20 p-4 rounded-full mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                    Something went wrong
                </h2>
                <p className="text-slate-400 max-w-sm text-center mb-6">
                    We couldn&apos;t load your dashboard data. Please check your connection
                    and try again.
                </p>
                <Button
                    className="btn-primary"
                    onClick={() => {
                        tenders.refetch();
                    }}
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            </div>
        );
    }

    const hasTenders = (tenders.data?.length ?? 0) > 0;

    return (
        <div className="space-y-8 animate-in fade-in-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 mt-1">
                        Overview of your tender analysis and eligibility status.
                    </p>
                </div>
                <Link href="/dashboard/tenders/upload">
                    <Button className="btn-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        Analyze New Tender
                    </Button>
                </Link>
            </div>

            <DashboardStats stats={stats} isLoading={false} isError={false} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        Recent Analysis
                    </h2>
                    {hasTenders && (
                        <Link href="/dashboard/tenders">
                            <Button variant="link" className="text-blue-400">
                                View All <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>

                {hasTenders ? (
                    <RecentTendersTable tenders={tenders.data!} />
                ) : (
                    <EmptyTenders />
                )}
            </div>
        </div>
    );
}
