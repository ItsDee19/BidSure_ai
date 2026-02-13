import { extractTextFromPdf } from './ocr';
import { generateStructuredContent } from './gemini';
import { TenderExtractionSchema, TenderExtraction } from './schemas';
import { EXTRACTION_SYSTEM_PROMPT } from './prompts';

export async function processTenderDocument(
    fileBuffer: Buffer,
    fileName: string
): Promise<TenderExtraction> {
    console.log(`Extracting text from ${fileName}...`);
    const { text, isScanned } = await extractTextFromPdf(fileBuffer);

    if (!text || text.length < 100) {
        throw new Error('No text content found in PDF. Scanned document might be too poor quality.');
    }

    console.log(`Processing with Gemini (${isScanned ? 'OCR Text' : 'Extracted Text'})...`);

    // Truncate text if needed (Gemini Flash has huge context, likely not needed for typical tenders)
    // But to be safe, maybe grab first 50k chars or something?
    // Actually, Gemini 1.5/2.0 context is 1M tokens. We can feed enormous docs.
    // The max file size is 50MB, so text extraction shouldn't exceed token limits easily.

    try {
        const response = await generateStructuredContent<TenderExtraction>(
            `${EXTRACTION_SYSTEM_PROMPT}\n\nDOCUMENT TEXT:\n${text}`,
            TenderExtractionSchema
        );

        // Validate with Zod just in case Gemini hallucinated structure slightly
        // (though responseSchema should enforce it)
        const result = TenderExtractionSchema.safeParse(response);

        if (!result.success) {
            console.warn("Zod validation failed:", result.error);
            // Optional: Retry logic here could be added.
            // For MVP, if parsing fails structurally, we might just return the raw response or accept partial
            // But let's throw for now to catch issues early.
            throw new Error(`Invalid structured response: ${result.error.message}`);
        }

        return result.data;

    } catch (error) {
        console.error("Gemini Extraction Pipeline Error:", error);
        throw error;
    }
}
