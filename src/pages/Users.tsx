import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Eye,
  Trash2,
  FileSpreadsheet,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import FilterBar from "@/components/FilterBar";
import { mockUsers, mockOrganizations } from "@/data/mock";
import { User, UserRole } from "@/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import Papa from "papaparse";
import jsPDF from "jspdf";
import "jspdf-autotable";

// We need to extend jsPDF to include autoTable for TypeScript
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

const PAGE_SIZE = 10;

const roleLabels: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: "Super Admin",
  [UserRole.OrgAdmin]: "Org Admin",
  [UserRole.Manager]: "Manager",
  [UserRole.Employee]: "Employee",
  [UserRole.FinanceReviewer]: "Finance Reviewer",
};

const roleColors: Record<UserRole, string> = {
  [UserRole.SuperAdmin]: "bg-primary text-primary-foreground",
  [UserRole.OrgAdmin]: "bg-status-published/15 text-status-published",
  [UserRole.Manager]: "bg-status-pending/15 text-status-pending",
  [UserRole.Employee]: "bg-muted text-muted-foreground",
  [UserRole.FinanceReviewer]: "bg-[hsl(var(--chart-4))]/15 text-[hsl(var(--chart-4))]",
};

type SortConfig = {
  key: keyof User | "name";
  direction: "asc" | "desc";
} | null;

const SortIcon = ({ columnKey, sortConfig }: { columnKey: string, sortConfig: SortConfig }) => {
  if (sortConfig?.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground opacity-50" />;
  return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
};

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals state
  const [showCreate, setShowCreate] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [previewUser, setPreviewUser] = useState<User | null>(null);

  // Forms state
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", role: UserRole.Employee, orgId: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSort = (key: keyof User | "name") => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSorted = useMemo(() => {
    const result = users.filter((u) => {
      const matchSearch =
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchOrg = orgFilter === "all" || u.organizationIds.includes(orgFilter);
      return matchSearch && matchOrg;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: string | number | boolean | unknown = a[sortConfig.key as keyof User];
        let bVal: string | number | boolean | unknown = b[sortConfig.key as keyof User];

        if (sortConfig.key === "name") {
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
        }

        if (String(aVal) < String(bVal)) return sortConfig.direction === "asc" ? -1 : 1;
        if (String(aVal) > String(bVal)) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, search, orgFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const paginated = filteredAndSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleActive = (id: string, newStatus?: boolean) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          return { ...u, isActive: newStatus !== undefined ? newStatus : !u.isActive };
        }
        return u;
      })
    );
  };

  const handleCreateUser = () => {
    if (!newUser.firstName || !newUser.email) {
      toast.error("Name and email are required.");
      return;
    }
    const created: User = {
      id: `u${Date.now()}`,
      ...newUser,
      organizationIds: newUser.orgId ? [newUser.orgId] : [],
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUsers((prev) => [created, ...prev]);
    setShowCreate(false);
    setNewUser({ firstName: "", lastName: "", email: "", role: UserRole.Employee, orgId: "" });
    toast.success("User created successfully.");
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length && paginated.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkActivate = () => {
    selectedIds.forEach(id => toggleActive(id, true));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} users activated.`);
  };

  const handleBulkDeactivate = () => {
    selectedIds.forEach(id => toggleActive(id, false));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} users deactivated.`);
  };

  const handleBulkDelete = () => {
    setUsers(prev => prev.filter(u => !selectedIds.has(u.id)));
    setSelectedIds(new Set());
    toast.success(`${selectedIds.size} users deleted.`);
  };

  // Export
  const handleExportCSV = () => {
    const dataToExport = filteredAndSorted.map(u => ({
      ID: u.id,
      Name: `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Role: roleLabels[u.role],
      Status: u.isActive ? 'Active' : 'Inactive',
      Joined: format(new Date(u.createdAt), "MMM dd, yyyy")
    }));
    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'users_export.csv';
    link.click();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Users Report", 14, 15);
    const tableColumn = ["Name", "Email", "Role", "Status", "Joined"];
    const tableRows = filteredAndSorted.map(u => [
      `${u.firstName} ${u.lastName}`,
      u.email,
      roleLabels[u.role],
      u.isActive ? 'Active' : 'Inactive',
      format(new Date(u.createdAt), "MMM dd, yyyy")
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("users_export.pdf");
  };

  // CSV Import
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedUsers: User[] = results.data.map((row: Record<string, string>, i) => ({
            id: `imported-${Date.now()}-${i}`,
            firstName: row.FirstName || row.Name?.split(' ')[0] || "Imported",
            lastName: row.LastName || row.Name?.split(' ')[1] || "User",
            email: row.Email || `imported${i}@example.com`,
            role: Object.keys(roleLabels).find(k => roleLabels[k as UserRole] === row.Role) as UserRole || UserRole.Employee,
            organizationIds: [],
            isActive: row.Status !== 'Inactive',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          setUsers(prev => [...importedUsers, ...prev]);
          setShowUpload(false);
          toast.success(`Successfully imported ${importedUsers.length} users.`);
          // reset input
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
        error: (error) => {
          toast.error("Error parsing CSV file.");
          console.error(error);
        }
      });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users & Accounts" description="Manage users, roles and permissions.">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}><FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}><FileText className="mr-2 h-4 w-4" /> Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" onClick={() => setShowUpload(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </div>
      </PageHeader>

      <FilterBar
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search users…"
        filters={[
          {
            value: orgFilter,
            onChange: (v) => { setOrgFilter(v); setPage(1); },
            options: [
              { label: "All Organizations", value: "all" },
              ...mockOrganizations.map((o) => ({ label: o.name, value: o.id })),
            ],
            placeholder: "Organization",
          },
        ]}
      />

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg border border-border/50 animate-in fade-in">
          <span className="text-sm font-medium text-muted-foreground mr-auto">
            {selectedIds.size} user{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <Button size="sm" variant="outline" onClick={handleBulkActivate} className="text-status-approved border-status-approved/30 hover:bg-status-approved/10">
            <UserCheck className="mr-2 h-4 w-4" /> Activate
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkDeactivate} className="text-status-pending border-status-pending/30 hover:bg-status-pending/10">
            <UserX className="mr-2 h-4 w-4" /> Deactivate
          </Button>
          <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </Button>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={paginated.length > 0 && selectedIds.size === paginated.length}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("name")}>
                <div className="flex items-center">User <SortIcon columnKey="name" sortConfig={sortConfig} /></div>
              </TableHead>
              <TableHead className="hidden sm:table-cell cursor-pointer select-none" onClick={() => handleSort("email")}>
                <div className="flex items-center">Email <SortIcon columnKey="email" sortConfig={sortConfig} /></div>
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => handleSort("role")}>
                <div className="flex items-center">Role <SortIcon columnKey="role" sortConfig={sortConfig} /></div>
              </TableHead>
              <TableHead className="hidden md:table-cell cursor-pointer select-none" onClick={() => handleSort("isActive")}>
                <div className="flex items-center">Status <SortIcon columnKey="isActive" sortConfig={sortConfig} /></div>
              </TableHead>
              <TableHead className="hidden lg:table-cell cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                <div className="flex items-center">Joined <SortIcon columnKey="createdAt" sortConfig={sortConfig} /></div>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            ) : paginated.map((user) => (
              <TableRow key={user.id} className={selectedIds.has(user.id) ? "bg-muted/30" : ""}>
                <TableCell className="text-center">
                  <Checkbox
                    checked={selectedIds.has(user.id)}
                    onCheckedChange={() => toggleSelectUser(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="font-medium">{user.firstName} {user.lastName}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={cn("text-xs", roleColors[user.role])}>
                    {roleLabels[user.role]}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={user.isActive ? "default" : "outline"} className="text-xs">
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="hidden text-muted-foreground lg:table-cell">
                  {format(new Date(user.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setPreviewUser(user)}>
                        <Eye className="mr-2 h-4 w-4 text-primary" /> Preview Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("Edit user")}>
                        <Shield className="mr-2 h-4 w-4" /> Edit Roles
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleActive(user.id, !user.isActive)}>
                        {user.isActive ? (
                          <><UserX className="mr-2 h-4 w-4" /> Deactivate</>
                        ) : (
                          <><UserCheck className="mr-2 h-4 w-4" /> Activate</>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredAndSorted.length)} of {filteredAndSorted.length}
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                variant={page === i + 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* User Preview Modal */}
      <Dialog open={!!previewUser} onOpenChange={(open) => !open && setPreviewUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Preview</DialogTitle>
            <DialogDescription>Quick overview of the user details.</DialogDescription>
          </DialogHeader>
          {previewUser && (
            <div className="flex flex-col gap-6 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {previewUser.firstName[0]}{previewUser.lastName[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{previewUser.firstName} {previewUser.lastName}</h3>
                  <p className="text-sm text-muted-foreground">{previewUser.email}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary" className={cn("text-xs", roleColors[previewUser.role])}>
                      {roleLabels[previewUser.role]}
                    </Badge>
                    <Badge variant={previewUser.isActive ? "default" : "outline"} className="text-xs">
                      {previewUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Joined Date</p>
                  <p>{format(new Date(previewUser.createdAt), "MMMM dd, yyyy")}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">User ID</p>
                  <p className="font-mono text-xs">{previewUser.id}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between flex-row items-center">
            <Button variant="ghost" onClick={() => setPreviewUser(null)}>Close</Button>
            <Button asChild>
              <Link to={`/dashboard/users/${previewUser?.id}`}>View Full Profile</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk CSV Upload Modal */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Users via CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing user records. The CSV should have headers: FirstName, LastName, Email, Role, Status.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border/60 rounded-xl bg-muted/20 gap-4 mt-2">
            <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-center text-muted-foreground">
              Select a CSV file to import.<br />(Max file size 5MB)
            </p>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              id="csv-upload"
            />
            <Button onClick={() => fileInputRef.current?.click()} variant="secondary">Browse File</Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={() => fileInputRef.current?.click()}>Upload CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account and assign a role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input value={newUser.firstName} onChange={(e) => setNewUser((p) => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input value={newUser.lastName} onChange={(e) => setNewUser((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v as UserRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Organization</Label>
                <Select value={newUser.orgId} onValueChange={(v) => setNewUser((p) => ({ ...p, orgId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select org" /></SelectTrigger>
                  <SelectContent>
                    {mockOrganizations.map((o) => (
                      <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateUser}>Create User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;
