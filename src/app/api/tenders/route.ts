import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { handleApiError, createErrorResponse } from '@/lib/errors';
import type { TenderRow, TendersPaginatedResponse } from '@/types/tenders';

function deriveRiskLevel(
    riskFlags: Array<{ severity: string }> | null | undefined
): 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' {
    if (!riskFlags || !Array.isArray(riskFlags) || riskFlags.length === 0) return 'NONE';
    if (riskFlags.some((f) => f.severity === 'HIGH')) return 'HIGH';
    if (riskFlags.some((f) => f.severity === 'MEDIUM')) return 'MEDIUM';
    return 'LOW';
}

const SORTABLE_FIELDS: Record<string, string> = {
    tenderNumber: 'tenderNumber',
    issuingAuthority: 'issuingAuthority',
    projectValue: 'projectValue',
    bidDeadline: 'bidDeadline',
    createdAt: 'createdAt',
    status: 'status',
};

export async function GET(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return createErrorResponse('UNAUTHORIZED', 'Login required', null, 401);
        }

        // ── Parse query params ──────────────────────────────────
        const { searchParams } = request.nextUrl;
        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
        const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '10', 10)));
        const sortBy = SORTABLE_FIELDS[searchParams.get('sortBy') ?? ''] ? searchParams.get('sortBy')! : 'createdAt';
        const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc';

        const statusFilter = searchParams.get('status');
        const eligibilityFilter = searchParams.get('eligibility');
        const search = searchParams.get('search')?.trim();
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');

        // ── Build Prisma where clause ───────────────────────────
        const where: Record<string, unknown> = { userId: user.id };

        if (statusFilter && ['UPLOADED', 'PROCESSING', 'EXTRACTED', 'FAILED'].includes(statusFilter)) {
            where.status = statusFilter;
        }

        if (search) {
            where.OR = [
                { tenderNumber: { contains: search, mode: 'insensitive' } },
                { issuingAuthority: { contains: search, mode: 'insensitive' } },
                { fileName: { contains: search, mode: 'insensitive' } },
                { projectName: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (dateFrom || dateTo) {
            const dateFilter: Record<string, Date> = {};
            if (dateFrom) dateFilter.gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                dateFilter.lte = end;
            }
            where.createdAt = dateFilter;
        }

        // Eligibility filter requires joining verdicts
        if (eligibilityFilter && ['ELIGIBLE', 'BORDERLINE', 'INELIGIBLE'].includes(eligibilityFilter)) {
            where.verdicts = {
                some: { overallVerdict: eligibilityFilter },
            };
        }

        // ── Count total ─────────────────────────────────────────
        const total = await db.tenderDocument.count({ where: where as any });

        // ── Fetch paginated data ────────────────────────────────
        const tenders = await db.tenderDocument.findMany({
            where: where as any,
            orderBy: { [SORTABLE_FIELDS[sortBy]]: sortOrder },
            skip: (page - 1) * pageSize,
            take: pageSize,
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
                verdicts: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    select: {
                        overallVerdict: true,
                    },
                },
            },
        });

        // ── Map to TenderRow ────────────────────────────────────
        const rows: TenderRow[] = tenders.map((t) => {
            const flags = t.riskFlags as TenderRow['riskFlags'];
            return {
                id: t.id,
                fileName: t.fileName,
                tenderNumber: t.tenderNumber,
                issuingAuthority: t.issuingAuthority,
                projectValue: t.projectValue ? Number(t.projectValue) : null,
                status: t.status,
                bidDeadline: t.bidDeadline?.toISOString() ?? null,
                createdAt: t.createdAt.toISOString(),
                riskFlags: flags,
                riskLevel: deriveRiskLevel(flags),
                eligibilityVerdict: t.verdicts[0]?.overallVerdict ?? null,
            };
        });

        const response: TendersPaginatedResponse = {
            data: rows,
            meta: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        return handleApiError(error);
    }
}
