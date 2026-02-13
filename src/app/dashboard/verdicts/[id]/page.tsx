import Link from 'next/link';
import { db } from '@/lib/db';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, ArrowLeft, Download } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { ExtractedClause } from '@prisma/client';

export default async function VerdictDetailPage({ params }: { params: { id: string } }) {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Access Denied</div>;

    const verdict = await db.eligibilityVerdict.findUnique({
        where: { id: params.id },
        include: {
            tender: true,
            profile: true
        }
    });

    if (!verdict) notFound();
    if (verdict.userId !== user.id) return <div>Access Denied</div>;

    const clauseResults = (verdict.clauseResults as any[]) || [];
    const documentGaps = (verdict.documentGaps as any[]) || [];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/verdicts" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Verdict Analysis</h1>
                        <p className="text-slate-400 text-sm mt-1">{verdict.tender.projectName || verdict.tender.fileName}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                </div>
            </div>

            {/* Overview Card */}
            <div className={cn(
                "glass-card p-8 border-l-4",
                verdict.overallVerdict === 'ELIGIBLE' ? "border-l-green-500" :
                    verdict.overallVerdict === 'BORDERLINE' ? "border-l-yellow-500" : "border-l-red-500"
            )}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center gap-3">
                            {verdict.overallVerdict === 'ELIGIBLE' ? <ShieldCheck className="w-8 h-8 text-green-400" /> :
                                verdict.overallVerdict === 'BORDERLINE' ? <AlertTriangle className="w-8 h-8 text-yellow-400" /> :
                                    <XCircle className="w-8 h-8 text-red-400" />}
                            <h2 className="text-2xl font-bold text-white">{verdict.overallVerdict}</h2>
                        </div>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            {verdict.overallExplanation || "No explanation provided."}
                        </p>
                    </div>
                    <div className="flex flex-col items-center justify-center p-4 bg-black/40 rounded-xl border border-white/10 min-w-[150px]">
                        <span className="text-3xl font-bold text-white">{(verdict.confidenceScore * 100).toFixed(0)}%</span>
                        <span className="text-xs text-slate-500 uppercase tracking-widest mt-1">Confidence</span>
                    </div>
                </div>
            </div>

            {/* Clause Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold text-white">Clause Analysis</h3>
                    <div className="space-y-4">
                        {clauseResults.map((result, idx) => (
                            <div key={idx} className={cn(
                                "p-4 rounded-xl border transition-all",
                                result.met ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                            )}>
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            {result.met ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                            <span className={cn(
                                                "text-xs font-bold uppercase tracking-wider",
                                                result.met ? "text-green-400" : "text-red-400"
                                            )}>
                                                {result.ruleId === 'turnover' ? 'Financial Criteria' :
                                                    result.ruleId === 'experience_years' ? 'Technical Experience' : 'Compliance Check'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-300 font-medium">{result.explanation}</p>
                                        <div className="mt-2 text-xs text-slate-500 font-mono">
                                            Required: {JSON.stringify(result.value?.required)} | Actual: {JSON.stringify(result.value?.actual)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Items */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white">Recommended Actions</h3>
                    {documentGaps.length > 0 ? (
                        <div className="glass-card p-6">
                            <ul className="space-y-4">
                                {documentGaps.map((doc, idx) => (
                                    <li key={idx} className="flex gap-3 text-sm">
                                        <span className="text-yellow-400 font-bold">•</span>
                                        <div>
                                            <span className="font-medium text-white">{doc.criterion}</span>
                                            <p className="text-slate-400 mt-0.5">{doc.suggestion}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="glass-card p-6 text-center text-slate-500 text-sm">
                            <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-green-500" />
                            <p>No immediate actions required.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
