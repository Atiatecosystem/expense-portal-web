import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

/* ── Draft auto-save key ── */
const DRAFT_KEY = "atiat_expense_draft";

interface FileItem {
  id: string;
  file: File;
  preview?: string;
}

interface FormData {
  title: string;
  date: string;
  organizationId: string;
  amount: string;
  currency: string;
  description: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
}

const emptyForm: FormData = {
  title: "",
  date: new Date().toISOString().split("T")[0],
  organizationId: "",
  amount: "",
  currency: "SAR",
  description: "",
  beneficiaryName: "",
  bankName: "",
  accountNumber: "",
};

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const CreateRequest = () => {
  const navigate = useNavigate();
  const { organizations, currentOrg } = useOrganization();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── State ── */
  const [form, setForm] = useState<FormData>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        return { ...emptyForm, ...JSON.parse(saved) };
      } catch {
        return { ...emptyForm, organizationId: currentOrg.id };
      }
    }
    return { ...emptyForm, organizationId: currentOrg.id };
  });
  const [files, setFiles] = useState<FileItem[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  /* ── Auto-save draft (debounced) ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
      setDraftSaved(true);
      const hide = setTimeout(() => setDraftSaved(false), 2000);
      return () => clearTimeout(hide);
    }, 1000);
    return () => clearTimeout(timer);
  }, [form]);

  /* ── Helpers ── */
  const updateField = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const newFiles: FileItem[] = [];
    Array.from(incoming).forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name}: Only PDF, JPG, PNG allowed.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name}: File exceeds 10 MB limit.`);
        return;
      }
      const preview = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      newFiles.push({ id: crypto.randomUUID(), file, preview });
    });
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    localStorage.removeItem(DRAFT_KEY);
    setSubmitting(false);
    setShowConfirm(false);
    toast.success("Expense request submitted successfully!");
    navigate("/dashboard/requests");
  };

  const fileIcon = (type: string) => {
    if (type === "application/pdf") return <FileText className="h-5 w-5 text-destructive" />;
    if (type.startsWith("image/")) return <Image className="h-5 w-5 text-status-published" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isValid =
    form.title.trim() &&
    form.amount &&
    form.organizationId &&
    form.beneficiaryName.trim() &&
    form.bankName.trim() &&
    form.accountNumber.trim();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Create Expense Request</h1>
          <p className="text-sm text-muted-foreground">
            Fill in the details below to submit a new expense.
          </p>
        </div>
        {draftSaved && (
          <Badge variant="secondary" className="gap-1 text-xs">
            <CheckCircle2 className="h-3 w-3" /> Draft saved
          </Badge>
        )}
      </div>

      {/* ── Section 1: Expense Details ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Expense Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Title */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g. Office Supplies Q1"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-10"
                value={form.date}
                onChange={(e) => updateField("date", e.target.value)}
              />
            </div>
          </div>

          {/* Organization */}
          <div className="space-y-1.5">
            <Label>Subsidiary *</Label>
            <Select value={form.organizationId} onValueChange={(v) => updateField("organizationId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount + Currency */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-10"
                value={form.amount}
                onChange={(e) => updateField("amount", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Select value={form.currency} onValueChange={(v) => updateField("currency", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SAR">SAR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Provide details about this expense…"
              rows={3}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Payment Details ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="beneficiary">Beneficiary Name *</Label>
            <Input
              id="beneficiary"
              placeholder="Full name of the beneficiary"
              value={form.beneficiaryName}
              onChange={(e) => updateField("beneficiaryName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bank">Bank Name *</Label>
            <Input
              id="bank"
              placeholder="e.g. Al Rajhi Bank"
              value={form.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account">Account Number *</Label>
            <Input
              id="account"
              placeholder="e.g. SA12345678901234"
              value={form.accountNumber}
              onChange={(e) => updateField("accountNumber", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Supporting Documents ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Supporting Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Drop zone */}
          <div
            className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center transition-colors hover:border-primary/40 hover:bg-muted/50"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="Upload documents"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drag & drop files here, or click to browse
              </p>
              <p className="mt-1 text-xs text-muted-foreground">PDF, JPG, PNG — Max 10 MB per file</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3"
                >
                  {f.preview ? (
                    <img
                      src={f.preview}
                      alt={f.file.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    fileIcon(f.file.type)
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{f.file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => removeFile(f.id)}
                    aria-label={`Remove ${f.file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-6">
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem(DRAFT_KEY);
            navigate(-1);
          }}
        >
          Cancel
        </Button>
        <Button disabled={!isValid} onClick={() => setShowConfirm(true)}>
          Submit Request
        </Button>
      </div>

      {/* ── Confirmation Dialog ── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Submission</DialogTitle>
            <DialogDescription>
              You are about to submit an expense request for{" "}
              <span className="font-semibold text-foreground">
                {form.currency} {Number(form.amount).toLocaleString()}
              </span>
              . This action cannot be undone once approved.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p>
              <span className="text-muted-foreground">Title:</span>{" "}
              <span className="font-medium text-foreground">{form.title}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Beneficiary:</span>{" "}
              <span className="font-medium text-foreground">{form.beneficiaryName}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Documents:</span>{" "}
              <span className="font-medium text-foreground">{files.length} file(s)</span>
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting…" : "Confirm & Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateRequest;
