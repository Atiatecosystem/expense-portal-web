import { useState } from "react";
import {
  Sun,
  Moon,
  Bell,
  Mail,
  MessageSquare,
  User as UserIcon,
  Shield,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSettings } from "@/contexts/SettingsContext";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Theme = "light" | "dark";

const Settings = () => {
  const { theme, setTheme } = useSettings();
  const { user } = useAuth();

  /* ── Profile state ── */
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "+966 5X XXX XXXX",
    jobTitle: "Super Admin",
  });

  const saveProfile = () => toast.success("Profile updated successfully.");

  /* ── Security state ── */
  const [security, setSecurity] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  const changePassword = () => {
    if (!security.current || !security.newPw) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (security.newPw !== security.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    toast.success("Password changed successfully.");
    setSecurity({ current: "", newPw: "", confirm: "" });
  };

  /* ── Notification prefs ── */
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
    // <div className="mx-auto flex max-w-2xl flex-col gap-6">
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-8 space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your profile, security, appearance and notifications.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm">
            <UserIcon className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs sm:text-sm">
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          {/* <TabsTrigger value="appearance" className="gap-1.5 text-xs sm:text-sm">
            <Sun className="h-3.5 w-3.5" /> Theme
          </TabsTrigger> */}
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm">
            <Bell className="h-3.5 w-3.5" /> Alerts
          </TabsTrigger>
        </TabsList>

        {/* ── Profile Tab ── */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>First Name</Label>
                <Input
                  value={profile.firstName}
                  onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name</Label>
                <Input
                  value={profile.lastName}
                  onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={profile.email} disabled className="bg-muted" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Job Title</Label>
                <Input
                  value={profile.jobTitle}
                  onChange={(e) => setProfile((p) => ({ ...p, jobTitle: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={saveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>Current Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPw ? "text" : "password"}
                    className="pl-10 pr-10"
                    value={security.current}
                    onChange={(e) => setSecurity((s) => ({ ...s, current: e.target.value }))}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input
                    type="password"
                    value={security.newPw}
                    onChange={(e) => setSecurity((s) => ({ ...s, newPw: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input
                    type="password"
                    value={security.confirm}
                    onChange={(e) => setSecurity((s) => ({ ...s, confirm: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              {security.newPw && security.confirm && security.newPw !== security.confirm && (
                <p className="text-xs text-destructive">Passwords do not match.</p>
              )}
              <Button onClick={changePassword}>Update Password</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Enable 2FA</p>
                  <p className="text-xs text-muted-foreground">Require a code from your authenticator app on login.</p>
                </div>
                <Switch
                  onCheckedChange={(v) =>
                    toast.info(v ? "2FA will be enabled — this is a mock." : "2FA disabled.")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
              <CardDescription>Live preview of your current theme.</CardDescription>
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
