import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface FileItem {
  id: string;
  file: File;
  preview?: string;
}

interface FormData {
  typeOfExpenditure: string;
  date: string;
  referenceNumber: string;
  amount: string;
  amountInWords: string;
  description: string;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  additionalNotes: string;
}

const emptyForm: FormData = {
  typeOfExpenditure: "",
  date: "",
  referenceNumber: "",
  amount: "",
  amountInWords: "",
  description: "",
  beneficiaryName: "",
  bankName: "",
  accountNumber: "",
  additionalNotes: "",
};

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const CreateRequest = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(emptyForm);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    toast.success("Expense request submitted successfully!");
    navigate(-1);
  };

  const fileIcon = (type: string) => {
    if (type === "application/pdf") return <FileText className="h-5 w-5 text-destructive" />;
    if (type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-emerald-600" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Header */}
      <div className="mb-8 space-y-1">
        <h1 className="text-[22px] font-bold text-foreground">Create A Request</h1>
        <p className="text-[15px] text-muted-foreground">
          Kindly fill in the details to submit a new expense request
        </p>
      </div>

      {/* Main Form Container */}
      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="space-y-10">

          {/* Section 1: Expense Details */}
          <section>
            <h2 className="mb-5 text-[16px] font-semibold text-foreground">Expense Details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="typeOfExpenditure" className="text-sm font-normal text-gray-700">Type of Expenditure</Label>
                <Input
                  id="typeOfExpenditure"
                  placeholder="Title of expense"
                  value={form.typeOfExpenditure}
                  onChange={(e) => updateField("typeOfExpenditure", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-normal text-gray-700">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField("date", e.target.value)}
                  className="block h-12 w-full px-4 text-gray-500 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-sm font-normal text-gray-700">Reference Number</Label>
                <Input
                  id="referenceNumber"
                  placeholder="EXP - 2026-002"
                  value={form.referenceNumber}
                  onChange={(e) => updateField("referenceNumber", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-normal text-gray-700">Amount(₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder=""
                  value={form.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="amountInWords" className="text-sm font-normal text-gray-700">Amount In Words</Label>
                <Input
                  id="amountInWords"
                  placeholder="Four Hundred and Fifty Thousand Naira"
                  value={form.amountInWords}
                  onChange={(e) => updateField("amountInWords", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description" className="text-sm font-normal text-gray-700">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed description of the expense"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  className="min-h-[120px] resize-none px-4 py-3 shadow-none"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Payment Details */}
          <section>
            <h2 className="mb-5 text-[16px] font-semibold text-foreground">Payment Details</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="beneficiaryName" className="text-sm font-normal text-gray-700">Beneficiary Name</Label>
                <Input
                  id="beneficiaryName"
                  placeholder="Brief description of expense"
                  value={form.beneficiaryName}
                  onChange={(e) => updateField("beneficiaryName", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName" className="text-sm font-normal text-gray-700">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Enter Bank Name"
                  value={form.bankName}
                  onChange={(e) => updateField("bankName", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-sm font-normal text-gray-700">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Enter Account Number"
                  value={form.accountNumber}
                  onChange={(e) => updateField("accountNumber", e.target.value)}
                  className="h-12 px-4 shadow-none"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Supporting Documents */}
          <section>
            <h2 className="mb-5 text-[16px] font-semibold text-foreground">Supporting Documents</h2>
            <div className="space-y-3">
              <Label className="text-sm font-normal text-gray-700">Upload Receipt/Invoice</Label>
              <div
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-12 transition-colors hover:bg-gray-50/50"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
              >
                <Upload className="mb-3 h-8 w-8 stroke-[1.5] text-gray-400" />
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-gray-900">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-[13px] text-gray-400">PDF, JPG, PNG up to 10MB</p>
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
                <ul className="mt-4 space-y-2">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3"
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
                        <p className="truncate text-sm font-medium text-gray-900">{f.file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* Section 4: Additional Information */}
          <section>
            <h2 className="mb-5 text-[16px] font-semibold text-foreground">Additional Information</h2>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes" className="text-sm font-normal text-gray-700">Additional Notes (Optional)</Label>
              <Textarea
                id="additionalNotes"
                placeholder="Type in any additional notes here"
                value={form.additionalNotes}
                onChange={(e) => updateField("additionalNotes", e.target.value)}
                className="min-h-[120px] resize-none px-4 py-3 shadow-none"
              />
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Button
              variant="outline"
              className="h-11 w-32 rounded-lg text-sm font-medium shadow-none"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              className="h-11 w-32 rounded-lg bg-[#0d4a22] text-sm font-medium text-white shadow-none hover:bg-[#0a3819]"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
