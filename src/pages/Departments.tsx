import { useState, useMemo } from "react";
import {
  FolderTree,
  Plus,
  Users,
  DollarSign,
  GitBranch,
  ChevronRight,
  ChevronDown,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { mockDepartments, mockWorkflows } from "@/data/enterprise-mock";
import { mockUsers } from "@/data/mock";
import { Department } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Departments = () => {
  const [departments, setDepartments] = useState(mockDepartments);
  const [selected, setSelected] = useState<Department | null>(departments[0] ?? null);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(departments.map((d) => d.id)));

  const filtered = useMemo(
    () => departments.filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())),
    [departments, search]
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const budgetPct = (d: Department) => Math.round((d.budgetUsed / d.budgetLimit) * 100);
  const budgetColor = (pct: number) => pct >= 90 ? "text-destructive" : pct >= 75 ? "text-[hsl(var(--status-pending))]" : "text-[hsl(var(--status-approved))]";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Departments" description="Manage department hierarchy, budgets, and workflow assignments.">
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Department
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left — Department Tree */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search departments…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {filtered.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">No departments found.</p>}
            {filtered.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelected(dept)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  selected?.id === dept.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
              >
                <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{dept.name}</p>
                  <p className="text-xs text-muted-foreground">{dept.code} · {dept.memberCount} members</p>
                </div>
                {!dept.isActive && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right — Department Detail */}
        {selected ? (
          <div className="space-y-4">
            {/* Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{selected.name}</CardTitle>
                    <CardDescription>Code: {selected.code} · Organization: {selected.organizationId === "org1" ? "Atiat Holdings" : "Atiat Technologies"}</CardDescription>
                  </div>
                  <Badge variant={selected.isActive ? "default" : "secondary"}>{selected.isActive ? "Active" : "Inactive"}</Badge>
                </div>
              </CardHeader>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Budget card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <DollarSign className="h-4 w-4" /> Budget Utilization
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className={cn("text-2xl font-bold", budgetColor(budgetPct(selected)))}>{budgetPct(selected)}%</span>
                      <span className="text-xs text-muted-foreground">{selected.currency} {selected.budgetUsed.toLocaleString()} / {selected.budgetLimit.toLocaleString()}</span>
                    </div>
                    <Progress value={budgetPct(selected)} className="h-2" />
                    {budgetPct(selected) >= 90 && <p className="text-xs text-destructive font-medium">⚠ Budget critically low</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Head card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Users className="h-4 w-4" /> Department Head
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">{selected.headName || "Unassigned"}</p>
                  <p className="text-xs text-muted-foreground">{selected.memberCount} team members</p>
                </CardContent>
              </Card>

              {/* Workflow card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <GitBranch className="h-4 w-4" /> Assigned Workflow
                  </div>
                  <p className="mt-3 text-lg font-semibold text-foreground">{selected.workflowName || "None"}</p>
                  {selected.workflowId && <p className="text-xs text-muted-foreground">ID: {selected.workflowId}</p>}
                </CardContent>
              </Card>
            </div>

            {/* Members placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockUsers
                    .filter((u) => u.organizationIds.includes(selected.organizationId))
                    .slice(0, 5)
                    .map((u) => (
                      <div key={u.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">{u.role.replace("_", " ")}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a department to view details.</p>
          </Card>
        )}
      </div>

      {/* Create Department Modal */}
      <CreateDepartmentDialog open={showCreate} onOpenChange={setShowCreate} onCreate={(d) => {
        setDepartments((prev) => [...prev, d]);
        setSelected(d);
        toast.success(`Department "${d.name}" created.`);
      }} />
    </div>
  );
};

/* ── Create Department Dialog ── */
const CreateDepartmentDialog = ({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (d: Department) => void }) => {
  const [form, setForm] = useState({ name: "", code: "", headId: "", budgetLimit: "", currency: "SAR", workflowId: "", active: true });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Department name is required."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const dept: Department = {
      id: `dept${Date.now()}`,
      name: form.name,
      code: form.code || form.name.substring(0, 3).toUpperCase(),
      organizationId: "org1",
      headId: form.headId || undefined,
      headName: mockUsers.find((u) => u.id === form.headId)?.firstName,
      budgetLimit: Number(form.budgetLimit) || 0,
      budgetUsed: 0,
      currency: form.currency,
      workflowId: form.workflowId || undefined,
      workflowName: mockWorkflows.find((w) => w.id === form.workflowId)?.name,
      memberCount: 0,
      isActive: form.active,
      createdAt: new Date().toISOString(),
    };
    onCreate(dept);
    setLoading(false);
    onOpenChange(false);
    setForm({ name: "", code: "", headId: "", budgetLimit: "", currency: "SAR", workflowId: "", active: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
          <DialogDescription>Add a new department to the organization.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Department Name *</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
          </div>
          <div className="space-y-1.5">
            <Label>Code</Label>
            <Input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="Auto-generated" />
          </div>
          <div className="space-y-1.5">
            <Label>Department Head</Label>
            <Select value={form.headId} onValueChange={(v) => setForm((f) => ({ ...f, headId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select head" /></SelectTrigger>
              <SelectContent>{mockUsers.filter((u) => u.isActive).map((u) => <SelectItem key={u.id} value={u.id}>{u.firstName} {u.lastName}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Budget Limit</Label>
            <Input type="number" value={form.budgetLimit} onChange={(e) => setForm((f) => ({ ...f, budgetLimit: e.target.value }))} placeholder="0" />
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
          <div className="space-y-1.5">
            <Label>Approval Workflow</Label>
            <Select value={form.workflowId} onValueChange={(v) => setForm((f) => ({ ...f, workflowId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select workflow" /></SelectTrigger>
              <SelectContent>{mockWorkflows.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
            <Label>Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading}>{loading ? "Creating…" : "Create Department"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Departments;
