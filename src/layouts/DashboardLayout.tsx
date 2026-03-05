import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FileText, Bell, BarChart3, Users, Building, CreditCard,
  Settings, LogOut, Menu, Sun, Moon, ChevronLeft, ChevronDown, Check,
  FolderTree, GitBranch, UserCheck, Wallet, Coins, ScrollText, Shield,
  UserSquare2, FileBarChart, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CommandPalette from "@/components/CommandPalette";
import logoIcon from "@/assets/images/logo.png";
import ImageRenderer from "@/components/ImageRenderer";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin, UserRole.FinanceReviewer], badge: 0 },
  { title: "User Dashboard", url: "/dashboard/user", icon: LayoutDashboard, roles: [UserRole.Employee, UserRole.Manager], badge: 0 },
  { title: "My Requests", url: "/dashboard/requests", icon: FileText, roles: "all" as const, badge: 0 },
  // { title: "Notifications", url: "/dashboard/notifications", icon: Bell, roles: "all" as const, badge: 3 },
  // { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin, UserRole.FinanceReviewer], badge: 0 },
  { title: "Reports", url: "/dashboard/reports", icon: FileBarChart, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin, UserRole.FinanceReviewer], badge: 0 },
  { title: "Approvers", url: "/dashboard/approvers", icon: UserCheck, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Organizations", url: "/dashboard/organizations", icon: Building, roles: [UserRole.SuperAdmin], badge: 0 },
  { title: "Departments", url: "/dashboard/departments", icon: FolderTree, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Budgets", url: "/dashboard/budgets", icon: Wallet, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin, UserRole.FinanceReviewer], badge: 0 },
  { title: "Workflows", url: "/dashboard/workflows", icon: GitBranch, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Users", url: "/dashboard/users", icon: Users, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Roles", url: "/dashboard/roles", icon: Shield, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  // { title: "Directors", url: "/dashboard/directors", icon: UserSquare2, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin, UserRole.FinanceReviewer], badge: 0 },
  // { title: "Currencies", url: "/dashboard/currencies", icon: Coins, roles: [UserRole.SuperAdmin], badge: 0 },
  { title: "Audit Logs", url: "/dashboard/audit-logs", icon: ScrollText, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  // { title: "Activity", url: "/dashboard/activity", icon: Activity, roles: [UserRole.SuperAdmin, UserRole.OrgAdmin], badge: 0 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings, roles: "all" as const, badge: 0 },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useSettings();
  const { organizations, currentOrg, switchOrg } = useOrganization();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const visibleNav = navItems.filter(
    (item) => item.roles === "all" || (user && (item.roles as UserRole[]).includes(user.role))
  );

  const handleLogout = () => setShowLogoutConfirm(true);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate("/");
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const link = (
      <NavLink
        to={item.url}
        end={item.url === "/dashboard"}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-0",
        )}
        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
        onClick={() => setMobileOpen(false)}
      >
        <span className="relative shrink-0">
          <item.icon className="h-4 w-4" />
          {item.badge > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {item.badge}
            </span>
          )}
        </span>
        {!collapsed && <span>{item.title}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">{item.title}</TooltipContent>
        </Tooltip>
      );
    }
    return link;
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-auto shrink-0 items-center justify-center rounded-lg bg-sidebar-transparent">
          <ImageRenderer src={logoIcon} alt="Logo" className={cn("h-8 w-8", !collapsed && "h-8 w-auto")} />
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4" role="navigation" aria-label="Main navigation">
        {visibleNav.map((item) => <NavItem key={item.url} item={item} />)}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button onClick={handleLogout} className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <LogOut className="h-4 w-4 shrink-0" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <LogOut className="h-4 w-4 shrink-0" /><span>Logout</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-16" : "w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 hidden h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:text-foreground lg:flex"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
        </button>
      </aside>

      <div className={cn(
        "flex flex-1 flex-col transition-all duration-300",
        collapsed ? "lg:ml-16" : "lg:ml-60"
      )}>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm lg:px-6">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="hidden text-sm font-semibold text-foreground sm:block">Welcome To, Atiat Expense Portal</h2>
          <div className="ml-auto flex items-center gap-2">
            <CommandPalette />
            {organizations.length > 1 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <Building className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{currentOrg.name}</span>
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">Switch Organization</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {organizations.map((org) => (
                    <DropdownMenuItem key={org.id} onClick={() => switchOrg(org.id)} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/10 text-xs font-bold text-primary">{org.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-medium">{org.name}</p>
                          <p className="text-xs text-muted-foreground">{org.userCount} members</p>
                        </div>
                      </div>
                      {currentOrg.id === org.id && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/dashboard/notifications")}>
              <Bell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  <span className="hidden text-sm font-medium sm:inline">{user?.firstName} {user?.lastName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6"><Outlet /></main>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to sign in again to access your dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DashboardLayout;
