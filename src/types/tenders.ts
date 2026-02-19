import type { TenderStatus, VerdictStatus } from "./index";

// ── Sortable columns ──────────────────────────────────────────────
export type TenderSortField =
    | "tenderNumber"
    | "issuingAuthority"
    | "projectValue"
    | "bidDeadline"
    | "createdAt"
    | "status";

export type SortOrder = "asc" | "desc";

// ── Row returned by the paginated API ─────────────────────────────
export interface TenderRow {
    id: string;
    fileName: string;
    tenderNumber: string | null;
    issuingAuthority: string | null;
    projectValue: number | null;
    status: TenderStatus;
    bidDeadline: string | null;
    createdAt: string;
    riskFlags: Array<{
        flag: string;
        severity: "HIGH" | "MEDIUM" | "LOW";
        clause: string;
        explanation: string;
    }> | null;
    /** Highest risk severity across all flags (derived server-side) */
    riskLevel: "HIGH" | "MEDIUM" | "LOW" | "NONE";
    /** Latest verdict for this tender – null if none exists yet */
    eligibilityVerdict: VerdictStatus | null;
}

// ── Filter parameters (mirror URL search params) ──────────────────
export interface TendersFilterParams {
    status?: TenderStatus;
    eligibility?: VerdictStatus;
    search?: string;
    dateFrom?: string; // ISO date string
    dateTo?: string;   // ISO date string
}

// ── Pagination metadata ───────────────────────────────────────────
export interface PaginationMeta {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// ── API response shape ────────────────────────────────────────────
export interface TendersPaginatedResponse {
    data: TenderRow[];
    meta: PaginationMeta;
}
