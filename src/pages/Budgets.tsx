import { useState, useMemo } from "react";
import { Wallet, Plus, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import StatsCard from "@/components/StatsCard";
import { mockBudgets } from "@/data/enterprise-mock";
import { Budget, BudgetPeriod } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const periodLabel: Record<BudgetPeriod, string> = {
  [BudgetPeriod.Monthly]: "Monthly",
  [BudgetPeriod.Quarterly]: "Quarterly",
  [BudgetPeriod.Yearly]: "Yearly",
};

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = useMemo(
    () => budgets.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()) || (b.departmentName?.toLowerCase().includes(search.toLowerCase()) ?? false)),
    [budgets, search]
  );

  const totalLimit = budgets.reduce((s, b) => s + b.limit, 0);
  const totalUsed = budgets.reduce((s, b) => s + b.used, 0);
  const overThreshold = budgets.filter((b) => (b.used / b.limit) * 100 >= b.alertThreshold).length;

  const pct = (b: Budget) => Math.round((b.used / b.limit) * 100);
  const isAlert = (b: Budget) => pct(b) >= b.alertThreshold;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Budget Management" description="Set and monitor department and employee budgets.">
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Budget
        </Button>
      </PageHeader>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatsCard title="Total Budget" value={`SAR ${totalLimit.toLocaleString()}`} icon={<Wallet className="h-4 w-4" />} />
        <StatsCard title="Total Spent" value={`SAR ${totalUsed.toLocaleString()}`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatsCard title="Over Threshold" value={String(overThreshold)} icon={<AlertTriangle className="h-4 w-4" />} />
      </div>

      <FilterBar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search budgets…" />

      {/* Budget Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((b) => (
          <Card key={b.id} className={cn(isAlert(b) && "border-destructive/40")}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">{b.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {b.departmentName || b.employeeName} · {periodLabel[b.period]}
                  </CardDescription>
                </div>
                {isAlert(b) && (
                  <Badge variant="destructive" className="gap-1 text-[10px]">
                    <AlertTriangle className="h-3 w-3" /> Alert
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className={cn(
                  "text-xl font-bold",
                  pct(b) >= 90 ? "text-destructive" : pct(b) >= 75 ? "text-[hsl(var(--status-pending))]" : "text-foreground"
                )}>
                  {pct(b)}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {b.currency} {b.used.toLocaleString()} / {b.limit.toLocaleString()}
                </span>
              </div>
              <Progress value={pct(b)} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Remaining: {b.currency} {(b.limit - b.used).toLocaleString()}</span>
                <span>Threshold: {b.alertThreshold}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <Wallet className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No budgets found.</p>
        </div>
      )}

      {/* Create Budget Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Budget</DialogTitle>
            <DialogDescription>Define a new budget for a department or employee.</DialogDescription>
          </DialogHeader>
          <CreateBudgetForm onCreated={(b) => { setBudgets((prev) => [...prev, b]); setShowCreate(false); }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreateBudgetForm = ({ onCreated }: { onCreated: (b: Budget) => void }) => {
  const [form, setForm] = useState({ name: "", limit: "", period: BudgetPeriod.Monthly as BudgetPeriod, threshold: "80", currency: "SAR" });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.limit) { toast.error("Name and limit are required."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const budget: Budget = {
      id: `bgt${Date.now()}`,
      name: form.name,
      organizationId: "org1",
      organizationName: "Atiat Holdings",
      period: form.period,
      limit: Number(form.limit),
      used: 0,
      currency: form.currency,
      alertThreshold: Number(form.threshold),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    onCreated(budget);
    toast.success(`Budget "${form.name}" created.`);
    setLoading(false);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Budget Name *</Label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering Q2 Budget" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Limit *</Label>
            <Input type="number" value={form.limit} onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))} placeholder="0" />
          </div>
          <div className="space-y-1.5">
            <Label>Period</Label>
            <Select value={form.period} onValueChange={(v) => setForm((f) => ({ ...f, period: v as BudgetPeriod }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={BudgetPeriod.Monthly}>Monthly</SelectItem>
                <SelectItem value={BudgetPeriod.Quarterly}>Quarterly</SelectItem>
                <SelectItem value={BudgetPeriod.Yearly}>Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Alert Threshold %</Label>
            <Input type="number" min="0" max="100" value={form.threshold} onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => setForm((f) => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleCreate} disabled={loading}>{loading ? "Creating…" : "Create Budget"}</Button>
      </DialogFooter>
    </>
  );
};

export default Budgets;
