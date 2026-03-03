import { useState } from "react";
import {
  GitBranch,
  Plus,
  GripVertical,
  ChevronRight,
  Copy,
  Trash2,
  Shield,
  User as UserIcon,
  Users,
  Zap,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import { mockWorkflows } from "@/data/enterprise-mock";
import { ApprovalWorkflow, WorkflowStep, ApprovalType } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const approvalTypeLabel: Record<ApprovalType, string> = {
  [ApprovalType.RoleBased]: "Role Based",
  [ApprovalType.SpecificUser]: "Specific User",
  [ApprovalType.DepartmentHead]: "Dept. Head",
  [ApprovalType.Dynamic]: "Dynamic (Amount)",
};

const approvalTypeIcon: Record<ApprovalType, React.ReactNode> = {
  [ApprovalType.RoleBased]: <Shield className="h-4 w-4" />,
  [ApprovalType.SpecificUser]: <UserIcon className="h-4 w-4" />,
  [ApprovalType.DepartmentHead]: <Users className="h-4 w-4" />,
  [ApprovalType.Dynamic]: <Zap className="h-4 w-4" />,
};

const Workflows = () => {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>(mockWorkflows);
  const [selected, setSelected] = useState<ApprovalWorkflow | null>(workflows[0] ?? null);
  const [showCreate, setShowCreate] = useState(false);

  const cloneWorkflow = (wf: ApprovalWorkflow) => {
    const cloned: ApprovalWorkflow = {
      ...wf,
      id: `wf${Date.now()}`,
      name: `${wf.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setWorkflows((prev) => [...prev, cloned]);
    setSelected(cloned);
    toast.success("Workflow cloned successfully.");
  };

  const toggleActive = (id: string) => {
    setWorkflows((prev) => prev.map((w) => w.id === id ? { ...w, isActive: !w.isActive } : w));
    const wf = workflows.find((w) => w.id === id);
    toast.success(`Workflow ${wf?.isActive ? "deactivated" : "activated"}.`);
  };

  const moveStep = (wfId: string, stepIdx: number, dir: -1 | 1) => {
    setWorkflows((prev) => prev.map((wf) => {
      if (wf.id !== wfId) return wf;
      const steps = [...wf.steps];
      const target = stepIdx + dir;
      if (target < 0 || target >= steps.length) return wf;
      [steps[stepIdx], steps[target]] = [steps[target], steps[stepIdx]];
      return { ...wf, steps: steps.map((s, i) => ({ ...s, order: i + 1 })) };
    }));
    if (selected) {
      const updated = workflows.find((w) => w.id === wfId);
      if (updated) setSelected({ ...updated });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Approval Workflows" description="Design and manage multi-step expense approval flows.">
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> New Workflow
        </Button>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left — Workflow list */}
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workflows ({workflows.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setSelected(wf)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition-colors",
                  selected?.id === wf.id ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted"
                )}
              >
                <GitBranch className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{wf.name}</p>
                  <p className="text-xs text-muted-foreground">{wf.steps.length} step{wf.steps.length !== 1 ? "s" : ""}</p>
                </div>
                <Badge variant={wf.isActive ? "default" : "secondary"} className="text-[10px]">
                  {wf.isActive ? "Active" : "Inactive"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right — Step Builder */}
        {selected ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">{selected.name}</CardTitle>
                    <CardDescription>{selected.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => cloneWorkflow(selected)}>
                      <Copy className="h-3.5 w-3.5" /> Clone
                    </Button>
                    <Button
                      variant={selected.isActive ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleActive(selected.id)}
                    >
                      {selected.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Approval Steps</CardTitle>
                <CardDescription>Drag to reorder. Each step is evaluated sequentially.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {selected.steps
                  .sort((a, b) => a.order - b.order)
                  .map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex items-start gap-3 rounded-lg border bg-card p-4"
                    >
                      {/* Reorder */}
                      <div className="flex flex-col gap-1 pt-1">
                        <button
                          onClick={() => moveStep(selected.id, idx, -1)}
                          disabled={idx === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                          aria-label="Move step up"
                        >
                          <ArrowUpDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Step number */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {step.order}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{step.name}</p>
                          <Badge variant="outline" className="gap-1 text-[10px]">
                            {approvalTypeIcon[step.approvalType]}
                            {approvalTypeLabel[step.approvalType]}
                          </Badge>
                          {step.required && <Badge className="text-[10px]">Required</Badge>}
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          {step.assigneeName && <span>Assignee: {step.assigneeName}</span>}
                          {step.minAmount != null && <span>Min: SAR {step.minAmount.toLocaleString()}</span>}
                          {step.maxAmount != null && <span>Max: SAR {step.maxAmount.toLocaleString()}</span>}
                          {step.escalationHours && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Escalation: {step.escalationHours}h
                            </span>
                          )}
                          {step.allowDelegation && <span>✓ Delegation allowed</span>}
                          {step.backupApproverName && <span>Backup: {step.backupApproverName}</span>}
                        </div>
                      </div>
                    </div>
                  ))}

                {selected.steps.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No steps configured. Add a step to begin.</p>
                )}
              </CardContent>
            </Card>

            {/* Routing preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Routing Preview</CardTitle>
                <CardDescription>Visual flow of the approval chain.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <div className="flex h-10 items-center rounded-lg bg-muted px-4 text-xs font-medium text-muted-foreground">
                    Submitted
                  </div>
                  {selected.steps.sort((a, b) => a.order - b.order).map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex h-10 items-center gap-2 rounded-lg border bg-card px-4 text-xs font-medium">
                        {approvalTypeIcon[step.approvalType]}
                        {step.name}
                      </div>
                    </div>
                  ))}
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex h-10 items-center rounded-lg bg-primary/10 px-4 text-xs font-medium text-primary">
                    Approved
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="flex min-h-[300px] items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a workflow to view its configuration.</p>
          </Card>
        )}
      </div>

      {/* Create Workflow Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>Define a new approval flow for your organization.</DialogDescription>
          </DialogHeader>
          <CreateWorkflowForm
            onCreated={(wf) => {
              setWorkflows((prev) => [...prev, wf]);
              setSelected(wf);
              setShowCreate(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CreateWorkflowForm = ({ onCreated }: { onCreated: (wf: ApprovalWorkflow) => void }) => {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Workflow name is required."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const wf: ApprovalWorkflow = {
      id: `wf${Date.now()}`,
      name,
      description: desc,
      organizationId: "org1",
      steps: [],
      departmentIds: [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onCreated(wf);
    toast.success(`Workflow "${name}" created.`);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Workflow Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Approval" />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Brief description" />
        </div>
      </div>
      <DialogFooter>
        <Button onClick={handleCreate} disabled={loading}>{loading ? "Creating…" : "Create Workflow"}</Button>
      </DialogFooter>
    </>
  );
};

export default Workflows;
