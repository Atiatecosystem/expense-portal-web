import { useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  FileText,
  Users,
  Building,
  Clock,
  CheckCircle2,
  BarChart3,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import StatsCard from "@/components/StatsCard";
import PageHeader from "@/components/PageHeader";
import ChartCard from "@/components/ChartCard";
import {
  mockDashboardStats,
  mockExpenseRequests,
  monthlyRequestsData,
  orgDistributionData,
} from "@/data/mock";
import { format } from "date-fns";

const PIE_COLORS = [
  "hsl(153, 42%, 18%)",
  "hsl(142, 72%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(217, 91%, 60%)",
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const stats = mockDashboardStats;

  const recentRequests = useMemo(
    () =>
      [...mockExpenseRequests]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    []
  );

  if (user?.role === UserRole.Employee || user?.role === UserRole.Manager) {
    return <Navigate to="/dashboard/user" replace />;
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.firstName}. Here's your overview.`}
      >
        <Button onClick={() => navigate("/dashboard/requests/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </PageHeader>

      {/* ── Metric Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatsCard title="Total Requests" value={stats.totalRequests} icon={<FileText className="h-4 w-4" />} />
        <StatsCard title="Active Users" value={stats.activeUsers} icon={<Users className="h-4 w-4" />} />
        <StatsCard title="Organizations" value={stats.organizations} icon={<Building className="h-4 w-4" />} />
        <StatsCard title="Pending" value={stats.pending} icon={<Clock className="h-4 w-4" />} />
        <StatsCard title="Approved" value={stats.approved} icon={<CheckCircle2 className="h-4 w-4" />} />
        <StatsCard title="Processed" value={stats.processed} icon={<BarChart3 className="h-4 w-4" />} />
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Requests Over Time" description="Monthly expense request volume">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRequestsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="requests" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Organization Distribution" description="Requests by subsidiary">
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orgDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name.split(" ")[1] || name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {orgDistributionData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── Recent Requests Table ── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Recent Requests</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/requests")} className="gap-1 text-xs">
            View All <ArrowUpRight className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden sm:table-cell">Organization</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentRequests.map((req) => (
                <TableRow key={req.id} className="cursor-pointer" onClick={() => navigate("/dashboard/requests")}>
                  <TableCell className="font-medium">{req.title}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{req.organizationName}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {format(new Date(req.date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {req.currency} {req.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={req.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
