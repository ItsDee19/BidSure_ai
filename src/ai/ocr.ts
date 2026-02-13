// Polyfill for PDF.js in Node environment
if (typeof Promise.withResolvers === 'undefined') {
    // @ts-ignore
    Promise.withResolvers = function () {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject = rej;
        });
        return { promise, resolve, reject };
    };
}

if (typeof ImageData === 'undefined') {
    // @ts-ignore
    global.ImageData = class ImageData {
        width: number;
        height: number;
        data: Uint8ClampedArray;
        constructor(width: number, height: number, data?: Uint8ClampedArray) {
            this.width = width;
            this.height = height;
            if (data) {
                this.data = data;
            } else {
                this.data = new Uint8ClampedArray(width * height * 4);
            }
        }
    };
}

const pdf = require('pdf-parse');
import Tesseract from 'tesseract.js';
import { Buffer } from 'buffer';

export interface OcrResult {
    text: string;
    isScanned: boolean;
    pageCount: number;
}

export async function extractTextFromPdf(buffer: Buffer): Promise<OcrResult> {
    try {
        const data = await pdf(buffer);

        // Check if it's likely scanned (very little text for number of pages)
        const isScanned = data.text.length < 500 && data.numpages > 0;

        if (isScanned) {
            console.log('Detected scanned PDF, attempting OCR...');
            // Note: Tesseract is slow. For MVP we might want to warn user or process async.
            // This is a minimal implementation.
            const { data: { text } } = await Tesseract.recognize(buffer, 'eng', {
                logger: m => console.log(m)
            });
            return {
                text,
                isScanned: true,
                pageCount: data.numpages
            };
        }

        return {
            text: data.text,
            isScanned: false,
            pageCount: data.numpages
        };
    } catch (error) {
        console.error('PDF Extraction Error:', error);
        throw new Error('Failed to extract text from PDF');
    }
}
