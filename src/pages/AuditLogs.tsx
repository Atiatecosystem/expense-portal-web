import { useState, useMemo } from "react";
import { ScrollText, Search, Eye, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import PageHeader from "@/components/PageHeader";
import { mockAuditLogs } from "@/data/enterprise-mock";
import { AuditLogEntry } from "@/types";
import { format } from "date-fns";

const actionColors: Record<string, string> = {
  approved: "bg-[hsl(var(--status-approved))]/10 text-[hsl(var(--status-approved))]",
  rejected: "bg-[hsl(var(--status-rejected))]/10 text-[hsl(var(--status-rejected))]",
  created: "bg-[hsl(var(--status-published))]/10 text-[hsl(var(--status-published))]",
  updated: "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))]",
  deleted: "bg-destructive/10 text-destructive",
  deactivated: "bg-muted text-muted-foreground",
  exported: "bg-primary/10 text-primary",
  published: "bg-[hsl(var(--status-published))]/10 text-[hsl(var(--status-published))]",
  updated_rate: "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))]",
};

const AuditLogs = () => {
  const [logs] = useState<AuditLogEntry[]>(mockAuditLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [detail, setDetail] = useState<AuditLogEntry | null>(null);

  const actions = useMemo(() => [...new Set(logs.map((l) => l.action))], [logs]);

  const filtered = useMemo(() => {
    return logs.filter((l) => {
      const matchSearch = l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.entity.toLowerCase().includes(search.toLowerCase()) ||
        l.entityId.toLowerCase().includes(search.toLowerCase());
      const matchAction = actionFilter === "all" || l.action === actionFilter;
      return matchSearch && matchAction;
    });
  }, [logs, search, actionFilter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Audit Logs" description="Complete activity trail for compliance and governance." />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by actor, entity…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actions.map((a) => (
              <SelectItem key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1).replace("_", " ")}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No audit logs found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {log.actor.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium">{log.actor}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${actionColors[log.action] || ""}`}>
                        {log.action.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.entity} <span className="text-muted-foreground">#{log.entityId}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.organizationName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{log.ipAddress}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDetail(log)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Metadata drawer */}
      <Sheet open={!!detail} onOpenChange={(open) => !open && setDetail(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Audit Log Detail</SheetTitle>
            <SheetDescription>{detail?.actor} — {detail?.action}</SheetDescription>
          </SheetHeader>
          {detail && (
            <div className="mt-6 space-y-4">
              <DetailRow label="Actor" value={detail.actor} />
              <DetailRow label="Action" value={detail.action} />
              <DetailRow label="Entity" value={`${detail.entity} #${detail.entityId}`} />
              <DetailRow label="Organization" value={detail.organizationName} />
              <DetailRow label="IP Address" value={detail.ipAddress} />
              <DetailRow label="Timestamp" value={format(new Date(detail.timestamp), "PPpp")} />
              {detail.metadata && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Metadata</p>
                  <pre className="rounded-lg bg-muted p-3 text-xs text-foreground overflow-x-auto">
                    {JSON.stringify(detail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

export default AuditLogs;
