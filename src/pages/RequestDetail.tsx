import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Download, CheckCircle2, XCircle, Clock,
  AlertTriangle, RotateCcw, Upload,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { mockExpenseRequests } from "@/data/mock";
import { RequestStatus } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

/* ── Approval chain mock data ── */
const mockApprovalChain = [
  { step: 1, role: "Head of Department (HOD)", name: "Michael Okafor", date: "2026-03-01", status: "approved", comment: "Approved" },
  { step: 2, role: "Co-operate Services", name: "Jennifer Adeyemi", date: "2026-03-01", status: "approved", comment: "Documentation Complete" },
  { step: 3, role: "Internal Control", name: "David Nwosu", date: "2026-03-01", status: "approved", comment: "Verified" },
  { step: 4, role: "Finance Department", name: "David Nwosu", date: "2026-03-01", status: "finance_review", comment: "Awaiting finance approval" },
];

const statusColors: Record<string, string> = {
  approved: "bg-[hsl(var(--status-approved))]/10 text-[hsl(var(--status-approved))] border-[hsl(var(--status-approved))]/30",
  rejected: "bg-[hsl(var(--status-rejected))]/10 text-[hsl(var(--status-rejected))] border-[hsl(var(--status-rejected))]/30",
  pending: "bg-[hsl(var(--status-pending))]/10 text-[hsl(var(--status-pending))] border-[hsl(var(--status-pending))]/30",
  finance_review: "bg-[hsl(var(--status-published))]/10 text-[hsl(var(--status-published))] border-[hsl(var(--status-published))]/30",
  escalated: "bg-destructive/10 text-destructive border-destructive/30",
};

const numberToWords = (n: number): string => {
  if (n === 245000) return "Two Hundred & Forty Five Thousand";
  if (n >= 1000) return `${Math.floor(n / 1000)} Thousand`;
  return String(n);
};

const RequestDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const request = mockExpenseRequests.find((r) => r.id === id) || mockExpenseRequests[0];
  const [showAction, setShowAction] = useState<"approve" | "reject" | "correction" | null>(null);
  const [actionComment, setActionComment] = useState("");

  if (!request) {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <AlertTriangle className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Request not found.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard/requests")}>Back to Requests</Button>
      </div>
    );
  }

  const handleAction = (action: string) => {
    if (action === "reject" && !actionComment.trim()) {
      toast.error("Please provide a reason for rejection.");
      return;
    }
    toast.success(`Request ${action === "approve" ? "approved" : action === "reject" ? "rejected" : "sent back for correction"}.`);
    setShowAction(null);
    setActionComment("");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Request #{request.id.toUpperCase()}</h1>
          <StatusBadge status={request.status} />
        </div>
        <Button variant="outline" className="gap-2" onClick={() => navigate("/dashboard/requests")}>
          <ArrowLeft className="h-4 w-4" /> Back to Requests
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column — Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Expense Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Expense Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Type of Expenditure" value="Travel & Operation" />
              <InfoField label="Submitted Date" value={format(new Date(request.date), "MMMM d, yyyy")} />
              <InfoField label="Reference Number" value={request.id.toUpperCase()} />
              <InfoField label="Amount" value={`${request.currency} ${request.amount.toLocaleString()}`} />
              <InfoField label="Amount in Words" value={numberToWords(request.amount)} />
              <InfoField label="Description" value={request.description} />
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <InfoField label="Beneficiary Name" value={request.beneficiaryName} />
              <InfoField label="Bank Name" value={request.bankName} />
              <InfoField label="Account Number" value={request.accountNumber} />
            </CardContent>
          </Card>

          {/* Supporting Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Supporting Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.documents.length > 0 ? (
                request.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 rounded-lg border bg-muted/20 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{(doc.size / 1024).toFixed(0)}kb</p>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">No documents attached.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column — Approval Chain & Actions */}
        <div className="space-y-6">
          {/* Approval Chain Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Approval Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {mockApprovalChain.map((step, idx) => {
                  const isLast = idx === mockApprovalChain.length - 1;
                  const statusLabel = step.status === "finance_review" ? "Finance Review" : step.status.charAt(0).toUpperCase() + step.status.slice(1);
                  return (
                    <div key={step.step} className="relative flex gap-3 pb-6">
                      {/* Vertical line */}
                      {!isLast && (
                        <div className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-border" />
                      )}
                      {/* Icon */}
                      <div className={cn(
                        "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        step.status === "approved" ? "bg-[hsl(var(--status-approved))]/10" : "bg-muted",
                      )}>
                        {step.status === "approved" ? (
                          <CheckCircle2 className="h-4 w-4 text-[hsl(var(--status-approved))]" />
                        ) : step.status === "rejected" ? (
                          <XCircle className="h-4 w-4 text-[hsl(var(--status-rejected))]" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {step.step}. {step.role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {step.name} , {format(new Date(step.date), "MMMM d, yyyy")}
                        </p>
                        <Badge variant="outline" className={cn("mt-1.5 text-[10px]", statusColors[step.status] || "")}>
                          {statusLabel}
                        </Badge>
                        {step.comment && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Comment: {step.comment}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Finance Actions */}
          {request.status === RequestStatus.PendingApproval && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full gap-2" onClick={() => setShowAction("approve")}>
                  <CheckCircle2 className="h-4 w-4" /> Approve Payment
                </Button>
                <Button variant="destructive" className="w-full gap-2" onClick={() => setShowAction("reject")}>
                  <XCircle className="h-4 w-4" /> Reject Request
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => setShowAction("correction")}>
                  <RotateCcw className="h-4 w-4" /> Send Back For Correction
                </Button>
                <Button variant="outline" className="w-full gap-2" onClick={() => toast.info("Request for more documents sent.")}>
                  <Upload className="h-4 w-4" /> Request More Documents
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={!!showAction} onOpenChange={(open) => !open && setShowAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showAction === "approve" ? "Approve Payment" : showAction === "reject" ? "Reject Request" : "Send Back For Correction"}
            </DialogTitle>
            <DialogDescription>
              {showAction === "reject" ? "A reason is required for rejection." : "Add an optional comment."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={showAction === "reject" ? "Reason for rejection *" : "Add a comment (optional)…"}
            value={actionComment}
            onChange={(e) => setActionComment(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAction(null)}>Cancel</Button>
            <Button
              variant={showAction === "reject" ? "destructive" : "default"}
              onClick={() => handleAction(showAction!)}
            >
              {showAction === "approve" ? "Approve" : showAction === "reject" ? "Reject" : "Send Back"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoField = ({ label, value }: { label: string; value: string }) => (
  <div className="space-y-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default RequestDetail;
