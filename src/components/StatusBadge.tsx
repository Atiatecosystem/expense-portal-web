import { RequestStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  [RequestStatus.Draft]: { label: "Draft", className: "bg-muted text-muted-foreground border-transparent" },
  [RequestStatus.PendingApproval]: { label: "Pending", className: "bg-status-pending/15 text-status-pending border-status-pending/30" },
  [RequestStatus.Approved]: { label: "Approved", className: "bg-status-approved/15 text-status-approved border-status-approved/30" },
  [RequestStatus.Rejected]: { label: "Rejected", className: "bg-status-rejected/15 text-status-rejected border-status-rejected/30" },
  [RequestStatus.Published]: { label: "Published", className: "bg-status-published/15 text-status-published border-status-published/30" },
};

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const cfg = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("text-xs font-medium", cfg.className, className)}>
      {cfg.label}
    </Badge>
  );
};

export { StatusBadge };
export default StatusBadge;
