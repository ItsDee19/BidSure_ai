import Link from 'next/link';
import { Upload, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DashboardStats } from '@/features/dashboard/DashboardStats';
import { EmptyTenders } from '@/features/dashboard/EmptyTenders';

export default function DashboardPage() {
    // Mock data for MVP - in real app fetch via React Query or Server Component
    const hasTenders = false;

    return (
        <div className="space-y-8 animate-in fade-in-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Overview of your tender analysis and eligibility status.</p>
                </div>
                <Link href="/dashboard/tenders/upload">
                    <Button className="btn-primary">
                        <Upload className="w-4 h-4 mr-2" />
                        Analyze New Tender
                    </Button>
                </Link>
            </div>

            <DashboardStats />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">Recent Analysis</h2>
                    {hasTenders && (
                        <Link href="/dashboard/tenders">
                            <Button variant="link" className="text-blue-400">
                                View All <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>

                {hasTenders ? (
                    <div className="rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
                        {/* Table would go here */}
                        <p className="text-slate-500">Tender list placeholder...</p>
                    </div>
                ) : (
                    <EmptyTenders />
                )}
            </div>
        </div>
    );
}
