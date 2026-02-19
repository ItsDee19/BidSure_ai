"use client"

import { useQuery } from "@tanstack/react-query"
import type {
    TenderSummary,
    VerdictSummary,
    ProfileSummary,
    DashboardStatsData,
} from "@/types/dashboard"

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url)
    if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message || `Request failed (${res.status})`)
    }
    return res.json()
}

export function useTenders() {
    return useQuery<TenderSummary[]>({
        queryKey: ["tenders"],
        queryFn: () => fetchJson<TenderSummary[]>("/api/tenders"),
    })
}

export function useProfile() {
    return useQuery<ProfileSummary>({
        queryKey: ["profile"],
        queryFn: () => fetchJson<ProfileSummary>("/api/profiles"),
        retry: (failureCount, error) => {
            // Don't retry on 404 (profile not yet created)
            if (error.message.includes("404") || error.message.includes("not found")) return false
            return failureCount < 2
        },
    })
}

export function useVerdicts() {
    return useQuery<VerdictSummary[]>({
        queryKey: ["verdicts"],
        queryFn: () => fetchJson<VerdictSummary[]>("/api/verdicts"),
    })
}

/** Combined hook that derives dashboard statistics from raw API data */
export function useDashboardData() {
    const tenders = useTenders()
    const verdicts = useVerdicts()
    const profile = useProfile()

    const isLoading = tenders.isLoading || verdicts.isLoading
    const isError = tenders.isError || verdicts.isError

    const stats: DashboardStatsData = (() => {
        const tenderList = tenders.data ?? []
        const verdictList = verdicts.data ?? []

        const totalTenders = tenderList.length

        const eligibleCount = verdictList.filter(
            (v) => v.overallVerdict === "ELIGIBLE"
        ).length

        const highRiskCount = tenderList.filter((t) => {
            if (!t.riskFlags || !Array.isArray(t.riskFlags)) return false
            return t.riskFlags.some((rf) => rf.severity === "HIGH")
        }).length

        const avgConfidence =
            verdictList.length > 0
                ? Math.round(
                    (verdictList.reduce((sum, v) => sum + v.confidenceScore, 0) /
                        verdictList.length) *
                    100
                )
                : 0

        return { totalTenders, eligibleCount, highRiskCount, avgConfidence }
    })()

    return {
        tenders,
        verdicts,
        profile,
        stats,
        isLoading,
        isError,
    }
}
