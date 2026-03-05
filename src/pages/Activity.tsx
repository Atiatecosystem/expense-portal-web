import { useState, useMemo } from "react";
import {
  Activity as ActivityIcon, CheckCircle2, XCircle, FileText, Users,
  GitBranch, Wallet, AlertTriangle, Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { mockAuditLogs } from "@/data/enterprise-mock";
import { format, isToday, isYesterday } from "date-fns";
import { cn } from "@/lib/utils";

const actionIcons: Record<string, React.ReactNode> = {
  approved: <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-approved))]" />,
  rejected: <XCircle className="h-4 w-4 text-[hsl(var(--status-rejected))]" />,
  created: <FileText className="h-4 w-4 text-[hsl(var(--status-published))]" />,
  updated: <Clock className="h-4 w-4 text-[hsl(var(--status-pending))]" />,
  published: <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-published))]" />,
  deactivated: <Users className="h-4 w-4 text-muted-foreground" />,
  exported: <FileText className="h-4 w-4 text-primary" />,
  updated_rate: <Wallet className="h-4 w-4 text-[hsl(var(--status-pending))]" />,
  deleted: <XCircle className="h-4 w-4 text-destructive" />,
};

const Activity = () => {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const actions = useMemo(() => [...new Set(mockAuditLogs.map((l) => l.action))], []);

  const filtered = useMemo(() => {
    return mockAuditLogs.filter((l) => {
      const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === "all" || l.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [search, actionFilter]);

  /* Group by day */
  const grouped = useMemo(() => {
    const groups: { label: string; items: typeof filtered }[] = [];
    const today: typeof filtered = [];
    const yesterday: typeof filtered = [];
    const older: typeof filtered = [];

    filtered.forEach((l) => {
      const d = new Date(l.timestamp);
      if (isToday(d)) today.push(l);
      else if (isYesterday(d)) yesterday.push(l);
      else older.push(l);
    });

    if (today.length) groups.push({ label: "Today", items: today });
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
    if (older.length) groups.push({ label: "Earlier", items: older });
    return groups;
  }, [filtered]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Activity Timeline" description="Enterprise-wide activity feed showing all significant events." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Input placeholder="Search by actor or entity…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-3" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => <SelectItem key={a} value={a}>{a.replace("_", " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {grouped.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 py-12 text-center">
          <ActivityIcon className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No activity found.</p>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.label}>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{group.label}</h3>
            <div className="space-y-0">
              {group.items.map((item, idx) => {
                const isLast = idx === group.items.length - 1;
                return (
                  <div key={item.id} className="relative flex gap-3 pb-5">
                    {!isLast && <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-border" />}
                    <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {actionIcons[item.action] || <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        <span className="font-medium text-foreground">{item.actor}</span>{" "}
                        <span className="text-muted-foreground">{item.action.replace("_", " ")}</span>{" "}
                        <span className="font-medium text-foreground">{item.entity}</span>{" "}
                        <span className="text-muted-foreground">#{item.entityId}</span>
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(item.timestamp), "HH:mm")}
                        </span>
                        <Badge variant="outline" className="text-[10px]">{item.organizationName}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Activity;
