'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FileText, Calendar, IndianRupee, ShieldAlert, CheckCircle, Clock,
    MapPin, AlertTriangle, Download
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import { TenderDocument, ExtractedClause } from '@prisma/client';

export default function TenderDetails({ initialData }: { initialData: TenderDocument & { clauses: ExtractedClause[] } }) {
    const [data, setData] = useState(initialData);
    const router = useRouter();

    // Polling logic if status is PROCESSING
    useEffect(() => {
        if (data.status === 'PROCESSING' || data.status === 'UPLOADED') {
            const interval = setInterval(async () => {
                const res = await fetch(`/api/tenders/${data.id}`); // This endpoint needs to be created or use server action
                // Actually, we can reuse the page fetch logic via server action or just reload page?
                // Let's reload page every 5s for simplicity MVP.
                router.refresh();
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [data.status, data.id, router]);

    if (data.status === 'PROCESSING' || data.status === 'UPLOADED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <h2 className="text-xl font-semibold text-white">Analyzing Tender Document...</h2>
                <p className="text-slate-400 max-w-md">Our AI is extracting eligibility criteria, financial requirements, and risk flags. This usually takes 30-60 seconds.</p>
            </div>
        );
    }

    if (data.status === 'FAILED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <AlertTriangle className="w-16 h-16 text-red-500" />
                <h2 className="text-xl font-semibold text-white">Analysis Failed</h2>
                <p className="text-slate-400 max-w-md">Error: {data.processingError || "Unknown error occurred"}</p>
                <button onClick={() => router.back()} className="text-blue-400 hover:underline">Go Back</button>
            </div>
        );
    }

    // Helper to parse JSON fields safely
    const keyDates = (data.keyDates as any[]) || [];
    const techCriteria = (data.technicalCriteria as any[]) || [];
    const finCriteria = (data.financialCriteria as any[]) || [];
    const riskFlags = (data.riskFlags as any[]) || [];
    const requiredDocs = (data.requiredDocuments as string[]) || [];

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">
                            Analysis Complete
                        </span>
                        <span className="text-xs text-slate-500">ID: {data.tenderNumber || 'N/A'}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white max-w-3xl line-clamp-2" title={data.fileName}>
                        {data.projectName || data.fileName}
                    </h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {data.issuingAuthority || 'Unknown Authority'}</div>
                        <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {data.bidDeadline ? formatDate(data.bidDeadline) : 'N/A'}</div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {/* Mock Export Button */}
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Criteria */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Financial Snapshot */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <StatCard title="Project Value" value={formatCurrency(Number(data.projectValue) || 0)} icon={IndianRupee} />
                        <StatCard title="EMD Amount" value={formatCurrency(Number(data.emdAmount) || 0)} icon={ShieldAlert} />
                        <StatCard title="Turnover Req" value={formatCurrency(Number(data.turnoverReq) || 0)} icon={FileText} />
                    </div>

                    {/* AI Summary */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-400" /> Executive Summary
                        </h3>
                        <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap">
                            {data.summaryText || "No summary available."}
                        </p>
                    </div>

                    {/* Eligibility Criteria Tables */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Qualification Criteria</h3>

                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-3 border-l-2 border-blue-500 pl-2">Financial Requirements</h4>
                                {finCriteria.length > 0 ? (
                                    <CriteriaTable items={finCriteria} />
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No specific financial criteria extracted.</p>
                                )}
                            </div>

                            <div>
                                <h4 className="text-sm font-medium text-slate-400 mb-3 border-l-2 border-purple-500 pl-2">Technical Requirements</h4>
                                {techCriteria.length > 0 ? (
                                    <CriteriaTable items={techCriteria} />
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No specific technical criteria extracted.</p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Key Dates & Risks */}
                <div className="space-y-8">

                    {/* Risk Analysis */}
                    <div className="glass-card p-6 border-l-4 border-l-red-500/50">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-red-400" /> Risk Analysis
                        </h3>
                        {riskFlags.length > 0 ? (
                            <div className="space-y-4">
                                {riskFlags.map((risk, idx) => (
                                    <div key={idx} className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="font-medium text-red-200 text-sm">{risk.flag}</span>
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider",
                                                risk.severity === 'HIGH' ? "bg-red-500 text-white" :
                                                    risk.severity === 'MEDIUM' ? "bg-orange-500 text-white" : "bg-yellow-500 text-black"
                                            )}>
                                                {risk.severity}
                                            </span>
                                        </div>
                                        <p className="text-xs text-red-200/70 mt-1">{risk.explanation}</p>
                                        {risk.clause && <p className="text-[10px] text-slate-500 mt-2 text-right">Ref: {risk.clause}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No critical risks identified.</p>
                            </div>
                        )}
                    </div>

                    {/* Key Dates */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-yellow-400" /> Key Schedule
                        </h3>
                        <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                            {keyDates.map((d, idx) => (
                                <div key={idx} className="relative pl-6">
                                    <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-white/20" />
                                    <p className="text-sm font-medium text-white">{d.event}</p>
                                    <p className="text-xs text-slate-400">{formatDate(d.date)}</p>
                                </div>
                            ))}
                            <div className="relative pl-6">
                                <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-blue-500" />
                                <p className="text-sm font-medium text-white">Bid Submission</p>
                                <p className="text-xs text-blue-400 font-bold">{data.bidDeadline ? formatDate(data.bidDeadline) : 'TBD'}</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon: Icon }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-lg font-bold text-white font-mono">{value}</p>
            </div>
        </div>
    );
}

function CriteriaTable({ items }: { items: any[] }) {
    return (
        <div className="overflow-hidden rounded-lg border border-white/10">
            <table className="w-full text-sm text-left">
                <thead className="bg-white/5 text-slate-400 font-medium">
                    <tr>
                        <th className="px-4 py-3 w-1/3">Criterion</th>
                        <th className="px-4 py-3">Requirement</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                    {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-slate-300 font-medium">{item.criterion}</td>
                            <td className="px-4 py-3 text-slate-400">{item.requirement}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
