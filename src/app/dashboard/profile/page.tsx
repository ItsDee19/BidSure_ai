import Link from 'next/link';
import { db } from '@/lib/db';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Building2, FileText, CheckCircle, AlertCircle, Edit } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { ContractorProfile } from '@prisma/client';

export default async function ProfilePage() {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Access Denied</div>;

    const profile = await db.contractorProfile.findUnique({
        where: { userId: user.id }
    });

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Building2 className="w-16 h-16 text-slate-500" />
                <h2 className="text-xl font-bold text-white">No Profile Found</h2>
                <p className="text-slate-400">Complete your contractor profile to enable eligibility checks.</p>
                <Link href="/dashboard/profile/edit" className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg">
                    Create Profile
                </Link>
            </div>
        );
    }

    // Helper to parse JSON fields
    const safeJson = (val: any) => val as any[];
    const pastProjects = safeJson(profile.pastProjects) || [];
    const turnoverHistory = safeJson(profile.turnoverHistory) || [];
    const licenses = safeJson(profile.licenses) || [];

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">{profile.companyName}</h1>
                    <p className="text-slate-400 text-sm mt-1">{profile.category || 'Uncategorized'} • {profile.yearsOfExperience || 0} Years Experience</p>
                </div>
                <Link href="/dashboard/profile/edit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm">
                    <Edit className="w-4 h-4" /> Edit Profile
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Financials */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Financial Overview</h3>
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-400">Net Worth</p>
                            <p className="text-xl font-bold text-white">{profile.netWorth ? formatCurrency(Number(profile.netWorth)) : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-400 mb-2">Turnover History</p>
                            {turnoverHistory.length > 0 ? (
                                <div className="space-y-2">
                                    {turnoverHistory.map((t: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0">
                                            <span className="text-slate-300">FY {t.year}</span>
                                            <span className="font-medium text-white">{formatCurrency(t.amount)}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No history added</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Licenses & Compliance */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Compliance & Licenses</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p className="text-xs text-slate-400 uppercase">GST Number</p>
                            <p className="font-mono text-white">{profile.gstNumber || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase">PAN Number</p>
                            <p className="font-mono text-white">{profile.panNumber || 'N/A'}</p>
                        </div>
                    </div>

                    <h4 className="text-sm font-medium text-slate-400 mb-2">Active Licenses</h4>
                    {licenses.length > 0 ? (
                        <div className="space-y-2">
                            {licenses.map((l: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/10">
                                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{l.type}</p>
                                        <p className="text-xs text-slate-400">Valid to: {l.validTo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-yellow-500 text-sm">
                            <AlertCircle className="w-4 h-4" /> No licenses uploaded
                        </div>
                    )}
                </div>

                {/* Past Projects */}
                <div className="glass-card p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4">Work Experience</h3>
                    {pastProjects.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pastProjects.map((p: any, idx: number) => (
                                <div key={idx} className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                    <h4 className="font-medium text-white truncate">{p.name}</h4>
                                    <p className="text-xs text-blue-400 mt-0.5">{p.client}</p>
                                    <div className="mt-3 flex justify-between text-sm">
                                        <span className="text-slate-400">{p.year}</span>
                                        <span className="font-bold text-white">{formatCurrency(p.value)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No past projects added</p>
                    )}
                </div>

            </div>
        </div>
    );
}
