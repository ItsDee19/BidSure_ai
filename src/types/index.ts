export type UserRole = 'ADMIN' | 'CONTRACTOR' | 'CONSULTANT' | 'VIEWER';
export type VerdictStatus = 'ELIGIBLE' | 'BORDERLINE' | 'INELIGIBLE';
export type TenderStatus = 'UPLOADED' | 'PROCESSING' | 'EXTRACTED' | 'FAILED';

export interface TenderData {
    tenderNumber: string | null;
    issuingAuthority: string | null;
    projectValue: number | null;
    emdAmount: number | null;
    turnoverReq: number | null;
    experienceReq: number | null;
    bidDeadline: string | null;
    prebidDate: string | null;
    completionPeriod: string | null;

    keyDates: Array<{ event: string; date: string }> | null;
    requiredDocuments: string[] | null;
    technicalCriteria: Array<{ criterion: string; requirement: string; weight?: number }> | null;
    financialCriteria: Array<{ criterion: string; requirement: string; weight?: number }> | null;
    riskFlags: Array<{ flag: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; clause: string; explanation: string }> | null;
    summaryText: string | null;
}

export interface ClauseData {
    clauseNumber: string;
    title: string;
    text: string;
    category: 'ELIGIBILITY' | 'FINANCIAL' | 'TECHNICAL' | 'LEGAL' | 'TIMELINE' | 'PENALTY';
    isMandatory: boolean;
    isEligibility: boolean;
}

export interface ExtractionResult {
    data: TenderData;
    clauses: ClauseData[];
    metadata: {
        model: string;
        tokens: number;
        processingTimeMs: number;
        ocrUsed: boolean;
    };
}
