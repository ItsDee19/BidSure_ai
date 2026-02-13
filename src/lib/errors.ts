import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export type ErrorCode =
    | 'VALIDATION_ERROR'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'INTERNAL_ERROR'
    | 'RATE_LIMIT_EXCEEDED';

export interface ApiErrorResponse {
    error: {
        code: ErrorCode;
        message: string;
        details?: any;
    };
}

export function createErrorResponse(
    code: ErrorCode,
    message: string,
    details?: any,
    status: number = 400
) {
    return NextResponse.json(
        {
            error: {
                code,
                message,
                details,
            },
        } as ApiErrorResponse,
        { status }
    );
}

export function handleApiError(error: unknown) {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
        return createErrorResponse(
            'VALIDATION_ERROR',
            'Validation failed',
            (error as any).errors,
            400
        );
    }

    if (error instanceof Error) {
        return createErrorResponse(
            'INTERNAL_ERROR',
            error.message,
            undefined,
            500
        );
    }

    return createErrorResponse(
        'INTERNAL_ERROR',
        'An unexpected error occurred',
        String(error),
        500
    );
}
