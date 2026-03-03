import { useState } from "react";
import { Download, TrendingUp, Clock, DollarSign, FileText, BarChart3, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import { monthlyRequestsData, processingTimeData, mockDashboardStats } from "@/data/mock";
import { departmentComparisonData, approverPerformanceData } from "@/data/enterprise-mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontSize: "12px",
};

const Analytics = () => {
  const [range, setRange] = useState("6m");

  const exportData = (type: "csv" | "pdf") => {
    toast.success(`${type.toUpperCase()} export started. Download will begin shortly.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Comprehensive expense analytics, approver performance, and budget insights.">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1m">Last Month</SelectItem>
            <SelectItem value="3m">Last 3 Months</SelectItem>
            <SelectItem value="6m">Last 6 Months</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportData("csv")}>
          <Download className="h-4 w-4" /> CSV
        </Button>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => exportData("pdf")}>
          <Download className="h-4 w-4" /> PDF
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Volume" value={`SAR ${(312150).toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatsCard title="Avg. Processing" value="2.4 days" icon={<Clock className="h-4 w-4" />} />
        <StatsCard title="Approval Rate" value="91%" icon={<TrendingUp className="h-4 w-4" />} />
        <StatsCard title="Rejection Rate" value="9%" icon={<XCircle className="h-4 w-4" />} />
      </div>

      {/* Expense Trends + Processing Time */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expense Trends" description="Monthly expense volume (SAR)">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRequestsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Processing Time" description="Average days to process requests">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processingTimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="avgDays" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ fill: "hsl(var(--chart-3))", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Department Budget Comparison */}
      <ChartCard title="Department Budget Utilization" description="Spent vs allocated budget by department">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentComparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="budget" fill="hsl(var(--muted-foreground) / 0.2)" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Approver Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Approver Performance
          </CardTitle>
          <CardDescription>Response times and decision metrics for approval chain participants.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approver</TableHead>
                <TableHead>Avg. Response Time</TableHead>
                <TableHead>Total Reviewed</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Rejected</TableHead>
                <TableHead>Approval Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approverPerformanceData.map((a) => {
                const rate = Math.round((a.approved / a.total) * 100);
                return (
                  <TableRow key={a.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {a.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium">{a.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-xs", a.avgHours > 10 ? "border-destructive/40 text-destructive" : "")}>
                        {a.avgHours}h
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{a.total}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--status-approved))]">{a.approved}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--status-rejected))]">{a.rejected}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={rate} className="h-2 w-16" />
                        <span className="text-xs text-muted-foreground">{rate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
