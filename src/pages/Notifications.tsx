import { useState, useMemo } from "react";
import {
  Bell,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertTriangle,
  FileText,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { mockNotifications } from "@/data/mock";
import { Notification, NotificationType } from "@/types";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { toast } from "sonner";

const typeIcon: Record<NotificationType, React.ReactNode> = {
  [NotificationType.RequestSubmitted]: <FileText className="h-4 w-4 text-status-pending" />,
  [NotificationType.RequestApproved]: <CheckCircle2 className="h-4 w-4 text-status-approved" />,
  [NotificationType.RequestRejected]: <XCircle className="h-4 w-4 text-status-rejected" />,
  [NotificationType.RequestComment]: <MessageSquare className="h-4 w-4 text-status-published" />,
  [NotificationType.SystemAlert]: <AlertTriangle className="h-4 w-4 text-status-pending" />,
};

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const grouped = useMemo(() => {
    const groups: { label: string; items: Notification[] }[] = [];
    const today: Notification[] = [];
    const yesterday: Notification[] = [];
    const older: Notification[] = [];

    notifications.forEach((n) => {
      const d = new Date(n.createdAt);
      if (isToday(d)) today.push(n);
      else if (isYesterday(d)) yesterday.push(n);
      else older.push(n);
    });

    if (today.length) groups.push({ label: "Today", items: today });
    if (yesterday.length) groups.push({ label: "Yesterday", items: yesterday });
    if (older.length) groups.push({ label: "Older", items: older });
    return groups;
  }, [notifications]);

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read.");
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted.");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Notifications"
        description={`You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.`}
      >
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-2">
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </PageHeader>

      {grouped.length === 0 ? (
        <Card className="py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No notifications yet.</p>
        </Card>
      ) : (
        grouped.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{group.label}</p>
            <div className="space-y-2">
              {group.items.map((n) => (
                <Card
                  key={n.id}
                  className={cn(
                    "transition-all",
                    !n.isRead && "border-l-4 border-l-primary bg-primary/[0.03]"
                  )}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {typeIcon[n.type]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !n.isRead ? "font-semibold text-foreground" : "text-foreground")}>
                        {n.title}
                      </p>
                      <p className="text-sm text-muted-foreground">{n.message}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {format(new Date(n.createdAt), "MMM dd, yyyy · HH:mm")}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      {!n.isRead && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => markAsRead(n.id)} aria-label="Mark as read">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => deleteNotification(n.id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
