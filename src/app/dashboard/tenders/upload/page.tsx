'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.type !== 'application/pdf') {
                setError('Only PDF files are allowed');
                return;
            }
            if (selected.size > 50 * 1024 * 1024) {
                setError('File size must be less than 50MB');
                return;
            }
            setError(null);
            setFile(selected);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/tenders/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await res.json();
            router.push(`/dashboard/tenders/${data.tenderId}`); // Redirect to result page
        } catch (err: any) {
            setError(err.message);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-white">Upload Tender Document</h1>
                <p className="text-slate-400 mt-2">AI will analyze eligibility criteria and generate a compliance report.</p>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-white/5 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-12 h-12 text-slate-500 mb-4 group-hover:text-blue-400 transition-colors" />
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold text-blue-400">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">PDF up to 50MB</p>
                        </div>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <FileText className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                disabled={uploading}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className={cn(
                                "w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                                uploading
                                    ? "bg-blue-600/50 cursor-wait text-white/50"
                                    : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-blue-500/25"
                            )}
                        >
                            {uploading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing Tender (this may take ~30s)...
                                </>
                            ) : (
                                <>
                                    <UploadCloud className="w-4 h-4" />
                                    Start Analysis
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
