import { useState } from "react";
import { Download, TrendingUp, Clock, DollarSign, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import ChartCard from "@/components/ChartCard";
import { monthlyRequestsData, processingTimeData, mockDashboardStats } from "@/data/mock";
import { toast } from "sonner";

const Analytics = () => {
  const [range, setRange] = useState("6m");

  const exportData = (type: "csv" | "pdf") => {
    toast.success(`${type.toUpperCase()} export started. Download will begin shortly.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Analytics" description="Track expense trends and processing metrics.">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
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
        <StatsCard title="Total Volume" value={`SAR ${(44150).toLocaleString()}`} icon={<DollarSign className="h-4 w-4" />} />
        <StatsCard title="Avg. Processing" value="2.4 days" icon={<Clock className="h-4 w-4" />} />
        <StatsCard title="Approval Rate" value="91%" icon={<TrendingUp className="h-4 w-4" />} />
        <StatsCard title="This Month" value={`${mockDashboardStats.pending + 4} requests`} icon={<FileText className="h-4 w-4" />} />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Expense Trends" description="Monthly expense volume (SAR)">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRequestsData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary) / 0.15)"
                  strokeWidth={2}
                />
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
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgDays"
                  stroke="hsl(var(--chart-3))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-3))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default Analytics;
