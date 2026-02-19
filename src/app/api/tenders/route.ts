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

        const tenders = await db.tenderDocument.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileName: true,
                tenderNumber: true,
                issuingAuthority: true,
                projectValue: true,
                status: true,
                riskFlags: true,
                bidDeadline: true,
                createdAt: true,
            },
        });

        return NextResponse.json(tenders);
    } catch (error) {
        return handleApiError(error);
    }
}
