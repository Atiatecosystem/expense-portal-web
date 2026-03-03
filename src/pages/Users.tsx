import { useState, useMemo } from "react";
import {
  Plus,
  MoreHorizontal,
  UserCheck,
  UserX,
  Shield,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", role: UserRole.Employee, orgId: "" });

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      const matchOrg = orgFilter === "all" || u.organizationIds.includes(orgFilter);
      return matchSearch && matchOrg;
    });
  }, [users, search, orgFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleActive = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isActive: !u.isActive } : u))
    );
    toast.success("User status updated.");
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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Users & Accounts" description="Manage users, roles and permissions.">
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add User
        </Button>
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

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead className="hidden sm:table-cell">Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead className="hidden lg:table-cell">Joined</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((user) => (
              <TableRow key={user.id}>
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
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => toast.info("Edit user")}>
                        <Shield className="mr-2 h-4 w-4" /> Edit Roles
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info("View requests")}>
                        View Requests
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => toggleActive(user.id)}>
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
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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
