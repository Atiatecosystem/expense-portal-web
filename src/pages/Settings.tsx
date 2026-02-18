import { useState } from "react";
import { Sun, Moon, Monitor, Bell, BellOff, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Theme = "light" | "dark";

/** Settings page — Appearance + Notification preferences */
const Settings = () => {
  const { theme, setTheme } = useSettings();

  /* ── Notification prefs (local state, mock) ── */
  const [notifPrefs, setNotifPrefs] = useState(() => {
    const saved = localStorage.getItem("atiat_notif_prefs");
    return saved
      ? JSON.parse(saved)
      : {
          emailOnApproval: true,
          emailOnRejection: true,
          emailOnComment: false,
          pushEnabled: true,
          pushOnSubmission: true,
          pushOnApproval: true,
        };
  });

  const updateNotif = (key: string, value: boolean) => {
    const updated = { ...notifPrefs, [key]: value };
    setNotifPrefs(updated);
    localStorage.setItem("atiat_notif_prefs", JSON.stringify(updated));
    toast.success("Notification preferences updated.");
  };

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
    { value: "light", label: "Light", icon: <Sun className="h-5 w-5" />, desc: "Clean & bright interface" },
    { value: "dark", label: "Dark", icon: <Moon className="h-5 w-5" />, desc: "Easy on the eyes" },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your appearance and notification preferences.</p>
      </div>

      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="appearance" className="gap-2">
            <Sun className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
        </TabsList>

        {/* ── Appearance Tab ── */}
        <TabsContent value="appearance" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme</CardTitle>
              <CardDescription>Choose how Atiat Expense Portal looks for you.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all",
                    theme === opt.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border hover:border-primary/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      theme === opt.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {opt.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Live preview mini card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>This is how cards and buttons look with your current theme.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button size="sm">Primary</Button>
                <Button size="sm" variant="secondary">Secondary</Button>
                <Button size="sm" variant="outline">Outline</Button>
                <Button size="sm" variant="destructive">Destructive</Button>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">Sample card content</p>
                <p className="text-xs text-muted-foreground">This preview updates in real-time as you switch themes.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          {/* Email notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Mail className="h-4 w-4" /> Email Notifications
              </CardTitle>
              <CardDescription>Control which events trigger email alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotifRow
                label="Request Approved"
                desc="Get an email when your request is approved"
                checked={notifPrefs.emailOnApproval}
                onChange={(v) => updateNotif("emailOnApproval", v)}
              />
              <NotifRow
                label="Request Rejected"
                desc="Get an email when your request is rejected"
                checked={notifPrefs.emailOnRejection}
                onChange={(v) => updateNotif("emailOnRejection", v)}
              />
              <NotifRow
                label="New Comment"
                desc="Get an email when someone comments on your request"
                checked={notifPrefs.emailOnComment}
                onChange={(v) => updateNotif("emailOnComment", v)}
              />
            </CardContent>
          </Card>

          {/* Push notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" /> In-App Notifications
              </CardTitle>
              <CardDescription>Manage in-app notification behavior.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <NotifRow
                label="Enable Push Notifications"
                desc="Show in-app notification alerts"
                checked={notifPrefs.pushEnabled}
                onChange={(v) => updateNotif("pushEnabled", v)}
              />
              <NotifRow
                label="New Submissions"
                desc="Notify when a new request is submitted for review"
                checked={notifPrefs.pushOnSubmission}
                onChange={(v) => updateNotif("pushOnSubmission", v)}
                disabled={!notifPrefs.pushEnabled}
              />
              <NotifRow
                label="Approvals"
                desc="Notify when a request you submitted gets approved"
                checked={notifPrefs.pushOnApproval}
                onChange={(v) => updateNotif("pushOnApproval", v)}
                disabled={!notifPrefs.pushEnabled}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

/* ── Notification toggle row ── */
const NotifRow = ({
  label,
  desc,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4">
    <div className={cn("min-w-0", disabled && "opacity-50")}>
      <Label className="text-sm font-medium">{label}</Label>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
  </div>
);

export default Settings;
