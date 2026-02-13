import { z } from 'zod';

export const TenderExtractionSchema = z.object({
    tenderNumber: z.string().nullable().describe("The official tender reference number or ID"),
    issuingAuthority: z.string().nullable().describe("Name of the organization issuing the tender"),

    // Financials
    projectValue: z.number().nullable().describe("Total estimated project value in INR"),
    emdAmount: z.number().nullable().describe("Earnest Money Deposit amount in INR"),
    turnoverReq: z.number().nullable().describe("Minimum average annual turnover required in INR"),

    // Experience
    experienceReq: z.number().nullable().describe("Minimum years of experience required"),

    // Dates
    bidDeadline: z.string().nullable().describe("Final date and time for bid submission (ISO 8601)"),
    prebidDate: z.string().nullable().describe("Date of pre-bid meeting (ISO 8601)"),
    completionPeriod: z.string().nullable().describe("Time period for project completion (e.g., '18 months')"),

    // Arrays
    keyDates: z.array(z.object({
        event: z.string(),
        date: z.string().describe("ISO 8601 date string")
    })).nullable().describe("List of critical dates"),

    requiredDocuments: z.array(z.string()).nullable().describe("List of mandatory documents to be submitted"),

    technicalCriteria: z.array(z.object({
        criterion: z.string(),
        requirement: z.string(),
        weight: z.number().optional()
    })).nullable().describe("Technical eligibility criteria"),

    financialCriteria: z.array(z.object({
        criterion: z.string(),
        requirement: z.string(),
        weight: z.number().optional()
    })).nullable().describe("Financial eligibility criteria"),

    riskFlags: z.array(z.object({
        flag: z.string(),
        severity: z.enum(['HIGH', 'MEDIUM', 'LOW']),
        clause: z.string(),
        explanation: z.string()
    })).nullable().describe("Potential risks or unusual clauses found in the tender"),

    summaryText: z.string().nullable().describe("Brief summary of the tender scope and requirements"),

    extractedClauses: z.array(z.object({
        clauseNumber: z.string(),
        title: z.string(),
        text: z.string(),
        category: z.enum(['ELIGIBILITY', 'FINANCIAL', 'TECHNICAL', 'LEGAL', 'TIMELINE', 'PENALTY']),
        isMandatory: z.boolean(),
        isEligibility: z.boolean()
    })).describe("List of all critical clauses extracted from the document")
});

export type TenderExtraction = z.infer<typeof TenderExtractionSchema>;
