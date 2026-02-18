

# Atiat Expense Portal — Implementation Plan

## Overview
A polished, enterprise-grade multi-tenant expense management portal with a dark green primary color palette, clean card-based layouts, and a calm professional aesthetic matching the provided design screenshots.

---

## Phase 1: Foundation & Design System

- **Theme setup**: Custom green primary color (`#1B4332` dark green), neutral backgrounds (`#F1F5F9`), soft shadows, rounded corners
- **Dark/Light mode**: Class-based toggle with localStorage persistence
- **Typography hierarchy**: Clean headings, muted supporting text
- **Reusable components**: StatusBadge, StatsCard, EmptyState, SkeletonLoader, ConfirmationModal, PageHeader, FilterBar, DataTable

---

## Phase 2: Authentication Pages

- **Landing page**: Centered card with Atiat logo, headline, description, and "Login To Portal" CTA button (matching screenshot exactly)
- **Login page**: Card with email/password fields (with icons), "Forgot Password?" link, green Login button, footer copyright "© 2026 Atiat Group"
- **Forgot Password page**: Email input, send reset link, success message, back to login
- **Reset Password page**: New password + confirm, strength indicator, submit

---

## Phase 3: Dashboard Layout

- **Sidebar**: Collapsible, with Atiat logo, navigation items (Dashboard, My Requests, Reports, Settings, Logout), active state highlight in green, tooltips when collapsed, mobile slide-in drawer
- **Topbar**: "Welcome To, Atiat Expense Portal" greeting, notification bell with badge count, user avatar with name & role, dropdown menu
- **Global search**: ⌘K / Ctrl+K command palette modal

---

## Phase 4: User Portal Pages

- **Dashboard (Employee)**: Empty state with "No Request Yet" message and "+ Create A Request" CTA button (matching screenshot). When data exists: recent requests list, quick stats
- **My Requests**: List/grid toggle, status badges (Draft, Pending, Approved, Rejected, Published), search & filter, edit/delete drafts
- **Create Request**: Multi-section form matching screenshot — Expense Details (title, date, subsidiary, amount, description), Payment Details (beneficiary, bank, account number), Supporting Documents (drag & drop upload area for PDF/JPG/PNG up to 10MB), Cancel/Submit buttons with confirmation modal ("Confirm Submission" dialog)
- **Reports**: Analytics view with charts and date filtering

---

## Phase 5: Admin Pages

- **Admin Dashboard**: Metric cards (Total Requests, Active Users, Organizations, Pending, Approved, Processed), charts (requests over time, org distribution), recent requests table
- **Expense Requests (Admin)**: Split-panel layout — filterable list on left, detail view on right with timeline, comments, and approve/reject actions with modal
- **Users & Accounts**: Searchable table with org filter, pagination, create/edit user, role assignment, activate/deactivate
- **Organizations**: Organization cards, tenant configuration, role & policy management
- **Payments**: Payment table with bulk actions, status tags, pagination, export
- **Notifications**: Grouped by date, read/unread toggle, mark as read, delete
- **Analytics**: KPI cards, trend charts, date range picker, CSV/PDF export
- **Settings**: Tabbed sections (Profile, Notifications, Appearance, Email, Security) with toggle switches and save feedback

---

## Phase 6: State Management & Services

- **AuthContext**: Mock user, role, login/logout, token management with mock credentials
- **OrganizationContext**: Current org, org switching, org list
- **SettingsContext**: Theme preference, notification settings
- **Mock API services**: Axios-based service layer with interceptors, mock data for all entities (users, requests, orgs, payments, notifications)
- **Role-based access**: Conditional rendering based on role (Super Admin, Org Admin, Manager, Employee)

---

## Phase 7: Approval Workflow

- **Status flow**: Draft → Pending Approval → Approved/Rejected → Published
- **Step progress indicator**: Visual workflow tracker on request detail
- **Decision modal**: Approve (optional comment) / Reject (required reason)
- **Timeline history**: Actor, timestamp, action, comment log

---

## Design Principles
- Matches the Atiat brand from screenshots: dark green buttons, neutral card backgrounds, clean spacing
- Enterprise polish: skeleton loaders, toast notifications, empty states, confirmation dialogs
- Fully responsive across mobile, tablet, and desktop
- Keyboard accessible with proper ARIA labels
- No backend required initially — all data is mocked for a complete interactive demo

