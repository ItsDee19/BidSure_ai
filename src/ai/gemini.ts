import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { z } from 'zod';
// Imports removed


// Since we are using Zod, let's just define the schema manually for Gemini
// or use a library, but to avoid extra deps, I'll pass schema definition manually if needed.
// However, Gemini 1.5/2.0 supports responseSchema directly.

const apiKey = process.env.GEMINI_API_KEY || "dummy_key_for_build";
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp", // Or "gemini-1.5-flash" depending on availability
    generationConfig: {
        responseMimeType: "application/json",
        // responseSchema: We will pass this per call if needed or let the prompt enforce structure + JSON mode
    },
});

export async function generateStructuredContent<T>(
    prompt: string,
    schema?: any
): Promise<T> {
    try {
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
            }
        });

        const response = await result.response;
        const text = response.text();
        return JSON.parse(text) as T;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error;
    }
}
