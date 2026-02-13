import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/errors';
import { z } from 'zod';

const ProfileSchema = z.object({
    companyName: z.string().min(2),
    gstNumber: z.string().optional(),
    panNumber: z.string().optional(),
    category: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    turnoverHistory: z.array(z.object({
        year: z.number(),
        amount: z.number(),
        audited: z.boolean().optional()
    })).optional(),
    yearsOfExperience: z.number().optional(),
    pastProjects: z.array(z.object({
        name: z.string(),
        value: z.number(),
        client: z.string(),
        year: z.number(),
        scope: z.string().optional()
    })).optional(),
    licenses: z.array(z.object({
        type: z.string(),
        number: z.string(),
        issuedBy: z.string(),
        validTo: z.string() // ISO Date
    })).optional(),
    certificates: z.array(z.object({
        type: z.string(),
        number: z.string(),
        issuedBy: z.string(),
        validTo: z.string() // ISO Date
    })).optional()
});

export async function POST(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) return createErrorResponse('UNAUTHORIZED', 'Login required', null, 401);

        const body = await req.json();
        const data = ProfileSchema.parse(body);

        // Check if profile exists
        const existing = await db.contractorProfile.findUnique({
            where: { userId: user.id }
        });

        if (existing) {
            // Update logic (create new version snapshot?)
            // For MVP, just update inplace or simpler versioning
            const updated = await db.contractorProfile.update({
                where: { userId: user.id },
                data: {
                    ...data,
                    version: { increment: 1 },
                    previousVersions: existing.previousVersions ? [...(existing.previousVersions as any[]), existing] : [existing]
                }
            });
            return NextResponse.json(updated);
        }

        const profile = await db.contractorProfile.create({
            data: {
                userId: user.id,
                companyName: data.companyName,
                gstNumber: data.gstNumber,
                panNumber: data.panNumber,
                category: data.category,
                specializations: data.specializations || [],
                turnoverHistory: data.turnoverHistory || [],
                yearsOfExperience: data.yearsOfExperience,
                pastProjects: data.pastProjects || [],
                licenses: data.licenses || [],
                certificates: data.certificates || [],
                version: 1,
                // These are JSONB but we can init with empty array or null if nullable
                // Schema says Json (not optional in prisma for some?)
                // turnoverHistory, pastProjects, licenses, certificates are Json (Required)
                // netWorth, creditRating default null
            }
        });

        return NextResponse.json(profile, { status: 201 });

    } catch (error) {
        return handleApiError(error);
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) return createErrorResponse('UNAUTHORIZED', 'Login required', null, 401);

        const profile = await db.contractorProfile.findUnique({
            where: { userId: user.id }
        });

        if (!profile) return createErrorResponse('NOT_FOUND', 'Profile not found', null, 404);

        return NextResponse.json(profile);

    } catch (error) {
        return handleApiError(error);
    }
}
