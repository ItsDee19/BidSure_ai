"use client";

import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { TenderRow, TenderSortField, SortOrder, PaginationMeta } from "@/types/tenders";

// ── helpers ───────────────────────────────────────────────────────
function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCurrency(value: number | null) {
    if (value === null || value === undefined) return "—";
    return `₹${Number(value).toLocaleString("en-IN")}`;
}

// ── badge configs ─────────────────────────────────────────────────
const VERDICT_BADGE: Record<string, { label: string; cls: string }> = {
    ELIGIBLE: { label: "Eligible", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    BORDERLINE: { label: "Borderline", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    INELIGIBLE: { label: "Ineligible", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const RISK_BADGE: Record<string, { label: string; cls: string }> = {
    HIGH: { label: "High", cls: "bg-red-500/20 text-red-400 border-red-500/30" },
    MEDIUM: { label: "Medium", cls: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    LOW: { label: "Low", cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    NONE: { label: "None", cls: "bg-slate-500/20 text-slate-400 border-slate-500/30" },
};

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
    EXTRACTED: { label: "Analyzed", cls: "bg-green-500/20 text-green-400" },
    PROCESSING: { label: "Processing…", cls: "bg-yellow-500/20 text-yellow-400" },
    UPLOADED: { label: "Pending", cls: "bg-blue-500/20 text-blue-400" },
    FAILED: { label: "Failed", cls: "bg-red-500/20 text-red-400" },
};

// ── column definition ─────────────────────────────────────────────
interface Column {
    key: string;
    label: string;
    sortable?: boolean;
    sortField?: TenderSortField;
    hideOnMobile?: boolean;
}

const COLUMNS: Column[] = [
    { key: "name", label: "Tender Name", sortable: true, sortField: "tenderNumber" },
    { key: "authority", label: "Issuing Authority", sortable: true, sortField: "issuingAuthority", hideOnMobile: true },
    { key: "value", label: "Project Value", sortable: true, sortField: "projectValue", hideOnMobile: true },
    { key: "deadline", label: "Submission Date", sortable: true, sortField: "bidDeadline", hideOnMobile: true },
    { key: "eligibility", label: "Eligibility", sortable: false },
    { key: "risk", label: "Risk Level", sortable: false, hideOnMobile: true },
    { key: "status", label: "Status", sortable: true, sortField: "status" },
    { key: "action", label: "", sortable: false },
];

// ── props ─────────────────────────────────────────────────────────
interface TendersTableProps {
    data: TenderRow[];
    meta: PaginationMeta;
    sortBy: TenderSortField;
    sortOrder: SortOrder;
    onSort: (field: TenderSortField) => void;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

function SortIcon({ field, currentSortBy, currentSortOrder }: {
    field: TenderSortField;
    currentSortBy: TenderSortField;
    currentSortOrder: SortOrder;
}) {
    if (field !== currentSortBy) return <ArrowUpDown className="w-3 h-3 text-slate-600" />;
    return currentSortOrder === "asc"
        ? <ArrowUp className="w-3 h-3 text-blue-400" />
        : <ArrowDown className="w-3 h-3 text-blue-400" />;
}

export function TendersTable({
    data,
    meta,
    sortBy,
    sortOrder,
    onSort,
    onPageChange,
    isLoading,
}: TendersTableProps) {
    const router = useRouter();

    if (data.length === 0 && !isLoading) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-12 text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Eye className="w-7 h-7 text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No tenders found</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                    Try adjusting your filters or upload a new tender for analysis.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-400 uppercase border-b border-white/10 bg-white/[0.02]">
                            <tr>
                                {COLUMNS.map((col) => (
                                    <th
                                        key={col.key}
                                        className={cn(
                                            "px-5 py-3.5 whitespace-nowrap",
                                            col.hideOnMobile && "hidden lg:table-cell",
                                            col.sortable && "cursor-pointer select-none hover:text-slate-200 transition-colors",
                                        )}
                                        onClick={col.sortable && col.sortField ? () => onSort(col.sortField!) : undefined}
                                    >
                                        <span className="flex items-center gap-1.5">
                                            {col.label}
                                            {col.sortable && col.sortField && (
                                                <SortIcon
                                                    field={col.sortField}
                                                    currentSortBy={sortBy}
                                                    currentSortOrder={sortOrder}
                                                />
                                            )}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={cn(isLoading && "opacity-50 pointer-events-none")}>
                            {data.map((tender) => {
                                const statusCfg = STATUS_CONFIG[tender.status] ?? { label: tender.status, cls: "bg-white/10 text-slate-400" };
                                const verdictCfg = tender.eligibilityVerdict ? VERDICT_BADGE[tender.eligibilityVerdict] : null;
                                const riskCfg = RISK_BADGE[tender.riskLevel];
                                const isProcessing = tender.status === "PROCESSING" || tender.status === "UPLOADED";

                                return (
                                    <tr
                                        key={tender.id}
                                        className="border-b border-white/5 hover:bg-white/[0.04] transition-colors group"
                                    >
                                        {/* Tender Name */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium truncate max-w-[200px]">
                                                    {tender.tenderNumber ?? tender.fileName}
                                                </span>
                                                {isProcessing && (
                                                    <Loader2 className="w-3.5 h-3.5 text-yellow-400 animate-spin flex-shrink-0" />
                                                )}
                                            </div>
                                        </td>

                                        {/* Issuing Authority */}
                                        <td className="px-5 py-4 text-slate-400 hidden lg:table-cell truncate max-w-[180px]">
                                            {tender.issuingAuthority ?? "—"}
                                        </td>

                                        {/* Project Value */}
                                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell font-mono text-xs">
                                            {formatCurrency(tender.projectValue)}
                                        </td>

                                        {/* Submission Date */}
                                        <td className="px-5 py-4 text-slate-400 hidden lg:table-cell text-xs">
                                            {formatDate(tender.bidDeadline)}
                                        </td>

                                        {/* Eligibility Verdict */}
                                        <td className="px-5 py-4">
                                            {isProcessing ? (
                                                <span className="text-xs text-slate-500 italic">Pending</span>
                                            ) : verdictCfg ? (
                                                <Badge className={cn("text-xs border", verdictCfg.cls)}>
                                                    {verdictCfg.label}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-500">—</span>
                                            )}
                                        </td>

                                        {/* Risk Level */}
                                        <td className="px-5 py-4 hidden lg:table-cell">
                                            <Badge className={cn("text-xs border", riskCfg.cls)}>
                                                {riskCfg.label}
                                            </Badge>
                                        </td>

                                        {/* Processing Status */}
                                        <td className="px-5 py-4">
                                            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusCfg.cls)}>
                                                {statusCfg.label}
                                            </span>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => router.push(`/dashboard/tenders/${tender.id}`)}
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {meta.totalPages > 1 && (
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs text-slate-500">
                        Showing {(meta.page - 1) * meta.pageSize + 1}–
                        {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total} tenders
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={meta.page <= 1}
                            onClick={() => onPageChange(meta.page - 1)}
                            className="h-8 w-8 p-0 border-white/10 hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                            let pageNum: number;
                            if (meta.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (meta.page <= 3) {
                                pageNum = i + 1;
                            } else if (meta.page >= meta.totalPages - 2) {
                                pageNum = meta.totalPages - 4 + i;
                            } else {
                                pageNum = meta.page - 2 + i;
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onPageChange(pageNum)}
                                    className={cn(
                                        "h-8 w-8 p-0 text-xs",
                                        pageNum === meta.page
                                            ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                            : "text-slate-400 hover:text-white hover:bg-white/10",
                                    )}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            size="sm"
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => onPageChange(meta.page + 1)}
                            className="h-8 w-8 p-0 border-white/10 hover:bg-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
