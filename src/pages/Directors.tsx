import { useState } from "react";
import { UserSquare2, Plus, MoreHorizontal } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/PageHeader";
import { useOrganization } from "@/contexts/OrganizationContext";
import { format } from "date-fns";
import { toast } from "sonner";

interface Director {
  id: string;
  fullName: string;
  role: "Chairman" | "Director" | "Non-Executive Director";
  organizationId: string;
  organizationName: string;
  email: string;
  phone: string;
  startDate: string;
  endDate?: string;
  status: "active" | "inactive";
  bio?: string;
}

const mockDirectors: Director[] = [
  { id: "dir1", fullName: "Sultan Al-Rashid", role: "Chairman", organizationId: "org1", organizationName: "Atiat Holdings", email: "sultan@atiat.com", phone: "+966 50 111 2222", startDate: "2020-01-01", status: "active", bio: "Founder and Chairman of Atiat Group." },
  { id: "dir2", fullName: "Layla Al-Fahad", role: "Director", organizationId: "org1", organizationName: "Atiat Holdings", email: "layla@atiat.com", phone: "+966 50 333 4444", startDate: "2021-06-15", status: "active" },
  { id: "dir3", fullName: "Khalid Bin Nasser", role: "Non-Executive Director", organizationId: "org2", organizationName: "Atiat Technologies", email: "khalid@atiat-tech.com", phone: "+966 50 555 6666", startDate: "2022-03-01", status: "active" },
  { id: "dir4", fullName: "Mona Al-Harbi", role: "Director", organizationId: "org1", organizationName: "Atiat Holdings", email: "mona@atiat.com", phone: "+966 50 777 8888", startDate: "2019-09-01", endDate: "2025-12-31", status: "inactive" },
];

const Directors = () => {
  const { organizations } = useOrganization();
  const [directors, setDirectors] = useState<Director[]>(mockDirectors);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    fullName: "", role: "Director" as Director["role"], organizationId: "org1",
    email: "", phone: "", startDate: "", bio: "",
  });

  const handleCreate = () => {
    if (!form.fullName.trim() || !form.email.trim()) { toast.error("Name and email are required."); return; }
    const org = organizations.find((o) => o.id === form.organizationId);
    const newDir: Director = {
      id: `dir${Date.now()}`,
      fullName: form.fullName,
      role: form.role,
      organizationId: form.organizationId,
      organizationName: org?.name || "",
      email: form.email,
      phone: form.phone,
      startDate: form.startDate || new Date().toISOString().split("T")[0],
      status: "active",
      bio: form.bio,
    };
    setDirectors((prev) => [newDir, ...prev]);
    setShowCreate(false);
    setForm({ fullName: "", role: "Director", organizationId: "org1", email: "", phone: "", startDate: "", bio: "" });
    toast.success(`Director "${form.fullName}" added.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Directors & Governance" description="Manage board directors and governance structure.">
        <Button size="sm" className="gap-2" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" /> Add Director
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Director</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {directors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {d.fullName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{d.fullName}</p>
                        <p className="text-xs text-muted-foreground">{d.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{d.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{d.organizationName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{format(new Date(d.startDate), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={d.status === "active" ? "default" : "secondary"} className="text-xs">
                      {d.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toast.info("Edit director")}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDirectors((prev) => prev.map((x) => x.id === d.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
                            toast.success("Status updated.");
                          }}
                        >
                          {d.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Director</DialogTitle>
            <DialogDescription>Add a new board director or governance member.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Full Name *</Label>
              <Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v as Director["role"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Chairman">Chairman</SelectItem>
                  <SelectItem value="Director">Director</SelectItem>
                  <SelectItem value="Non-Executive Director">Non-Executive Director</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Organization</Label>
              <Select value={form.organizationId} onValueChange={(v) => setForm((f) => ({ ...f, organizationId: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {organizations.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Bio</Label>
              <Textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Add Director</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Directors;
