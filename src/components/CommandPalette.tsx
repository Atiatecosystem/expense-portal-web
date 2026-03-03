import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  Users,
  Building,
  CreditCard,
  Settings,
  Search,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { mockExpenseRequests } from "@/data/mock";

const pages = [
  { label: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { label: "Requests", url: "/dashboard/requests", icon: FileText },
  { label: "Create Request", url: "/dashboard/requests/new", icon: FileText },
  { label: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { label: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { label: "Users & Accounts", url: "/dashboard/users", icon: Users },
  { label: "Organizations", url: "/dashboard/organizations", icon: Building },
  { label: "Payments", url: "/dashboard/payments", icon: CreditCard },
  { label: "Settings", url: "/dashboard/settings", icon: Settings },
];

/** Global command palette triggered by ⌘K / Ctrl+K */
const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent sm:flex"
        aria-label="Open command palette"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search pages, requests…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Pages">
            {pages.map((p) => (
              <CommandItem key={p.url} onSelect={() => go(p.url)} className="gap-2">
                <p.icon className="h-4 w-4 text-muted-foreground" />
                {p.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Recent Requests">
            {mockExpenseRequests.slice(0, 5).map((req) => (
              <CommandItem
                key={req.id}
                onSelect={() => go("/dashboard/requests")}
                className="gap-2"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>{req.title}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {req.currency} {req.amount.toLocaleString()}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CommandPalette;
