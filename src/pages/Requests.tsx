import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import { mockExpenseRequests } from "@/data/mock";
import { ExpenseRequest, RequestStatus } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const statusOptions = [
  { label: "All Statuses", value: "all" },
  { label: "Draft", value: RequestStatus.Draft },
  { label: "Pending", value: RequestStatus.PendingApproval },
  { label: "Approved", value: RequestStatus.Approved },
  { label: "Rejected", value: RequestStatus.Rejected },
  { label: "Published", value: RequestStatus.Published },
];

const Requests = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<ExpenseRequest | null>(mockExpenseRequests[0] || null);
  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [comment, setComment] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const filtered = useMemo(() => {
    return mockExpenseRequests.filter((r) => {
      const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.submittedBy.firstName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const handleApprove = () => {
    toast.success(`Request "${selected?.title}" approved.`);
    setShowApprove(false);
    setComment("");
  };

  const handleReject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    toast.success(`Request "${selected?.title}" rejected.`);
    setShowReject(false);
    setRejectReason("");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Expense Requests" description="Review and manage expense submissions.">
        <Button onClick={() => navigate("/dashboard/requests/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Request
        </Button>
      </PageHeader>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search requests…"
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions,
            placeholder: "Filter by status",
          },
        ]}
      />

      {/* ── Split Layout ── */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left — List */}
        <div className="space-y-2 lg:col-span-2">
          {filtered.length === 0 ? (
            <Card className="py-12 text-center">
              <p className="text-sm text-muted-foreground">No requests found.</p>
            </Card>
          ) : (
            filtered.map((req) => (
              <Card
                key={req.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  selected?.id === req.id && "ring-2 ring-primary"
                )}
                onClick={() => setSelected(req)}
              >
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{req.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {req.submittedBy.firstName} {req.submittedBy.lastName} · {req.organizationName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-foreground">
                      {req.currency} {req.amount.toLocaleString()}
                    </span>
                    <StatusBadge status={req.status} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right — Detail */}
        <div className="lg:col-span-3">
          {selected ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{selected.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{selected.description}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Info grid */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Submitted By" value={`${selected.submittedBy.firstName} ${selected.submittedBy.lastName}`} />
                  <InfoRow label="Organization" value={selected.organizationName} />
                  <InfoRow label="Amount" value={`${selected.currency} ${selected.amount.toLocaleString()}`} />
                  <InfoRow label="Date" value={format(new Date(selected.date), "MMM dd, yyyy")} />
                  <InfoRow label="Beneficiary" value={selected.beneficiaryName} />
                  <InfoRow label="Bank" value={`${selected.bankName} — ${selected.accountNumber}`} />
                </div>

                {/* Workflow progress */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Workflow Progress</p>
                  <div className="flex items-center gap-1">
                    {["Draft", "Pending", "Approved", "Published"].map((step, i) => {
                      const stepStatuses = [RequestStatus.Draft, RequestStatus.PendingApproval, RequestStatus.Approved, RequestStatus.Published];
                      const currentIndex = stepStatuses.indexOf(selected.status);
                      const isRejected = selected.status === RequestStatus.Rejected;
                      const isActive = i <= currentIndex;
                      return (
                        <div key={step} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className={cn(
                              "h-2 w-full rounded-full",
                              isRejected && i > 0 ? "bg-destructive/30" : isActive ? "bg-primary" : "bg-muted"
                            )}
                          />
                          <span className="text-[10px] text-muted-foreground">{step}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Timeline */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Timeline</p>
                  <div className="space-y-3">
                    {selected.timeline.map((event) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                          <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm">
                            <span className="font-medium text-foreground">{event.actor}</span>{" "}
                            <span className="text-muted-foreground">{event.action}</span>
                          </p>
                          {event.comment && (
                            <p className="mt-0.5 text-xs text-muted-foreground italic">"{event.comment}"</p>
                          )}
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(event.timestamp), "MMM dd, yyyy · HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comments */}
                {selected.comments.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Comments</p>
                      <div className="space-y-3">
                        {selected.comments.map((c) => (
                          <div key={c.id} className="flex gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {c.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{c.userName}</p>
                              <p className="text-sm text-muted-foreground">{c.content}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {format(new Date(c.createdAt), "MMM dd, yyyy · HH:mm")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                {selected.status === RequestStatus.PendingApproval && (
                  <>
                    <Separator />
                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" onClick={() => setShowApprove(true)}>
                        <CheckCircle2 className="h-4 w-4" /> Approve
                      </Button>
                      <Button variant="destructive" className="flex-1 gap-2" onClick={() => setShowReject(true)}>
                        <XCircle className="h-4 w-4" /> Reject
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">Select a request to view details.</p>
            </Card>
          )}
        </div>
      </div>

      {/* ── Approve Dialog ── */}
      <Dialog open={showApprove} onOpenChange={setShowApprove}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Request</DialogTitle>
            <DialogDescription>Optionally add a comment with your approval.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add a comment (optional)…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprove(false)}>Cancel</Button>
            <Button onClick={handleApprove}>Approve</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reject Dialog ── */}
      <Dialog open={showReject} onOpenChange={setShowReject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Request</DialogTitle>
            <DialogDescription>A reason is required for rejection.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection *"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReject(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default Requests;
