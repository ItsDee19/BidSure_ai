import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { matchProfileToTender } from '@/engine/matcher';
import { generateVerdictExplanation } from '@/engine/explainer';
import { handleApiError, createErrorResponse } from '@/lib/errors';
import { z } from 'zod';

const MatchRequestSchema = z.object({
    tenderId: z.string().uuid(),
    profileId: z.string().uuid()
});

export const runtime = 'nodejs'; // Use nodejs runtime for DB access

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return createErrorResponse('UNAUTHORIZED', 'You must be logged in', null, 401);
        }

        // 2. Validate Request
        const body = await req.json();
        const { tenderId, profileId } = MatchRequestSchema.parse(body);

        // 3. Fetch Data
        const [tender, profile] = await Promise.all([
            db.tenderDocument.findUnique({ where: { id: tenderId } }),
            db.contractorProfile.findUnique({ where: { id: profileId } })
        ]);

        if (!tender) return createErrorResponse('NOT_FOUND', 'Tender not found', null, 404);
        if (!profile) return createErrorResponse('NOT_FOUND', 'Profile not found', null, 404);

        // Verify ownership or access
        if (tender.userId !== user.id && profile.userId !== user.id) {
            // Allow if user is admin or consultant with access? For MVP, strict ownership.
            return createErrorResponse('FORBIDDEN', 'Access denied to this tender/profile', null, 403);
        }

        // 4. Run Deterministic Matcher
        // We need to pass tender requirements. The matcher expects specific fields.
        // The TenderDocument model has these fields (turnoverReq, extraction results in JSON).

        const requirements = {
            ...tender,
            turnoverReq: tender.turnoverReq ? Number(tender.turnoverReq) : null,
            experienceReq: tender.experienceReq,
            netWorthReq: null, // Extract from financialCriteria JSON if needed
            // TODO: deeply parse criteria JSON to extract more specific requirements
        };

        const matchResult = matchProfileToTender(profile, requirements);

        // 5. Run LLM Explainer
        // Prepare prompt components
        const profileSummary = `
      Company: ${profile.companyName}
      Category: ${profile.category || 'N/A'}
      Turnover (3yr avg): ${profile.turnoverHistory ? 'available' : 'missing'}
      Exp Years: ${profile.yearsOfExperience || 0}
      Past Projects: ${(profile.pastProjects as any[])?.length || 0}
    `;

        const reqSummary = `
      Turnover Req: ${tender.turnoverReq || 'N/A'}
      Exp Req: ${tender.experienceReq || 'N/A'} years
      Project Value: ${tender.projectValue || 'N/A'}
    `;

        const explanation = await generateVerdictExplanation(
            profileSummary,
            reqSummary,
            matchResult.ruleResults
        );

        // 6. Store Verdict
        const verdict = await db.eligibilityVerdict.create({
            data: {
                userId: user.id,
                tenderId,
                profileId,
                overallVerdict: matchResult.overallVerdict,
                confidenceScore: matchResult.confidenceScore,
                overallExplanation: explanation.overallExplanation,

                clauseResults: matchResult.ruleResults as any, // Store detailed rule breakdown
                financialMatch: {
                    turnoverMet: matchResult.ruleResults.find(r => r.ruleId === 'turnover')?.met,
                    details: explanation.detailedReasoning
                },
                technicalMatch: {}, // Populate with specific technical rule results
                documentGaps: explanation.remedies as any, // Store remedies as document gaps/actions

                rulesVersion: '1.0',
                aiModel: 'gemini-2.0-flash'
            }
        });

        return NextResponse.json(verdict, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}
