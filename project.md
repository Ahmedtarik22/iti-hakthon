# Library Management System — Project Plan
**Document ID:** LMS-PROJ-001  
**Version:** 1.0  
**Date:** 9 June 2026  
**Status:** Draft

---

## 1. Project Overview

The Library Management System (LMS) is a modern, responsive web platform that replaces manual and spreadsheet-driven library workflows. It centralises book catalog management, member registration, borrowing transactions, fine calculation, and analytics — all accessible from any browser without a native app install.

**Tech Stack (Recommended)**
- **Frontend:** HTML5 / CSS3 / JavaScript (RTL + LTR, Arabic & English)
- **Backend:** Server-side application (Node.js / Django / Laravel or equivalent)
- **Database:** PostgreSQL 14+
- **Auth:** HTTP-only secure cookies or JWT with refresh-token rotation
- **Email:** SMTP or transactional email API (SendGrid / SES)
- **Hosting:** HTTPS/TLS 1.2+, 99.5% uptime target during 07:00–22:00

---

## 2. User Roles

| Role | Description |
|------|-------------|
| **Guest** | Anonymous visitor; can browse and search catalog; prompted to log in to borrow |
| **Librarian** | Library staff; manages books, members, borrowing, and returns |
| **Admin** | Platform administrator; manages accounts, fine rules, categories, and analytics |

---

## 3. Epics & User Stories

### Epic 1 — Catalog Browsing (Guest)
| Story | Title | Priority |
|-------|-------|----------|
| US-01 | Browse the full book catalog | High |
| US-02 | Search books by title, author, or category | High |
| US-03 | Filter catalog by availability (available / borrowed) | Medium |
| US-04 | View book detail page | Medium |
| US-05 | Prompted to log in when attempting to borrow | Low |

### Epic 2 — Book Management (Librarian)
| Story | Title | Priority |
|-------|-------|----------|
| US-06 | Add a new book (title, author, category, copies) | High |
| US-07 | Edit book details | High |
| US-08 | Delete a book (soft delete; blocked if copies are borrowed) | Medium |

### Epic 3 — Member Management (Librarian)
| Story | Title | Priority |
|-------|-------|----------|
| US-09 | Register a new member | High |
| US-10 | Edit a member's profile | Medium |
| US-11 | View a member's full borrowing history | Medium |
| US-17 | View a member's active borrows and outstanding fines | Low |

### Epic 4 — Borrowing (Librarian)
| Story | Title | Priority |
|-------|-------|----------|
| US-12 | Record a borrowing transaction (member + book + return date) | High |
| US-13 | View all currently borrowed books | High |

### Epic 5 — Returns (Librarian)
| Story | Title | Priority |
|-------|-------|----------|
| US-14 | Record a book return | High |
| US-15 | Auto-calculate late fine on return | High |

### Epic 6 — Search (Librarian)
| Story | Title | Priority |
|-------|-------|----------|
| US-16 | Search books by title, author, or category from any librarian page | Medium |

### Epic 7 — User Management (Admin)
| Story | Title | Priority |
|-------|-------|----------|
| US-18 | Create, edit, and deactivate librarian accounts | High |
| US-19 | Assign and change user roles | High |

### Epic 8 — Fine Configuration (Admin)
| Story | Title | Priority |
|-------|-------|----------|
| US-20 | Configure the global daily fine rate | High |

### Epic 9 — Category Management (Admin)
| Story | Title | Priority |
|-------|-------|----------|
| US-21 | Add, rename, or delete book categories | Medium |

### Epic 10 — Reports & Analytics (Admin)
| Story | Title | Priority |
|-------|-------|----------|
| US-22 | Platform-wide analytics dashboard | Medium |
| US-23 | Dedicated overdue books and fines report (CSV export) | Low |

### Epic 11 — Authentication (Shared)
| Story | Title | Priority |
|-------|-------|----------|
| US-24 | Log in with email and password | High |
| US-25 | Role-based access control on all routes and API endpoints | High |

### Epic 12 — Localisation (Shared)
| Story | Title | Priority |
|-------|-------|----------|
| US-26 | Switch UI language between Arabic and English (RTL/LTR) | Medium |

### Epic 13 — Responsive UI (Shared)
| Story | Title | Priority |
|-------|-------|----------|
| US-27 | Use the app on a mobile browser (375 px+, 44 px touch targets) | Medium |

### Epic 14 — Fine Engine (Shared)
| Story | Title | Priority |
|-------|-------|----------|
| US-28 | Automatic fine calculation on all overdue returns | High |

---

## 4. Task Breakdown

### Phase 0 — Project Setup
- [ ] Initialise repository and branch strategy
- [ ] Configure CI/CD pipeline (cross-browser: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
- [ ] Set up PostgreSQL 14+ database and run schema migrations
- [ ] Configure TLS/HTTPS on the server environment
- [ ] Set up email service credentials (SMTP / SendGrid / SES) and test password-reset flow
- [ ] Configure environment variables (DB connection, JWT secret, email API key, fine rate seed)
- [ ] Prepare data migration plan for legacy catalog spreadsheets

### Phase 1 — Authentication & RBAC
- [ ] Implement email/password login endpoint with bcrypt/Argon2 password hashing
- [ ] Issue HTTP-only secure session tokens; implement 8-hour inactivity expiry
- [ ] Implement account lockout after 5 consecutive failed attempts (15-minute lockout)
- [ ] Implement RBAC middleware enforced on every route and API endpoint (client + server)
- [ ] Implement 403 redirect for unauthorised URL access
- [ ] Implement account deactivation (no deletion) and login rejection for deactivated accounts
- [ ] Implement admin-initiated role change (effective on next login; admin self-demotion blocked)
- [ ] Implement "Forgot Password" email reset flow
- [ ] Write audit log entries for all admin actions (role changes, deactivations, fine rate changes)
- [ ] Log failed login attempts with timestamp and IP address

### Phase 2 — Book Catalog Management
- [ ] Build Book entity: `book_id`, `title`, `author`, `category_id`, `total_copies`, `available_copies`, `is_active`, timestamps
- [ ] Implement full CRUD API for books (Librarian role required)
- [ ] Implement soft delete (mark `is_active = false`; hide from catalog; preserve transaction history)
- [ ] Block deletion while any copies are borrowed
- [ ] Warn and require confirmation when reducing copies below currently borrowed count
- [ ] Atomically decrement/increment `available_copies` on borrow and return
- [ ] Expose `available_copies` and `total_copies` on catalog list and book detail pages

### Phase 3 — Member Management
- [ ] Build Member entity: `member_id`, `full_name`, `email`, `phone`, `address`, `membership_date`, `is_active`, timestamps
- [ ] Implement member registration (Librarian role); reject duplicate email/membership ID
- [ ] Implement member profile editing with `updated_at` audit timestamp
- [ ] Build borrowing history view per member (book title, borrow date, expected/actual return date, fine)
- [ ] Build member summary card: active borrow count + total outstanding fines

### Phase 4 — Borrowing Transactions
- [ ] Build BorrowTransaction entity: `transaction_id`, `member_id`, `book_id`, `borrow_date`, `expected_return_date`, `actual_return_date`, `fine_amount`, `status`
- [ ] Implement borrow recording endpoint: validate available copies > 0; reject past return dates
- [ ] Decrement `available_copies` atomically on save
- [ ] Expose active borrows list (title, borrower name, borrow date, expected return date)
- [ ] Visually highlight overdue transactions (expected return date in the past)
- [ ] Implement filtering by date range and search by member name on active borrows list

### Phase 5 — Returns & Fine Calculation
- [ ] Implement return endpoint: record `actual_return_date`; block re-return of already-returned transaction
- [ ] Implement fine engine: `Fine = max(0, Days Overdue) × Daily Fine Rate` using the rate current at time of return
- [ ] Display calculated fine to librarian before confirmation; show zero for on-time returns
- [ ] Record fine against transaction; fine records are immutable after confirmation
- [ ] Increment `available_copies` atomically on return

### Phase 6 — Search & Filtering
- [ ] Implement unified search across `title`, `author`, `category` (case-insensitive, substring match)
- [ ] Ensure search results return within 1 second for catalogs up to 10,000 books
- [ ] Implement availability filter (All / Available / Borrowed)
- [ ] Support combined search + filter simultaneously
- [ ] Surface search bar on every page in the Librarian interface
- [ ] Display clear empty-state message when no results found

### Phase 7 — Administration
- [ ] Build Admin UI: create Librarian accounts (name, email, role)
- [ ] Build Admin UI: deactivate accounts without deleting
- [ ] Build FineConfig entity: `config_id`, `daily_rate`, `effective_from`, `created_by`
- [ ] Build fine rate settings page; validate positive numeric input; apply to future returns only
- [ ] Build category management (add / rename / delete); block delete until all books are reassigned
- [ ] Role assignment page with self-demotion guard

### Phase 8 — Dashboard & Reporting
- [ ] Build Librarian dashboard: total books, available books, active borrows, overdue count, outstanding fines total
- [ ] Build Admin dashboard: same metrics + most-borrowed books chart + member activity report
- [ ] Build dedicated overdue report: member name, book title, days overdue, accrued fine, running total
- [ ] Implement CSV export for overdue report
- [ ] Dashboard metrics refresh without full page reload

### Phase 9 — Localisation
- [ ] Implement language toggle (English LTR / Arabic RTL) in the main header
- [ ] Switch all labels, buttons, error messages, and date formats without page reload
- [ ] Apply full RTL layout automatically when Arabic is selected
- [ ] Persist language preference across sessions

### Phase 10 — Responsive UI & Accessibility
- [ ] Ensure all pages render correctly from 375 px to 1920 px with no horizontal scrolling
- [ ] Set all interactive touch targets to ≥ 44 × 44 CSS px
- [ ] Implement inline form validation (no page reload required)
- [ ] Add confirmation dialogs for all destructive actions (delete book, deactivate account)
- [ ] Add meaningful empty-state messages on all list views
- [ ] Add loading spinners / skeleton screens for actions > 500 ms
- [ ] Achieve WCAG 2.1 Level AA conformance on all public and authenticated pages

### Phase 11 — Non-Functional & Infrastructure
- [ ] Performance test: page load < 3 s on 10 Mbps; search < 1 s; borrow/return < 2 s; dashboard < 5 s
- [ ] Load test: 50 concurrent users without degradation; architecture supports 500
- [ ] Configure automated daily DB backup with 30-day retention
- [ ] Validate RTO ≤ 4 hours; RPO ≤ 1 hour
- [ ] OWASP Top 10 security review (SQL injection, XSS, CSRF)
- [ ] Ensure PII is excluded from all application error logs
- [ ] Write developer documentation: setup, deployment, architecture

### Phase 12 — QA & Go-Live
- [ ] RTL layout testing included in definition of done for every UI story
- [ ] Automated cross-browser tests (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
- [ ] WCAG 2.1 AA automated + manual audit on all pages
- [ ] Data migration sprint: clean and import legacy catalog spreadsheets
- [ ] Librarian and Admin onboarding (target: independent use within 2 weeks of go-live)
- [ ] Post-launch: monitor 99.5% uptime for first 90 days

---

## 5. Data Entities (Summary)

| Entity | Key Fields |
|--------|-----------|
| `Book` | book_id, title, author, category_id, total_copies, available_copies, is_active |
| `Member` | member_id, full_name, email, phone, address, membership_date, is_active |
| `BorrowTransaction` | transaction_id, member_id, book_id, borrow_date, expected_return_date, actual_return_date, fine_amount, status |
| `User` | user_id, email, password_hash, role, is_active, last_login |
| `Category` | category_id, name |
| `FineConfig` | config_id, daily_rate, effective_from, created_by |
| `AuditLog` | log_id, user_id, action, target_entity, target_id, timestamp, ip_address |

---

## 6. Out of Scope — v1.0

| Item | Reason |
|------|--------|
| Multi-branch / federation | Single library branch only |
| Payment gateway | Fines recorded; no financial transactions |
| Barcode / RFID scanning | Copy count tracking only |
| Member self-registration | Librarian-created accounts only |
| Per-category fine rates | Single global daily rate |
| E-books / digital content | Physical books only |
| Native mobile apps | Responsive web only |

---

## 7. Success Metrics

| Metric | Target |
|--------|--------|
| Operational | All daily tasks completable without manual registers |
| Fine accuracy | 100% match to configured daily rate; zero manual adjustments |
| Performance | Search < 1 s; page load < 3 s under normal load |
| Uptime | ≥ 99.5% during operating hours in first 90 days |
| Adoption | All Librarians and Admins onboarded within 2 weeks of go-live |
| Data integrity | Zero partial or corrupt borrow/return records post go-live |
| Accessibility | All pages pass WCAG 2.1 AA audit at release |

---

*LMS-PROJ-001 | v1.0 | 9 June 2026 | Systems Analysis Team*
