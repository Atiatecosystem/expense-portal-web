import {
  User,
  UserRole,
  Organization,
  ExpenseRequest,
  RequestStatus,
  PaymentRecord,
  Notification,
  NotificationType,
  DashboardStats,
} from "@/types";

/* ── Users ── */

export const mockUsers: User[] = [
  {
    id: "u1",
    email: "admin@atiat.com",
    firstName: "Ahmed",
    lastName: "Al-Rashid",
    role: UserRole.SuperAdmin,
    organizationIds: ["org1", "org2"],
    isActive: true,
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2026-02-01T10:00:00Z",
  },
  {
    id: "u2",
    email: "sara@atiat.com",
    firstName: "Sara",
    lastName: "Hassan",
    role: UserRole.Manager,
    organizationIds: ["org1"],
    isActive: true,
    createdAt: "2025-03-10T08:00:00Z",
    updatedAt: "2026-01-20T10:00:00Z",
  },
  {
    id: "u3",
    email: "omar@atiat.com",
    firstName: "Omar",
    lastName: "Khalid",
    role: UserRole.Employee,
    organizationIds: ["org1"],
    isActive: true,
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2026-02-10T10:00:00Z",
  },
];

/* ── Organizations ── */

export const mockOrganizations: Organization[] = [
  {
    id: "org1",
    name: "Atiat Holdings",
    slug: "atiat-holdings",
    userCount: 45,
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "org2",
    name: "Atiat Technologies",
    slug: "atiat-tech",
    userCount: 22,
    isActive: true,
    createdAt: "2025-02-15T00:00:00Z",
  },
];

/* ── Expense Requests ── */

export const mockExpenseRequests: ExpenseRequest[] = [
  {
    id: "req1",
    title: "Office Supplies Q1",
    description: "Quarterly office supplies purchase for the engineering department.",
    amount: 2500,
    currency: "SAR",
    date: "2026-02-10",
    status: RequestStatus.PendingApproval,
    organizationId: "org1",
    organizationName: "Atiat Holdings",
    submittedBy: mockUsers[2],
    beneficiaryName: "Office World Co.",
    bankName: "Al Rajhi Bank",
    accountNumber: "SA12345678901234",
    documents: [],
    comments: [
      {
        id: "c1",
        userId: "u2",
        userName: "Sara Hassan",
        content: "Please provide itemized receipt.",
        createdAt: "2026-02-11T09:00:00Z",
      },
    ],
    timeline: [
      { id: "t1", action: "Created", actor: "Omar Khalid", timestamp: "2026-02-10T08:00:00Z" },
      { id: "t2", action: "Submitted for Approval", actor: "Omar Khalid", timestamp: "2026-02-10T08:05:00Z" },
    ],
    createdAt: "2026-02-10T08:00:00Z",
    updatedAt: "2026-02-11T09:00:00Z",
  },
  {
    id: "req2",
    title: "Client Dinner — Project Alpha",
    description: "Business dinner with Project Alpha stakeholders.",
    amount: 850,
    currency: "SAR",
    date: "2026-02-05",
    status: RequestStatus.Approved,
    organizationId: "org1",
    organizationName: "Atiat Holdings",
    submittedBy: mockUsers[1],
    beneficiaryName: "Sara Hassan",
    bankName: "SNB",
    accountNumber: "SA98765432109876",
    documents: [],
    comments: [],
    timeline: [
      { id: "t3", action: "Created", actor: "Sara Hassan", timestamp: "2026-02-05T12:00:00Z" },
      { id: "t4", action: "Approved", actor: "Ahmed Al-Rashid", comment: "Looks good.", timestamp: "2026-02-06T10:00:00Z" },
    ],
    createdAt: "2026-02-05T12:00:00Z",
    updatedAt: "2026-02-06T10:00:00Z",
  },
];

/* ── Payments ── */

export const mockPayments: PaymentRecord[] = [
  {
    id: "pay1",
    requestId: "req2",
    requestTitle: "Client Dinner — Project Alpha",
    beneficiary: "Sara Hassan",
    amount: 850,
    currency: "SAR",
    status: "completed",
    organizationName: "Atiat Holdings",
    processedAt: "2026-02-07T14:00:00Z",
    createdAt: "2026-02-06T10:00:00Z",
  },
];

/* ── Notifications ── */

export const mockNotifications: Notification[] = [
  {
    id: "n1",
    type: NotificationType.RequestSubmitted,
    title: "New Expense Request",
    message: "Omar Khalid submitted 'Office Supplies Q1' for approval.",
    isRead: false,
    createdAt: "2026-02-10T08:05:00Z",
  },
  {
    id: "n2",
    type: NotificationType.RequestApproved,
    title: "Request Approved",
    message: "Your request 'Client Dinner — Project Alpha' was approved.",
    isRead: true,
    createdAt: "2026-02-06T10:00:00Z",
  },
];

/* ── Dashboard Stats ── */

export const mockDashboardStats: DashboardStats = {
  totalRequests: 128,
  activeUsers: 67,
  organizations: 4,
  pending: 12,
  approved: 98,
  processed: 86,
};

/* ── Mock Credentials ── */

export const MOCK_CREDENTIALS = {
  email: "admin@atiat.com",
  password: "admin123",
};
