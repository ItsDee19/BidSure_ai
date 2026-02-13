import { generateStructuredContent } from '@/ai/gemini';
import { VERDICT_EXPLANATION_PROMPT } from '@/ai/prompts';
import { z } from 'zod';

// We want structured explanation output
const ExplanationSchema = z.object({
    overallExplanation: z.string().describe("Concise executive summary of why the contractor is eligible/ineligible"),
    remedies: z.array(z.object({
        criterion: z.string(),
        suggestion: z.string()
    })).describe("Specific actions to become eligible if possible"),
    detailedReasoning: z.string().describe("Clause-by-clause breakdown")
});

export type ExplanationResult = z.infer<typeof ExplanationSchema>;

export async function generateVerdictExplanation(
    profileSummary: string,
    tenderRequirements: string,
    ruleResults: any[]
): Promise<ExplanationResult> {
    try {
        const prompt = `${VERDICT_EXPLANATION_PROMPT}
    
    Context:
    Contractor Profile: ${profileSummary}
    
    Tender Requirements: ${tenderRequirements}
    
    Rule Results: ${JSON.stringify(ruleResults, null, 2)}
    `;

        return await generateStructuredContent<ExplanationResult>(prompt, ExplanationSchema);
    } catch (error) {
        console.error("Explanation Generation Error:", error);
        // Fallback if AI fails
        return {
            overallExplanation: "Automated explanation unavailable.",
            remedies: [],
            detailedReasoning: "Please review the rule results manually."
        };
    }
}
