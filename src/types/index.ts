/* ── Enums ── */

export enum UserRole {
  SuperAdmin = "super_admin",
  OrgAdmin = "org_admin",
  Manager = "manager",
  Employee = "employee",
  FinanceReviewer = "finance_reviewer",
}

export enum RequestStatus {
  Draft = "draft",
  PendingApproval = "pending_approval",
  Approved = "approved",
  Rejected = "rejected",
  Published = "published",
}

export enum NotificationType {
  RequestSubmitted = "request_submitted",
  RequestApproved = "request_approved",
  RequestRejected = "request_rejected",
  RequestComment = "request_comment",
  SystemAlert = "system_alert",
  BudgetAlert = "budget_alert",
}

export enum ApprovalType {
  RoleBased = "role_based",
  SpecificUser = "specific_user",
  DepartmentHead = "department_head",
  Dynamic = "dynamic",
}

export enum BudgetPeriod {
  Monthly = "monthly",
  Quarterly = "quarterly",
  Yearly = "yearly",
}

/* ── Permission system ── */

export enum Permission {
  ViewRequests = "view_requests",
  ApproveRequests = "approve_requests",
  ManageUsers = "manage_users",
  ManageOrganizations = "manage_organizations",
  ManagePayments = "manage_payments",
  ManageDepartments = "manage_departments",
  ManageWorkflows = "manage_workflows",
  AssignApprovers = "assign_approvers",
  ManageBudgets = "manage_budgets",
  ViewAllRequests = "view_all_requests",
  OverrideApproval = "override_approval",
  ManageCurrency = "manage_currency",
  ExportReports = "export_reports",
  ViewAuditLogs = "view_audit_logs",
}

/** Role → Permission mapping */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SuperAdmin]: Object.values(Permission),
  [UserRole.OrgAdmin]: [
    Permission.ViewRequests, Permission.ApproveRequests, Permission.ManageUsers,
    Permission.ManagePayments, Permission.ManageDepartments, Permission.ManageWorkflows,
    Permission.AssignApprovers, Permission.ManageBudgets, Permission.ViewAllRequests,
    Permission.ExportReports, Permission.ViewAuditLogs,
  ],
  [UserRole.Manager]: [
    Permission.ViewRequests, Permission.ApproveRequests, Permission.ViewAllRequests,
    Permission.ExportReports,
  ],
  [UserRole.Employee]: [Permission.ViewRequests],
  [UserRole.FinanceReviewer]: [
    Permission.ViewRequests, Permission.ViewAllRequests, Permission.ManagePayments,
    Permission.ExportReports, Permission.ViewAuditLogs,
  ],
};

/* ── Core Models ── */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  organizationIds: string[];
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  baseCurrency?: string;
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  parentId?: string;
  headId?: string;
  headName?: string;
  budgetLimit: number;
  budgetUsed: number;
  currency: string;
  workflowId?: string;
  workflowName?: string;
  memberCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface WorkflowStep {
  id: string;
  order: number;
  name: string;
  approvalType: ApprovalType;
  assigneeId?: string;
  assigneeName?: string;
  required: boolean;
  allowDelegation: boolean;
  minAmount?: number;
  maxAmount?: number;
  escalationHours?: number;
  backupApproverId?: string;
  backupApproverName?: string;
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  steps: WorkflowStep[];
  departmentIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  employeeId?: string;
  employeeName?: string;
  organizationId: string;
  organizationName: string;
  period: BudgetPeriod;
  limit: number;
  used: number;
  currency: string;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
}

export interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  symbol: string;
  rateToSAR: number;
  updatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  actorId: string;
  organizationName: string;
  action: string;
  entity: string;
  entityId: string;
  ipAddress: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface Approver {
  id: string;
  userId: string;
  userName: string;
  departmentId: string;
  departmentName: string;
  organizationId: string;
  role: UserRole;
  backupUserId?: string;
  backupUserName?: string;
  escalationHours: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface ExpenseRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  convertedCurrency?: string;
  date: string;
  status: RequestStatus;
  organizationId: string;
  organizationName: string;
  departmentId?: string;
  departmentName?: string;
  submittedBy: User;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  documents: Document[];
  comments: ExpenseComment[];
  timeline: TimelineEvent[];
  taggedUsers?: string[];
  currentApprover?: string;
  workflowStage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface ExpenseComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  action: string;
  actor: string;
  actorAvatar?: string;
  comment?: string;
  timestamp: string;
}

export interface PaymentRecord {
  id: string;
  requestId: string;
  requestTitle: string;
  beneficiary: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  organizationName: string;
  processedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalRequests: number;
  activeUsers: number;
  organizations: number;
  pending: number;
  approved: number;
  processed: number;
}

/* ── Auth ── */

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
