"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import type {
    TendersPaginatedResponse,
    TendersFilterParams,
    TenderSortField,
    SortOrder,
} from "@/types/tenders";

async function fetchTenders(url: string): Promise<TendersPaginatedResponse> {
    const res = await fetch(url);
    if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error?.message || `Request failed (${res.status})`);
    }
    return res.json();
}

/**
 * Reads all filter/sort/page state from URL search-params and provides
 * helpers that update the URL — which automatically triggers a re-fetch
 * via React Query's dependent queryKey.
 */
export function useTendersPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // ── Derive current state from URL ───────────────────────────
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") ?? "10", 10);
    const sortBy = (searchParams.get("sortBy") ?? "createdAt") as TenderSortField;
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as SortOrder;

    const filters: TendersFilterParams = useMemo(
        () => ({
            status: (searchParams.get("status") as TendersFilterParams["status"]) ?? undefined,
            eligibility: (searchParams.get("eligibility") as TendersFilterParams["eligibility"]) ?? undefined,
            search: searchParams.get("search") ?? undefined,
            dateFrom: searchParams.get("dateFrom") ?? undefined,
            dateTo: searchParams.get("dateTo") ?? undefined,
        }),
        [searchParams],
    );

    // ── Build API URL from current params ───────────────────────
    const apiUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("pageSize", String(pageSize));
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
        if (filters.status) params.set("status", filters.status);
        if (filters.eligibility) params.set("eligibility", filters.eligibility);
        if (filters.search) params.set("search", filters.search);
        if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.set("dateTo", filters.dateTo);
        return `/api/tenders?${params.toString()}`;
    }, [page, pageSize, sortBy, sortOrder, filters]);

    // ── React Query ─────────────────────────────────────────────
    const query = useQuery<TendersPaginatedResponse>({
        queryKey: ["tenders-page", apiUrl],
        queryFn: () => fetchTenders(apiUrl),
    });

    // ── URL mutation helpers ────────────────────────────────────
    const updateParams = useCallback(
        (updates: Record<string, string | undefined>) => {
            const params = new URLSearchParams(searchParams.toString());
            Object.entries(updates).forEach(([key, value]) => {
                if (value === undefined || value === "") {
                    params.delete(key);
                } else {
                    params.set(key, value);
                }
            });
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
        },
        [searchParams, router, pathname],
    );

    const setPage = useCallback(
        (p: number) => updateParams({ page: String(p) }),
        [updateParams],
    );

    const setFilter = useCallback(
        (key: keyof TendersFilterParams, value: string | undefined) =>
            updateParams({ [key]: value, page: "1" }),
        [updateParams],
    );

    const setSort = useCallback(
        (field: TenderSortField) => {
            if (field === sortBy) {
                updateParams({ sortOrder: sortOrder === "asc" ? "desc" : "asc" });
            } else {
                updateParams({ sortBy: field, sortOrder: "desc" });
            }
        },
        [sortBy, sortOrder, updateParams],
    );

    return {
        // Data
        data: query.data?.data ?? [],
        meta: query.data?.meta ?? { page: 1, pageSize: 10, total: 0, totalPages: 0 },
        isLoading: query.isLoading,
        isError: query.isError,
        refetch: query.refetch,

        // State
        filters,
        page,
        pageSize,
        sortBy,
        sortOrder,

        // Mutations
        setFilter,
        setPage,
        setSort,
    };
}
