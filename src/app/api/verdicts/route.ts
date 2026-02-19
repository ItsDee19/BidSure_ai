import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/errors';

export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return createErrorResponse('UNAUTHORIZED', 'Login required', null, 401);
        }

        const verdicts = await db.eligibilityVerdict.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                overallVerdict: true,
                confidenceScore: true,
                overallExplanation: true,
                createdAt: true,
                tender: {
                    select: {
                        id: true,
                        tenderNumber: true,
                        fileName: true,
                    },
                },
            },
        });

        return NextResponse.json(verdicts);
    } catch (error) {
        return handleApiError(error);
    }
}
