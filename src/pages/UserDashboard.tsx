import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import StatusBadge from "@/components/StatusBadge";
import { mockExpenseRequests, mockDashboardStats } from "@/data/mock";
import { format } from "date-fns";
import { RequestStatus } from "@/types";

interface UserStatCardProps {
    title: string;
    value: string | number;
    borderColor: string;
}

const UserStatCard = ({ title, value, borderColor }: UserStatCardProps) => (
    <div className={`bg-white rounded-xl shadow-sm border border-border/50 p-6 flex flex-col gap-2 relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 right-0 h-1 ${borderColor}`} />
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-semibold text-foreground">{value}</p>
    </div>
);

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    // In a real app we would compute this from actual user's data
    // Using mock data and mapping to the visual representation from screenshot
    const stats = {
        total: 28,
        pending: 5,
        approved: 5,
        declined: 5,
    };

    const recentRequests = useMemo(() => {
        let filtered = [...mockExpenseRequests].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (searchTerm) {
            filtered = filtered.filter(
                (req) =>
                    req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.title.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter((req) => req.status === statusFilter);
        }

        return filtered;
    }, [searchTerm, statusFilter]);

    // Map to statuses from screenshot:
    // We'll visually map some to display exactly as needed if matching the screenshot's complexity
    const getCustomStatusBadge = (status: RequestStatus) => {
        // Overriding specific display for matching exact screenshot cases when rendering StatusBadge
        return <StatusBadge status={status} />;
    };

    return (
        <div className="flex flex-col gap-8 max-w-[1400px] mx-auto w-full p-2 md:p-6 bg-[#f9f9f9] min-h-[calc(100vh-theme(spacing.16))]">
            {/* ── Header ── */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold text-foreground tracking-tight">
                    Welcome Back {user?.firstName || "Sarah"},
                </h1>
            </div>

            {/* ── Metric Cards ── */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <UserStatCard
                    title="Total Requests Submitted"
                    value={stats.total}
                    borderColor="bg-slate-400"
                />
                <UserStatCard
                    title="Pending Approval"
                    value={stats.pending}
                    borderColor="bg-orange-400"
                />
                <UserStatCard
                    title="Approved Requests"
                    value={stats.approved}
                    borderColor="bg-green-600"
                />
                <UserStatCard
                    title="Declined"
                    value={stats.declined}
                    borderColor="bg-red-500"
                />
            </div>

            {/* ── Recent Requests Section ── */}
            <div className="bg-white rounded-xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
                {/* Section Header & Filters */}
                <div className="p-6 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-medium text-foreground">Recent Requests</h2>
                        <Button
                            onClick={() => navigate("/dashboard/requests/new")}
                            className="bg-[#0e4e2a] hover:bg-[#0c4021] text-white shadow-md gap-2 rounded-md"
                        >
                            <Plus className="h-4 w-4" />
                            Create A Request
                        </Button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-4 w-full">
                        <div className="relative w-full sm:w-[250px]">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search"
                                className="pl-9 h-10 w-full bg-transparent border-input"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Select defaultValue="all">
                            <SelectTrigger className="w-full sm:w-[180px] h-10 bg-transparent">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Any Date</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">This Week</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[150px] h-10 bg-transparent">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value={RequestStatus.PendingApproval}>Pending</SelectItem>
                                <SelectItem value={RequestStatus.Approved}>Approved</SelectItem>
                                <SelectItem value={RequestStatus.Rejected}>Declined</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-100">
                            <TableRow className="border-b-0 hover:bg-slate-100">
                                <TableHead className="font-medium text-slate-700 h-12">Ref No</TableHead>
                                <TableHead className="font-medium text-slate-700 h-12">Date</TableHead>
                                <TableHead className="font-medium text-slate-700 h-12">Amount</TableHead>
                                <TableHead className="font-medium text-slate-700 h-12">Approval Stage</TableHead>
                                <TableHead className="font-medium text-slate-700 h-12">Status</TableHead>
                                <TableHead className="font-medium text-slate-700 h-12">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentRequests.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                        No requests found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                recentRequests.map((req, i) => {
                                    // Generate deterministic "fake" ref ID like EXP-024
                                    const refNo = `EXP-02${4 + i}`;
                                    // Generating approval stages based on index to match screenshot variety
                                    const stages = ["Completed", "Declined", "At Finance", "At Internal Control", "At Co-operate Services", "At Supervisor"];
                                    const stage = stages[i % stages.length];

                                    return (
                                        <TableRow key={req.id} className="border-b border-border/40 hover:bg-slate-50 transition-colors">
                                            <TableCell className="text-muted-foreground text-sm py-4">{refNo}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-4">
                                                {format(new Date(req.date), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-4">
                                                {req.currency === "NGN" ? "₦" : req.currency === "EUR" ? "€" : req.currency === "GBP" ? "£" : "$"}
                                                {req.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm py-4">{stage}</TableCell>
                                            <TableCell className="py-4">
                                                {/* Using logic to render realistic badges that match screenshot slightly more */}
                                                {stage === "Completed" && <StatusBadge status={RequestStatus.Approved} />}
                                                {stage === "Declined" && <StatusBadge status={RequestStatus.Rejected} />}
                                                {stage === "At Finance" && <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700 border-purple-200">Finance Review</span>}
                                                {stage === "At Internal Control" && <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700 border-slate-200">Internal Control</span>}
                                                {stage === "At Co-operate Services" && <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-[#e6dbd1] text-[#7a5e42] border-[#d4c5b6]">Co-operative Service</span>}
                                                {stage === "At Supervisor" && <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 border-blue-200">Supervisor</span>}
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs h-8 text-[#0e4e2a] border-[#0e4e2a]/30 hover:bg-[#0e4e2a]/5"
                                                    onClick={() => navigate(`/dashboard/requests/${req.id}`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Pagination Footer */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-border/40 text-sm text-muted-foreground">
                    <div>Showing 1 to 10 of 391 results</div>
                    <div className="flex items-center gap-1 mt-4 sm:mt-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" disabled>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-[#0e4e2a] border-[#0e4e2a]">1</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">2</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">3</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">4</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">5</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">6</Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
