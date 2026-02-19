"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, AlertTriangle, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStatsData } from "@/types/dashboard";

interface DashboardStatsProps {
    stats: DashboardStatsData;
    isLoading: boolean;
    isError: boolean;
}

function StatSkeleton() {
    return (
        <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-4 w-4 rounded bg-white/10" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-12 mb-1 bg-white/10" />
                <Skeleton className="h-3 w-28 bg-white/10" />
            </CardContent>
        </Card>
    );
}

export function DashboardStats({ stats, isLoading, isError }: DashboardStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                <AlertTriangle className="h-6 w-6 text-red-400 mx-auto mb-2" />
                <p className="text-red-300 text-sm">
                    Failed to load dashboard statistics. Please try refreshing.
                </p>
            </div>
        );
    }

    const cards = [
        {
            title: "Total Tenders",
            value: stats.totalTenders,
            subtitle: stats.totalTenders === 1 ? "1 document analyzed" : `${stats.totalTenders} documents analyzed`,
            icon: FileText,
            iconColor: "text-blue-500",
        },
        {
            title: "Avg. Confidence",
            value: `${stats.avgConfidence}%`,
            subtitle: stats.avgConfidence > 0 ? "Across all verdicts" : "No verdicts yet",
            icon: Activity,
            iconColor: "text-green-500",
        },
        {
            title: "Eligible",
            value: stats.eligibleCount,
            subtitle: stats.eligibleCount === 1 ? "Ready for bidding" : stats.eligibleCount > 0 ? "Ready for bidding" : "No eligible tenders",
            icon: ShieldCheck,
            iconColor: "text-teal-400",
        },
        {
            title: "High Risk",
            value: stats.highRiskCount,
            subtitle: stats.highRiskCount > 0 ? "Requires attention" : "No high-risk flags",
            icon: AlertTriangle,
            iconColor: "text-red-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="glass-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-400">
                            {card.title}
                        </CardTitle>
                        <card.icon className={`h-4 w-4 ${card.iconColor}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{card.value}</div>
                        <p className="text-xs text-slate-500">{card.subtitle}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
