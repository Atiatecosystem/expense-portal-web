import { useState, useMemo } from "react";
import { UserCheck, Search, Plus, Clock, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import FilterBar from "@/components/FilterBar";
import PageHeader from "@/components/PageHeader";
import { mockApprovers } from "@/data/enterprise-mock";
import { mockOrganizations } from "@/data/mock";
import { Approver } from "@/types";
import { toast } from "sonner";

const Approvers = () => {
  const [approvers] = useState<Approver[]>(mockApprovers);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("all");
  const [showConfig, setShowConfig] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState<Approver | null>(null);

  const filtered = useMemo(() => {
    return approvers.filter((a) => {
      const matchSearch = a.userName.toLowerCase().includes(search.toLowerCase()) || a.departmentName.toLowerCase().includes(search.toLowerCase());
      const matchOrg = orgFilter === "all" || a.organizationId === orgFilter;
      return matchSearch && matchOrg;
    });
  }, [approvers, search, orgFilter]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Approver Management" description="Configure approvers, delegation windows, and escalation rules." />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search approvers…"
        filters={[
          {
            value: orgFilter,
            onChange: setOrgFilter,
            placeholder: "Organization",
            options: [
              { label: "All Organizations", value: "all" },
              ...mockOrganizations.map((o) => ({ label: o.name, value: o.id })),
            ],
          },
        ]}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Approver</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Backup</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">No approvers found.</TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {a.userName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-sm font-medium">{a.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{a.departmentName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{a.role.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.backupUserName || "—"}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" /> {a.escalationHours}h
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isActive ? "default" : "secondary"} className="text-[10px]">
                        {a.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => { setSelectedApprover(a); setShowConfig(true); }}>
                        Configure
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Config Dialog */}
      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approver Configuration</DialogTitle>
            <DialogDescription>{selectedApprover?.userName} — {selectedApprover?.departmentName}</DialogDescription>
          </DialogHeader>
          {selectedApprover && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Escalation Hours</Label>
                  <Input type="number" defaultValue={selectedApprover.escalationHours} />
                </div>
                <div className="space-y-1.5">
                  <Label>Backup Approver</Label>
                  <Input defaultValue={selectedApprover.backupUserName || ""} placeholder="Not assigned" />
                </div>
                <div className="space-y-1.5">
                  <Label>Effective From</Label>
                  <Input type="date" defaultValue={selectedApprover.effectiveFrom} />
                </div>
                <div className="space-y-1.5">
                  <Label>Effective To</Label>
                  <Input type="date" defaultValue={selectedApprover.effectiveTo || ""} placeholder="Ongoing" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfig(false)}>Cancel</Button>
            <Button onClick={() => { setShowConfig(false); toast.success("Approver configuration saved."); }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvers;
