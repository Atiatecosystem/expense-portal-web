import { useState, useMemo } from "react";
import {
  FileBarChart, Search, Download, Filter, Eye, MoreHorizontal,
  CheckCircle2, XCircle, ArrowUpDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import StatusBadge from "@/components/StatusBadge";
import PageHeader from "@/components/PageHeader";
import { mockExpenseRequests } from "@/data/mock";
import { RequestStatus } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const Reports = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orgFilter, setOrgFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"amount" | "date">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let data = [...mockExpenseRequests];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.title.toLowerCase().includes(q) ||
        r.submittedBy.firstName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") data = data.filter((r) => r.status === statusFilter);
    if (orgFilter !== "all") data = data.filter((r) => r.organizationId === orgFilter);

    data.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortField === "amount") return (a.amount - b.amount) * mul;
      return (new Date(a.date).getTime() - new Date(b.date).getTime()) * mul;
    });

    return data;
  }, [search, statusFilter, orgFilter, sortField, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === paged.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paged.map((r) => r.id)));
    }
  };

  const toggleSort = (field: "amount" | "date") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("desc"); }
  };

  const exportCSV = () => toast.success(`Exported ${filtered.length} records as CSV.`);
  const exportPDF = () => toast.success(`Exported ${filtered.length} records as PDF.`);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Reports" description="Enterprise-grade data tables with advanced filtering and export.">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={exportPDF}>
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </PageHeader>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Expense Reports</TabsTrigger>
          <TabsTrigger value="approval">Approval Reports</TabsTrigger>
          <TabsTrigger value="department">Department Reports</TabsTrigger>
          <TabsTrigger value="budget">Budget Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by ID, title, employee…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={RequestStatus.Draft}>Draft</SelectItem>
                <SelectItem value={RequestStatus.PendingApproval}>Pending</SelectItem>
                <SelectItem value={RequestStatus.Approved}>Approved</SelectItem>
                <SelectItem value={RequestStatus.Rejected}>Rejected</SelectItem>
                <SelectItem value={RequestStatus.Published}>Published</SelectItem>
              </SelectContent>
            </Select>
            <Select value={orgFilter} onValueChange={(v) => { setOrgFilter(v); setPage(0); }}>
              <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Organization" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="org1">Atiat Holdings</SelectItem>
                <SelectItem value="org2">Atiat Technologies</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-4 py-2">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" onClick={() => { toast.success(`${selectedIds.size} requests approved.`); setSelectedIds(new Set()); }}>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Approve
              </Button>
              <Button variant="outline" size="sm" onClick={() => { toast.success(`${selectedIds.size} requests rejected.`); setSelectedIds(new Set()); }}>
                <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
              </Button>
              <Button variant="outline" size="sm" onClick={exportCSV}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Export
              </Button>
            </div>
          )}

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={selectedIds.size === paged.length && paged.length > 0} onCheckedChange={toggleAll} />
                    </TableHead>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 text-xs" onClick={() => toggleSort("amount")}>
                        Amount <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <button className="flex items-center gap-1 text-xs" onClick={() => toggleSort("date")}>
                        Date <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No records found.</TableCell>
                    </TableRow>
                  ) : (
                    paged.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell><Checkbox checked={selectedIds.has(r.id)} onCheckedChange={() => toggleSelect(r.id)} /></TableCell>
                        <TableCell className="font-mono text-xs">{r.id.toUpperCase()}</TableCell>
                        <TableCell className="text-sm">{r.submittedBy.firstName} {r.submittedBy.lastName}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{r.organizationName}</TableCell>
                        <TableCell className="text-sm font-medium">{r.currency} {r.amount.toLocaleString()}</TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(r.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/dashboard/requests/${r.id}`)}>
                                <Eye className="mr-2 h-3.5 w-3.5" /> View Request
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.info("Audit trail shown.")}>View Audit Trail</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toast.success("Exported.")}>Export</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approval" className="mt-4">
          <Card className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Approval reports — same table format with approval-specific columns.</p>
          </Card>
        </TabsContent>
        <TabsContent value="department" className="mt-4">
          <Card className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Department comparison reports with budget utilization data.</p>
          </Card>
        </TabsContent>
        <TabsContent value="budget" className="mt-4">
          <Card className="flex items-center justify-center py-16">
            <p className="text-sm text-muted-foreground">Budget tracking reports with threshold alerts.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
