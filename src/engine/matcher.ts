import { rules, RuleResult } from './rules';
import { ContractorProfile, TenderDocument } from '@prisma/client';

export interface MatchResult {
    ruleResults: RuleResult[];
    overallVerdict: 'ELIGIBLE' | 'BORDERLINE' | 'INELIGIBLE';
    confidenceScore: number;
}

export function matchProfileToTender(
    profile: ContractorProfile,
    tender: Omit<Partial<TenderDocument>, 'turnoverReq' | 'experienceReq'> & {
        turnoverReq?: number | null;
        experienceReq?: number | null;
        netWorthReq?: number | null;
    }
): MatchResult {
    const ruleResults: RuleResult[] = [];

    // 1. Turnover Check
    if (tender.turnoverReq) {
        ruleResults.push(rules.checkTurnover(profile, tender));
    }

    // 2. Experience Check
    if (tender.experienceReq) {
        ruleResults.push(rules.checkExperienceYears(profile, tender));
    }

    // 3. Net Worth Check
    // ruleResults.push(rules.checkNetWorth(profile, tender));

    // Determine Overall Verdict
    const failedMandatory = ruleResults.some(r => !r.met && r.category !== 'DOCUMENT'); // Assume document failures are fixable/borderline? No, mandatory docs are fatal for eligibility usually.

    // Refined Logic based on plan:
    // INELIGIBLE: Any mandatory rule fails (Turnover, Exp, Net Worth)
    // BORDERLINE: Confidence < 0.8 or minor issues
    // ELIGIBLE: All passed + High confidence

    const allMet = ruleResults.every(r => r.met);
    // Calculate average confidence
    const avgConfidence = ruleResults.reduce((sum, r) => sum + r.confidence, 0) / (ruleResults.length || 1);

    let verdict: 'ELIGIBLE' | 'BORDERLINE' | 'INELIGIBLE' = 'INELIGIBLE';

    if (allMet) {
        if (avgConfidence >= 0.8) {
            verdict = 'ELIGIBLE';
        } else {
            verdict = 'BORDERLINE';
        }
    } else {
        // Check if failures are critical
        // For MVP, simplistic: fail = ineligible
        verdict = 'INELIGIBLE';
    }

    return {
        ruleResults,
        overallVerdict: verdict,
        confidenceScore: avgConfidence
    };
}
