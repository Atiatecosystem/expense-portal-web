import { useState, useMemo } from "react";
import { Shield, Plus, Search, CheckSquare, Square } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import PageHeader from "@/components/PageHeader";
import { useOrganization } from "@/contexts/OrganizationContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

/* ── Permission module definitions ── */
interface PermissionItem {
  key: string;
  label: string;
}

interface PermissionModule {
  name: string;
  permissions: PermissionItem[];
}

const PERMISSION_MODULES: PermissionModule[] = [
  {
    name: "Users",
    permissions: [
      { key: "users.view", label: "View User" },
      { key: "users.create", label: "Create User" },
      { key: "users.edit", label: "Edit User" },
      { key: "users.delete", label: "Delete User" },
      { key: "users.reset_password", label: "Reset User Password" },
    ],
  },
  {
    name: "Roles",
    permissions: [
      { key: "roles.view", label: "View Role" },
      { key: "roles.create", label: "Create Role" },
      { key: "roles.edit", label: "Edit Role" },
      { key: "roles.delete", label: "Delete Role" },
    ],
  },
  {
    name: "Departments",
    permissions: [
      { key: "departments.view", label: "View Department" },
      { key: "departments.create", label: "Create Department" },
      { key: "departments.edit", label: "Edit Department" },
      { key: "departments.delete", label: "Delete Department" },
    ],
  },
  {
    name: "Requests",
    permissions: [
      { key: "requests.view", label: "View Request" },
      { key: "requests.create", label: "Create Request" },
      { key: "requests.approve", label: "Approve Request" },
      { key: "requests.reject", label: "Reject Request" },
      { key: "requests.view_all", label: "View All Requests" },
      { key: "requests.delete", label: "Delete Request" },
    ],
  },
  {
    name: "Reports",
    permissions: [
      { key: "reports.view", label: "View Reports" },
      { key: "reports.export", label: "Export Reports" },
    ],
  },
  {
    name: "Budgets",
    permissions: [
      { key: "budgets.view", label: "View Budget" },
      { key: "budgets.create", label: "Create Budget" },
      { key: "budgets.edit", label: "Edit Budget" },
      { key: "budgets.delete", label: "Delete Budget" },
    ],
  },
  {
    name: "Workflows",
    permissions: [
      { key: "workflows.view", label: "View Workflow" },
      { key: "workflows.manage", label: "Manage Workflow" },
      { key: "workflows.execute", label: "Execute Workflow" },
    ],
  },
  {
    name: "Finance",
    permissions: [
      { key: "finance.view_payments", label: "View Payments" },
      { key: "finance.process_payments", label: "Process Payments" },
      { key: "finance.manage_currencies", label: "Manage Currencies" },
    ],
  },
  {
    name: "Approvals",
    permissions: [
      { key: "approvals.view", label: "View Approvals" },
      { key: "approvals.assign", label: "Assign Approvers" },
      { key: "approvals.override", label: "Override Approval" },
    ],
  },
  {
    name: "Notifications",
    permissions: [
      { key: "notifications.view", label: "View Notifications" },
      { key: "notifications.manage", label: "Manage Notifications" },
    ],
  },
  {
    name: "Audit Logs",
    permissions: [
      { key: "audit.view", label: "View Audit Logs" },
      { key: "audit.export", label: "Export Audit Logs" },
    ],
  },
  {
    name: "Settings",
    permissions: [
      { key: "settings.view", label: "View Settings" },
      { key: "settings.edit", label: "Edit Settings" },
    ],
  },
  {
    name: "Organizations",
    permissions: [
      { key: "organizations.view", label: "View Organization" },
      { key: "organizations.create", label: "Create Organization" },
      { key: "organizations.edit", label: "Edit Organization" },
      { key: "organizations.delete", label: "Delete Organization" },
    ],
  },
  {
    name: "Directors",
    permissions: [
      { key: "directors.view", label: "View Director" },
      { key: "directors.create", label: "Create Director" },
      { key: "directors.edit", label: "Edit Director" },
      { key: "directors.delete", label: "Delete Director" },
    ],
  },
];

const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));

/* ── Mock roles ── */
interface RoleRecord {
  id: string;
  name: string;
  organizationId: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
}

const initialRoles: RoleRecord[] = [
  { id: "role1", name: "Super Admin", organizationId: "org1", permissions: ALL_PERMISSION_KEYS, userCount: 1, createdAt: "2025-01-01T00:00:00Z" },
  { id: "role2", name: "Manager", organizationId: "org1", permissions: ["users.view", "requests.view", "requests.approve", "requests.reject", "requests.view_all", "reports.view", "reports.export", "budgets.view", "approvals.view"], userCount: 4, createdAt: "2025-02-01T00:00:00Z" },
  { id: "role3", name: "Employee", organizationId: "org1", permissions: ["requests.view", "requests.create", "notifications.view"], userCount: 24, createdAt: "2025-02-01T00:00:00Z" },
  { id: "role4", name: "Finance Reviewer", organizationId: "org1", permissions: ["requests.view", "requests.view_all", "finance.view_payments", "finance.process_payments", "finance.manage_currencies", "reports.view", "reports.export", "audit.view"], userCount: 3, createdAt: "2025-03-01T00:00:00Z" },
];

const Roles = () => {
  const { organizations } = useOrganization();
  const [roles, setRoles] = useState<RoleRecord[]>(initialRoles);
  const [editing, setEditing] = useState<RoleRecord | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setShowEditor(true);
  };

  const openEdit = (role: RoleRecord) => {
    setEditing(role);
    setShowEditor(true);
  };

  const handleSave = (role: RoleRecord) => {
    if (editing) {
      setRoles((prev) => prev.map((r) => (r.id === role.id ? role : r)));
      toast.success(`Role "${role.name}" updated.`);
    } else {
      setRoles((prev) => [...prev, { ...role, id: `role${Date.now()}`, userCount: 0, createdAt: new Date().toISOString() }]);
      toast.success(`Role "${role.name}" created.`);
    }
    setShowEditor(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Role & Permission Management" description="Define roles and fine-grained permissions for your organizations.">
        <Button size="sm" className="gap-2" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Create Role
        </Button>
      </PageHeader>

      {/* Roles table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {organizations.find((o) => o.id === role.organizationId)?.name || role.organizationId}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {role.permissions.length} / {ALL_PERMISSION_KEYS.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{role.userCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>Edit</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RoleEditor
            role={editing}
            organizations={organizations}
            onSave={handleSave}
            onCancel={() => setShowEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ── Role Editor with Permission Matrix ── */
const RoleEditor = ({
  role,
  organizations,
  onSave,
  onCancel,
}: {
  role: RoleRecord | null;
  organizations: { id: string; name: string }[];
  onSave: (r: RoleRecord) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState(role?.name || "");
  const [orgId, setOrgId] = useState(role?.organizationId || organizations[0]?.id || "");
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions || []));

  const allSelected = selected.size === ALL_PERMISSION_KEYS.length;

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(ALL_PERMISSION_KEYS));
  };

  const toggleModule = (mod: PermissionModule) => {
    const keys = mod.permissions.map((p) => p.key);
    const allIn = keys.every((k) => selected.has(k));
    const next = new Set(selected);
    keys.forEach((k) => (allIn ? next.delete(k) : next.add(k)));
    setSelected(next);
  };

  const togglePerm = (key: string) => {
    const next = new Set(selected);
    next.has(key) ? next.delete(key) : next.add(key);
    setSelected(next);
  };

  const handleSave = () => {
    if (!name.trim()) { toast.error("Role name is required."); return; }
    onSave({
      id: role?.id || "",
      name,
      organizationId: orgId,
      permissions: Array.from(selected),
      userCount: role?.userCount || 0,
      createdAt: role?.createdAt || new Date().toISOString(),
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" /> {role ? "Edit Role" : "Create Role"}
        </DialogTitle>
        <DialogDescription>Configure role name, organization, and permissions.</DialogDescription>
      </DialogHeader>

      {/* Header fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Role Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Cashier" />
        </div>
        <div className="space-y-1.5">
          <Label>Organization</Label>
          <Select value={orgId} onValueChange={setOrgId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {organizations.map((o) => (
                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Global Select All */}
      <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-4 py-3">
        <Checkbox
          id="select-all-global"
          checked={allSelected}
          onCheckedChange={toggleAll}
        />
        <Label htmlFor="select-all-global" className="cursor-pointer text-sm font-semibold">
          Select All Permissions ({selected.size} / {ALL_PERMISSION_KEYS.length})
        </Label>
      </div>

      {/* Permission cards grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {PERMISSION_MODULES.map((mod) => {
          const modKeys = mod.permissions.map((p) => p.key);
          const allModSelected = modKeys.every((k) => selected.has(k));
          const someSelected = modKeys.some((k) => selected.has(k));

          return (
            <Card key={mod.name} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/30 px-4 py-2.5">
                <CardTitle className="text-xs font-bold uppercase tracking-wider">
                  {mod.name} <span className="font-normal text-muted-foreground">Permission</span>
                </CardTitle>
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    checked={allModSelected}
                    onCheckedChange={() => toggleModule(mod)}
                  />
                  <span className="text-[10px] text-muted-foreground">Select All</span>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3">
                {mod.permissions.map((perm) => (
                  <div key={perm.key} className="flex items-center gap-2">
                    <Checkbox
                      id={perm.key}
                      checked={selected.has(perm.key)}
                      onCheckedChange={() => togglePerm(perm.key)}
                    />
                    <Label htmlFor={perm.key} className="cursor-pointer text-xs">
                      {perm.label}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>{role ? "Update Role" : "Save Role"}</Button>
      </DialogFooter>
    </>
  );
};

export default Roles;
