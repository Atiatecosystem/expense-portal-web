import { useState, useMemo } from "react";
import { Download, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import { mockPayments } from "@/data/mock";
import { PaymentRecord } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

const paymentStatusConfig: Record<PaymentRecord["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending: { label: "Pending", variant: "outline", icon: <Clock className="h-3 w-3" /> },
  processing: { label: "Processing", variant: "secondary", icon: <Loader2 className="h-3 w-3 animate-spin" /> },
  completed: { label: "Completed", variant: "default", icon: <CheckCircle2 className="h-3 w-3" /> },
  failed: { label: "Failed", variant: "destructive", icon: <AlertCircle className="h-3 w-3" /> },
};

const Payments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return mockPayments.filter((p) => {
      const matchSearch = p.requestTitle.toLowerCase().includes(search.toLowerCase()) ||
        p.beneficiary.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((p) => p.id)));
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" description="Track and manage payment processing.">
        <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.success("Export started.")}>
          <Download className="h-4 w-4" /> Export
        </Button>
      </PageHeader>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search payments…"
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Completed", value: "completed" },
              { label: "Failed", value: "failed" },
            ],
            placeholder: "Status",
          },
        ]}
      >
        {selectedIds.size > 0 && (
          <Button size="sm" variant="secondary" onClick={() => { setSelectedIds(new Set()); toast.success("Bulk action applied."); }}>
            Process Selected ({selectedIds.size})
          </Button>
        )}
      </FilterBar>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selectedIds.size === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Request</TableHead>
              <TableHead className="hidden sm:table-cell">Beneficiary</TableHead>
              <TableHead className="hidden md:table-cell">Organization</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((pay) => {
              const cfg = paymentStatusConfig[pay.status];
              return (
                <TableRow key={pay.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(pay.id)}
                      onCheckedChange={() => toggleSelect(pay.id)}
                      aria-label={`Select ${pay.requestTitle}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{pay.requestTitle}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{pay.beneficiary}</TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{pay.organizationName}</TableCell>
                  <TableCell className="text-right font-medium">
                    {pay.currency} {pay.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={cfg.variant} className="gap-1">
                      {cfg.icon} {cfg.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {format(new Date(pay.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("View details")}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info("Download receipt")}>Download Receipt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Payments;
