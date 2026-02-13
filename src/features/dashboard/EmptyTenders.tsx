import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyTenders() {
    return (
        <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-white/10 rounded-xl bg-white/5 p-8 text-center animate-in fade-in-50">
            <div className="bg-blue-500/20 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tenders analyzed yet</h3>
            <p className="text-slate-400 max-w-sm mb-6">
                Upload your first tender document to get AI-powered eligibility insights and winning probability.
            </p>
            <Link href="/dashboard/tenders/upload">
                <Button className="btn-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Analyze First Tender
                </Button>
            </Link>
        </div>
    );
}
