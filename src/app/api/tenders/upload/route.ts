import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { processTenderDocument } from '@/ai/pipeline';
import { handleApiError, createErrorResponse } from '@/lib/errors';
import { Buffer } from 'buffer';

export const runtime = 'nodejs'; // Use nodejs runtime for pdf-parse compatibility? 
// Or edge? pdf-parse might not work on edge. Let's stick to nodejs.
// Also, Tesseract.js definitely needs nodejs runtime on server if used there.

export async function POST(req: NextRequest) {
    try {
        // 1. Auth check
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return createErrorResponse('UNAUTHORIZED', 'You must be logged in to upload tenders', null, 401);
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return createErrorResponse('VALIDATION_ERROR', 'No file provided', null, 400);
        }

        if (file.type !== 'application/pdf') {
            return createErrorResponse('VALIDATION_ERROR', 'Only PDF files are supported', null, 400);
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
            return createErrorResponse('VALIDATION_ERROR', 'File size exceeds 50MB limit', null, 400);
        }

        // 3. Upload to Supabase Storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = `${user.id}/${fileName}`;

        /* 
           Note: We are not uploading to storage yet because we don't have buckets set up.
           In a real implementation, we would define the bucket 'tender-documents'.
           For MVP without creds, we'll comment this out or wrap in try/catch to not block logic.
        */
        /*
        const { error: uploadError } = await supabase.storage
          .from('tender-documents')
          .upload(filePath, file, { contentType: file.type });
    
        if (uploadError) {
          console.error('Storage Upload Error:', uploadError);
          throw new Error('Failed to upload file to storage');
        }
        */

        // 4. Create DB Record (Initial Status)
        const tender = await db.tenderDocument.create({
            data: {
                userId: user.id,
                fileName: file.name,
                fileUrl: filePath, // This would be the path in bucket
                fileSize: file.size,
                mimeType: file.type,
                status: 'PROCESSING',
            }
        });

        // 5. Trigger AI Extraction (Async)
        // In Vercel, we should use Inngest or similar for reliable async background jobs.
        // For MVP, we can try to fire-and-forget, but Vercel might kill the process.
        // However, if we await it, the request might time out (Gemini takes 10-20s).
        // Let's await it for now to give immediate feedback for MVP demo purposes,
        // or return processing and let client poll.
        // Given user requirement "Output Requirements: Return structured JSON", 
        // maybe they expect immediate response?
        // "Phase 1 - Tender Auto-Reader... Return structured JSON".
        // It's better to await extraction if it's < 60s (Vercel limit on Pro is higher).
        // Gemini Flash is fast enough.

        try {
            const extraction = await processTenderDocument(buffer, file.name);

            // 6. Update DB with Extraction Results
            await db.tenderDocument.update({
                where: { id: tender.id },
                data: {
                    status: 'EXTRACTED',
                    tenderNumber: extraction.tenderNumber,
                    issuingAuthority: extraction.issuingAuthority,
                    projectValue: extraction.projectValue,
                    emdAmount: extraction.emdAmount,
                    turnoverReq: extraction.turnoverReq,
                    experienceReq: extraction.experienceReq,
                    bidDeadline: extraction.bidDeadline ? new Date(extraction.bidDeadline) : null,
                    prebidDate: extraction.prebidDate ? new Date(extraction.prebidDate) : null,
                    completionPeriod: extraction.completionPeriod,

                    keyDates: extraction.keyDates as any,
                    requiredDocuments: extraction.requiredDocuments as any,
                    technicalCriteria: extraction.technicalCriteria as any,
                    financialCriteria: extraction.financialCriteria as any,
                    riskFlags: extraction.riskFlags as any,
                    summaryText: extraction.summaryText,

                    aiModel: 'gemini-2.0-flash',
                    // ocrUsed: extraction.metadata.ocrUsed
                }
            });

            // 7. Store Clauses
            if (extraction.extractedClauses && extraction.extractedClauses.length > 0) {
                await db.extractedClause.createMany({
                    data: extraction.extractedClauses.map(clause => ({
                        tenderId: tender.id,
                        clauseNumber: clause.clauseNumber,
                        clauseTitle: clause.title,
                        clauseText: clause.text,
                        category: clause.category,
                        isMandatory: clause.isMandatory || false,
                        isEligibility: clause.isEligibility || false
                    }))
                });
            }

            return NextResponse.json({
                tenderId: tender.id,
                status: 'EXTRACTED',
                fileName: file.name,
                data: extraction
            }, { status: 201 });

        } catch (aiError) {
            console.error('AI Processing Error:', aiError);

            await db.tenderDocument.update({
                where: { id: tender.id },
                data: { status: 'FAILED', processingError: String(aiError) }
            });

            return createErrorResponse('INTERNAL_ERROR', 'AI processing failed', String(aiError), 500);
        }

    } catch (error) {
        return handleApiError(error);
    }
}
