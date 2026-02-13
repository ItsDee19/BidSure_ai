import Link from 'next/link';
import { db } from '@/lib/db';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ShieldCheck, AlertTriangle, XCircle, ArrowRight, FileText } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge'; // Need to create badge UI component or just inline

export default async function VerdictsPage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Access Denied</div>;

    const verdicts = await db.eligibilityVerdict.findMany({
        where: { userId: user.id },
        include: {
            tender: true,
            profile: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Eligibility Verdicts</h1>
                    <p className="text-slate-400 text-sm mt-1">AI-powered compliance checks for your tenders.</p>
                </div>
            </div>

            {verdicts.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                    <ShieldCheck className="w-12 h-12 text-slate-500 mb-4" />
                    <p className="text-slate-400">No verdicts generated yet.</p>
                    <p className="text-xs text-slate-500 mt-1">Upload a tender and run analysis to get started.</p>
                    <Link href="/dashboard/tenders/upload" className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">
                        Analyze New Tender
                    </Link>
                </div>
            ) : (
                <div className="grid gap-4">
                    {verdicts.map((verdict) => (
                        <Link
                            key={verdict.id}
                            href={`/dashboard/verdicts/${verdict.id}`}
                            className="group flex flex-col md:flex-row items-start md:items-center gap-4 p-4 bg-black/40 border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all"
                        >
                            <div className="p-3 bg-white/5 rounded-lg shrink-0">
                                {verdict.overallVerdict === 'ELIGIBLE' ? <ShieldCheck className="w-6 h-6 text-green-400" /> :
                                    verdict.overallVerdict === 'BORDERLINE' ? <AlertTriangle className="w-6 h-6 text-yellow-400" /> :
                                        <XCircle className="w-6 h-6 text-red-400" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                        verdict.overallVerdict === 'ELIGIBLE' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                                            verdict.overallVerdict === 'BORDERLINE' ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" :
                                                "bg-red-500/10 text-red-400 border border-red-500/20"
                                    )}>
                                        {verdict.overallVerdict}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> {verdict.tender.tenderNumber || 'No ID'}
                                    </span>
                                </div>
                                <h3 className="text-white font-medium truncate">{verdict.tender.fileName}</h3>
                                <p className="text-xs text-slate-400 mt-0.5">Checked against: {verdict.profile.companyName}</p>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-right shrink-0">
                                <div className="text-xs text-slate-500">{formatDate(verdict.createdAt)}</div>
                                <div className="flex items-center gap-1 text-sm font-medium text-blue-400 group-hover:translate-x-1 transition-transform">
                                    View Analysis <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
