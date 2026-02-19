import type { TenderStatus, VerdictStatus } from "./index";

/** Tender as returned by GET /api/tenders */
export interface TenderSummary {
    id: string;
    fileName: string;
    tenderNumber: string | null;
    issuingAuthority: string | null;
    projectValue: number | null; // Decimal comes as number from JSON
    status: TenderStatus;
    riskFlags: Array<{
        flag: string;
        severity: "HIGH" | "MEDIUM" | "LOW";
        clause: string;
        explanation: string;
    }> | null;
    bidDeadline: string | null; // ISO string
    createdAt: string; // ISO string
}

/** Verdict as returned by GET /api/verdicts */
export interface VerdictSummary {
    id: string;
    overallVerdict: VerdictStatus;
    confidenceScore: number;
    overallExplanation: string | null;
    createdAt: string;
    tender: {
        id: string;
        tenderNumber: string | null;
        fileName: string;
    };
}

/** Profile as returned by GET /api/profiles */
export interface ProfileSummary {
    id: string;
    companyName: string;
    category: string | null;
    yearsOfExperience: number | null;
}

/** Derived dashboard statistics */
export interface DashboardStatsData {
    totalTenders: number;
    eligibleCount: number;
    highRiskCount: number;
    avgConfidence: number; // 0-100 scale
}
