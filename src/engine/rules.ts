import { ContractorProfile, TenderDocument } from '@prisma/client';

export type RuleCategory = 'FINANCIAL' | 'TECHNICAL' | 'DOCUMENT' | 'EXPERIENCE';

export interface RuleResult {
    ruleId: string;
    category: RuleCategory;
    met: boolean;
    confidence: number;
    explanation: string;
    value: { required: any; actual: any };
}

// Helper to safely parse numbers/JSON
const safeNumber = (val: any) => parseFloat(val) || 0;

export const rules = {
    checkTurnover: (profile: ContractorProfile, tender: any): RuleResult => {
        // Assuming turnoverHistory is sorted recent first
        const history = (profile.turnoverHistory as any[]) || [];
        const recent3Years = history.slice(0, 3);
        const avgTurnover = recent3Years.reduce((sum, item) => sum + safeNumber(item.amount), 0) / (recent3Years.length || 1);
        const required = safeNumber(tender.turnoverReq);

        const met = avgTurnover >= required;

        return {
            ruleId: 'turnover',
            category: 'FINANCIAL',
            met,
            confidence: 1.0,
            explanation: met
                ? `Average turnover (${avgTurnover}) exceeds requirement (${required})`
                : `Average turnover (${avgTurnover}) is less than requirement (${required})`,
            value: { required, actual: avgTurnover }
        };
    },

    checkExperienceYears: (profile: ContractorProfile, tender: any): RuleResult => {
        const actual = profile.yearsOfExperience || 0;
        const required = tender.experienceReq || 0;
        const met = actual >= required;

        return {
            ruleId: 'experience_years',
            category: 'EXPERIENCE',
            met,
            confidence: 1.0,
            explanation: met
                ? `Experience (${actual} years) meets requirement (${required} years)`
                : `Experience (${actual} years) is less than requirement (${required} years)`,
            value: { required, actual }
        };
    },

    checkNetWorth: (profile: ContractorProfile, tender: any): RuleResult => {
        // Some tenders have net worth criteria
        // Assuming we extracted it or have a rule for it.
        // Basic placeholder implementation
        const actual = safeNumber(profile.netWorth);
        // If tender doesn't specify, default to 0/pass or check financial criteria array
        const required = 0; // simplistic for now

        return {
            ruleId: 'net_worth',
            category: 'FINANCIAL',
            met: true,
            confidence: 0.5, // Low confidence if rule not fully implemented
            explanation: "Net worth check pending detailed extraction mapping",
            value: { required, actual }
        };
    }
};
