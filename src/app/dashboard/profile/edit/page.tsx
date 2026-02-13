'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Plus, Trash, AlertCircle } from 'lucide-react';

interface Turnover {
    year: number;
    amount: number;
}

interface Project {
    name: string;
    client: string;
    value: number;
    year: number;
}

interface License {
    type: string;
    number: string;
    issuedBy: string;
    validTo: string;
}

interface ProfileFormData {
    companyName: string;
    gstNumber: string;
    panNumber: string;
    category: string;
    yearsOfExperience: number;
    netWorth: number;
    turnoverHistory: Turnover[];
    pastProjects: Project[];
    licenses: License[];
}

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileFormData>({
        companyName: '',
        gstNumber: '',
        panNumber: '',
        category: '',
        yearsOfExperience: 0,
        netWorth: 0,
        turnoverHistory: [],
        pastProjects: [],
        licenses: []
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('/api/profiles');
                if (res.ok) {
                    const data = await res.json();
                    if (data) {
                        setFormData({
                            companyName: data.companyName || '',
                            gstNumber: data.gstNumber || '',
                            panNumber: data.panNumber || '',
                            category: data.category || '',
                            yearsOfExperience: data.yearsOfExperience || 0,
                            netWorth: data.netWorth ? Number(data.netWorth) : 0,
                            turnoverHistory: data.turnoverHistory || [],
                            pastProjects: data.pastProjects || [],
                            licenses: data.licenses || []
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setFetching(false);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleListChange = <T extends keyof ProfileFormData>(
        listName: T,
        index: number,
        field: string,
        value: any
    ) => {
        setFormData(prev => {
            const list = [...(prev[listName] as any[])];
            list[index] = { ...list[index], [field]: value };
            return { ...prev, [listName]: list };
        });
    };

    const addListItem = <T extends keyof ProfileFormData>(listName: T, template: any) => {
        setFormData(prev => ({
            ...prev,
            [listName]: [...(prev[listName] as any[]), template]
        }));
    };

    const removeListItem = <T extends keyof ProfileFormData>(listName: T, index: number) => {
        setFormData(prev => {
            const list = [...(prev[listName] as any[])];
            list.splice(index, 1);
            return { ...prev, [listName]: list };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Ensure types are correct before sending
        const payload = {
            ...formData,
            yearsOfExperience: Number(formData.yearsOfExperience),
            netWorth: Number(formData.netWorth),
            turnoverHistory: formData.turnoverHistory.map(t => ({ ...t, year: Number(t.year), amount: Number(t.amount) })),
            pastProjects: formData.pastProjects.map(p => ({ ...p, value: Number(p.value), year: Number(p.year) })),
            licenses: formData.licenses
        };

        try {
            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error?.message || 'Failed to save profile');
            }

            router.push('/dashboard/profile');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-white text-center">Loading profile data...</div>;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
            </div>

            {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="glass-card p-6 space-y-6">
                    <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} required />
                        <Input label="Category" name="category" value={formData.category} onChange={handleChange} placeholder="e.g. Class I Contractor" />
                        <Input label="GST Number" name="gstNumber" value={formData.gstNumber} onChange={handleChange} />
                        <Input label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
                        <Input label="Years of Experience" name="yearsOfExperience" type="number" value={formData.yearsOfExperience} onChange={handleChange} />
                        <Input label="Net Worth (₹)" name="netWorth" type="number" value={formData.netWorth} onChange={handleChange} />
                    </div>
                </div>

                {/* Turnover */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="text-lg font-semibold text-white">Turnover History</h3>
                        <button type="button" onClick={() => addListItem('turnoverHistory', { year: new Date().getFullYear(), amount: 0 })} className="btn-secondary text-xs py-1.5 px-3">
                            <Plus className="w-3 h-3 mr-1.5" /> Add Year
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.turnoverHistory.map((t, i) => (
                            <div key={i} className="flex gap-4 items-end bg-white/5 p-4 rounded-xl">
                                <Input label="Fy Year" value={t.year} onChange={(e) => handleListChange('turnoverHistory', i, 'year', Number(e.target.value))} type="number" />
                                <Input label="Amount (₹)" value={t.amount} onChange={(e) => handleListChange('turnoverHistory', i, 'amount', Number(e.target.value))} type="number" />
                                <button type="button" onClick={() => removeListItem('turnoverHistory', i)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors self-center mt-4">
                                    <Trash className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        {formData.turnoverHistory.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No turnover history added yet.</p>}
                    </div>
                </div>

                {/* Past Projects */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="text-lg font-semibold text-white">Past Projects</h3>
                        <button type="button" onClick={() => addListItem('pastProjects', { name: '', client: '', value: 0, year: new Date().getFullYear() })} className="btn-secondary text-xs py-1.5 px-3">
                            <Plus className="w-3 h-3 mr-1.5" /> Add Project
                        </button>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                        {formData.pastProjects.map((p, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 p-5 bg-white/5 rounded-xl relative group border border-white/5 hover:border-white/10 transition-colors">
                                <div className="lg:col-span-4">
                                    <Input label="Project Name" value={p.name} onChange={(e) => handleListChange('pastProjects', i, 'name', e.target.value)} />
                                </div>
                                <div className="lg:col-span-3">
                                    <Input label="Client" value={p.client} onChange={(e) => handleListChange('pastProjects', i, 'client', e.target.value)} />
                                </div>
                                <div className="lg:col-span-2">
                                    <Input label="Value (₹)" value={p.value} onChange={(e) => handleListChange('pastProjects', i, 'value', Number(e.target.value))} type="number" />
                                </div>
                                <div className="lg:col-span-2">
                                    <Input label="Year" value={p.year} onChange={(e) => handleListChange('pastProjects', i, 'year', Number(e.target.value))} type="number" />
                                </div>
                                <div className="lg:col-span-1 flex items-end justify-center">
                                    <button type="button" onClick={() => removeListItem('pastProjects', i)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mb-[2px]">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {formData.pastProjects.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No past projects added yet.</p>}
                    </div>
                </div>

                {/* Licenses */}
                <div className="glass-card p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-white/10 pb-4">
                        <h3 className="text-lg font-semibold text-white">Licenses & Certifications</h3>
                        <button type="button" onClick={() => addListItem('licenses', { type: '', number: '', issuedBy: '', validTo: '' })} className="btn-secondary text-xs py-1.5 px-3">
                            <Plus className="w-3 h-3 mr-1.5" /> Add License
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.licenses.map((l, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 p-5 bg-white/5 rounded-xl border border-white/5">
                                <div className="lg:col-span-3">
                                    <Input label="Type" value={l.type} onChange={(e) => handleListChange('licenses', i, 'type', e.target.value)} placeholder="e.g. Labour" />
                                </div>
                                <div className="lg:col-span-3">
                                    <Input label="License No." value={l.number} onChange={(e) => handleListChange('licenses', i, 'number', e.target.value)} />
                                </div>
                                <div className="lg:col-span-3">
                                    <Input label="Issued By" value={l.issuedBy} onChange={(e) => handleListChange('licenses', i, 'issuedBy', e.target.value)} />
                                </div>
                                <div className="lg:col-span-2">
                                    <Input label="Valid Until" value={l.validTo} onChange={(e) => handleListChange('licenses', i, 'validTo', e.target.value)} type="date" />
                                </div>
                                <div className="lg:col-span-1 flex items-end justify-center">
                                    <button type="button" onClick={() => removeListItem('licenses', i)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mb-[2px]">
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {formData.licenses.length === 0 && <p className="text-sm text-slate-500 italic text-center py-4">No licenses added yet.</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                    <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-slate-300 hover:bg-white/5 rounded-xl transition-colors font-medium">Cancel</button>
                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 px-8 py-2.5 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                        <Save className="w-4 h-4" /> {loading ? 'Saving Changes...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

function Input({ label, className, ...props }: InputProps) {
    return (
        <div className="w-full">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <input
                className={`w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${className || ''}`}
                {...props}
            />
        </div>
    );
}
