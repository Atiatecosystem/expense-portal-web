import { useState } from "react";
import { Building, Users, Settings, MoreHorizontal, Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageHeader from "@/components/PageHeader";
import { mockOrganizations } from "@/data/mock";
import { Organization } from "@/types";
import { format } from "date-fns";
import { toast } from "sonner";

const Organizations = () => {
  const [orgs, setOrgs] = useState<Organization[]>(mockOrganizations);
  const [showCreate, setShowCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "" });

  const handleCreate = () => {
    if (!newOrg.name.trim()) {
      toast.error("Organization name is required.");
      return;
    }
    const created: Organization = {
      id: `org${Date.now()}`,
      name: newOrg.name,
      slug: newOrg.slug || newOrg.name.toLowerCase().replace(/\s+/g, "-"),
      userCount: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setOrgs((prev) => [created, ...prev]);
    setShowCreate(false);
    setNewOrg({ name: "", slug: "" });
    toast.success("Organization created.");
  };

  const toggleActive = (id: string) => {
    setOrgs((prev) => prev.map((o) => (o.id === id ? { ...o, isActive: !o.isActive } : o)));
    toast.success("Organization status updated.");
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Organizations" description="Manage tenant organizations and their configuration.">
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Organization
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => (
          <Card key={org.id} className="relative transition-all hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {org.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription className="text-xs">{org.slug}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toast.info("Configure org")}>
                      <Settings className="mr-2 h-4 w-4" /> Configure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleActive(org.id)}>
                      {org.isActive ? "Deactivate" : "Activate"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {org.userCount} members
                </span>
                <Badge variant={org.isActive ? "default" : "outline"} className="text-xs">
                  {org.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(org.createdAt), "MMM dd, yyyy")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>Add a new tenant organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Name *</Label>
              <Input
                value={newOrg.name}
                onChange={(e) => setNewOrg((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Atiat Media"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={newOrg.slug}
                onChange={(e) => setNewOrg((p) => ({ ...p, slug: e.target.value }))}
                placeholder="e.g. atiat-media"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Organizations;
