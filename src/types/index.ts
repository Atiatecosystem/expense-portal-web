/* ── Enums ── */

export enum UserRole {
  SuperAdmin = "super_admin",
  OrgAdmin = "org_admin",
  Manager = "manager",
  Employee = "employee",
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
}

/* ── Core Models ── */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  organizationIds: string[];
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
  userCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ExpenseRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: RequestStatus;
  organizationId: string;
  organizationName: string;
  submittedBy: User;
  beneficiaryName: string;
  bankName: string;
  accountNumber: string;
  documents: Document[];
  comments: ExpenseComment[];
  timeline: TimelineEvent[];
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
