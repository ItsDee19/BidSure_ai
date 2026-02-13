import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ShieldCheck, AlertTriangle, Activity } from "lucide-react";

export function DashboardStats() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Total Tenders</CardTitle>
                    <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">12</div>
                    <p className="text-xs text-slate-500">+2 from last month</p>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Winning Probability</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">78%</div>
                    <p className="text-xs text-slate-500">Avg. score across bids</p>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Eligible</CardTitle>
                    <ShieldCheck className="h-4 w-4 text-teal-400" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">8</div>
                    <p className="text-xs text-slate-500">Ready for bidding</p>
                </CardContent>
            </Card>
            <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">High Risk</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-white">2</div>
                    <p className="text-xs text-slate-500">Requires attention</p>
                </CardContent>
            </Card>
        </div>
    );
}
