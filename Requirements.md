# Software Requirements Specification — Library Management System

| Field | Value |
|---|---|
| **Document No.** | LMS-SRS-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | 9 June 2026 |
| **Prepared by** | Systems Analysis Team |
| **Classification** | Internal |

> *Confidential — Internal Use Only*
> This document is confidential and intended solely for authorized personnel involved in the Library Management System project.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [External Interface Requirements](#5-external-interface-requirements)
6. [System Constraints & Assumptions](#6-system-constraints--assumptions)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the Library Management System (LMS). It serves as the contractual and technical baseline between stakeholders, the development team, and QA.

The document follows IEEE 830-1998 conventions and is intended to guide design, implementation, testing, and acceptance activities.

### 1.2 Scope

The Library Management System is a web-based platform that enables libraries to manage their book catalog, member registrations, borrowing transactions, returns, and late fines. The system supports three user roles (Guest, Librarian, Admin) and provides responsive access through any modern web browser without requiring a native mobile application.

The system is **NOT** intended to:

- Integrate with external e-book or digital content platforms
- Process financial payments (fine amounts are calculated and recorded only)
- Support multi-branch or multi-library federation in version 1.0

### 1.3 Definitions, Acronyms & Abbreviations

| Term | Definition |
|---|---|
| LMS | Library Management System — the software described in this document |
| SRS | Software Requirements Specification |
| Borrowing Transaction | A record linking a member, a book copy, a borrow date, and an expected return date |
| Fine | A monetary penalty applied when a book is returned after the expected return date |
| RBAC | Role-Based Access Control — permissions tied to user roles (Guest, Librarian, Admin) |
| RTL | Right-to-Left text layout, required for Arabic language support |
| DXA | Document eXchangeable Architecture unit (1 inch = 1440 DXA) |
| UC | Use Case |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |

### 1.4 References

- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications
- WCAG 2.1 Level AA — Web Content Accessibility Guidelines
- OWASP Top 10 (2021) — Web Application Security Risks
- Library Management System — User Stories Document, LMS-US-001, v1.0

### 1.5 Document Overview

- **Section 2** — Overall Description: product perspective, user characteristics, constraints
- **Section 3** — Functional Requirements: detailed requirements by functional area
- **Section 4** — Non-Functional Requirements: performance, security, usability, and maintainability
- **Section 5** — External Interface Requirements: UI, API, and data interfaces
- **Section 6** — System Constraints & Assumptions
- **Section 7** — Appendices: requirement traceability matrix, glossary

---

## 2. Overall Description

### 2.1 Product Perspective

The LMS is a standalone web application developed as a new system. It does not replace an existing platform but may be deployed alongside legacy catalog spreadsheets that will be migrated. The system architecture follows a three-tier model:

| Tier | Description |
|---|---|
| **Presentation** | Responsive web UI (HTML5/CSS3/JavaScript) rendered in the browser. Supports Arabic and English with automatic RTL layout switching. |
| **Application** | Server-side business logic handling authentication, RBAC, borrowing workflow, fine calculation, and reporting. |
| **Data** | Relational database storing books, members, transactions, fines, and configuration. Transactional integrity required. |

### 2.2 User Classes and Characteristics

| Role | Type | Responsibilities | Frequency | Technical Skill |
|---|---|---|---|---|
| Guest | Anonymous visitor with no account | Browse catalog, view availability, prompted to log in to borrow | Low — no login required | None |
| Librarian | Library staff with daily operational access | Manage books, members, borrowing, and returns; calculate fines | Medium — occasional system use | Basic computer literacy, web browser usage |
| Admin | System administrator with full platform access | Manage accounts, configure fine rules, view reports and analytics | Low — periodic configuration and reporting | IT-literate; understands role management |

### 2.3 Operating Environment

- The LMS shall run on modern evergreen browsers: Chrome 120+, Firefox 120+, Safari 17+, Edge 120+
- The system shall be fully functional on mobile browsers at viewport widths of 375 px and above
- No native mobile application is required; all functionality is delivered via the web browser
- The server environment shall support HTTPS/TLS 1.2+ for all communications
- The system shall support both Arabic (RTL) and English (LTR) languages simultaneously

### 2.4 Design and Implementation Constraints

- The system must implement Role-Based Access Control (RBAC) enforced on both client and server sides
- All personally identifiable information (PII) of members must be stored with appropriate access controls
- Fine calculation logic must be deterministic, auditable, and configurable without code changes
- The database must maintain referential integrity across books, members, and transaction records
- The application must not require a native app download for any core feature

### 2.5 Assumptions and Dependencies

- A stable internet connection is available at all library access points
- Each book copy is uniquely trackable by the library (copy count management is sufficient; barcode scanning is out of scope for v1.0)
- The fine rate is a single global setting; per-category or per-book-type fine rates are out of scope for v1.0
- Member identity is managed by library staff; self-registration by members is out of scope for v1.0
- The system is deployed on infrastructure providing 99.5% or higher availability during library operating hours

---

## 3. Functional Requirements

> Requirements are classified using MoSCoW prioritisation: **Must Have (M)**, **Should Have (S)**, **Could Have (C)**. All Must Have requirements are mandatory for v1.0 release.

### 3.1 Authentication & Role-Based Access Control

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-AUTH-01 | The system shall allow users to log in using a registered email address and password. | Must Have | Authentication |
| FR-AUTH-02 | The system shall prevent login for deactivated accounts and display a clear error message. | Must Have | Authentication |
| FR-AUTH-03 | The system shall lock an account for 15 minutes after 5 consecutive failed login attempts. | Must Have | Security |
| FR-AUTH-04 | The system shall enforce RBAC; every route and API endpoint must validate the user's role before processing. | Must Have | Authorization |
| FR-AUTH-05 | Navigating to a restricted URL shall redirect the user to a 403 Forbidden page or the login screen. | Must Have | Authorization |
| FR-AUTH-06 | An Admin shall be able to deactivate any user account without deleting it. | Must Have | User Management |
| FR-AUTH-07 | Role changes made by an Admin shall take effect on the affected user's next login. | Must Have | Authorization |
| FR-AUTH-08 | An Admin shall not be permitted to remove their own Admin role. | Must Have | Authorization |
| FR-AUTH-09 | The system shall support a "Forgot Password" email-based reset flow. | Should Have | Authentication |
| FR-AUTH-10 | All user sessions shall expire after 8 hours of inactivity. | Should Have | Security |

### 3.2 Book Catalog Management

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-BOOK-01 | The system shall allow Librarians to add a new book with the following mandatory fields: title, author, category, and number of copies. | Must Have | Books |
| FR-BOOK-02 | The system shall validate that all mandatory book fields are populated before saving. | Must Have | Validation |
| FR-BOOK-03 | A newly added book shall appear in the public catalog immediately after saving. | Must Have | Books |
| FR-BOOK-04 | The system shall allow Librarians to edit any field of an existing book record. | Must Have | Books |
| FR-BOOK-05 | When a Librarian reduces the number of copies below the number currently borrowed, the system shall display a warning and require explicit confirmation. | Must Have | Validation |
| FR-BOOK-06 | The system shall allow Librarians to delete a book record only when no copies are currently borrowed. | Must Have | Books |
| FR-BOOK-07 | The system shall maintain a count of total copies and available copies per book, updated automatically with each borrow and return. | Must Have | Inventory |
| FR-BOOK-08 | The system shall display book availability (available / borrowed) on both the catalog list and the book detail page. | Must Have | Books |
| FR-BOOK-09 | Each book shall be assigned to exactly one category; category management is handled by Admins. | Must Have | Books |
| FR-BOOK-10 | The system shall support soft deletion — deleted books are marked inactive and hidden from the catalog but retained for historical transaction records. | Should Have | Data Integrity |

### 3.3 Member Management

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-MEM-01 | Librarians shall be able to register new members by providing name, contact information, and membership details. | Must Have | Members |
| FR-MEM-02 | The system shall reject duplicate email addresses or membership IDs with a clear validation error. | Must Have | Validation |
| FR-MEM-03 | Librarians shall be able to edit any field of a member's profile. | Must Have | Members |
| FR-MEM-04 | The system shall record the date and time of the last profile update for each member. | Must Have | Audit |
| FR-MEM-05 | Librarians shall be able to view a member's complete borrowing history, including past and current transactions. | Must Have | Members |
| FR-MEM-06 | The borrowing history shall display book title, borrow date, expected return date, actual return date, and any fine applied per transaction. | Must Have | Members |
| FR-MEM-07 | A member's profile page shall display a summary of their current active borrows and total outstanding fines. | Must Have | Members |
| FR-MEM-08 | The borrowing history view shall support sorting by date (ascending and descending) and filtering by transaction status (active, returned, overdue). | Should Have | Members |

### 3.4 Borrowing Transactions

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-BOR-01 | Librarians shall be able to record a borrowing transaction by selecting a member, a book, and an expected return date. | Must Have | Borrowing |
| FR-BOR-02 | The system shall only allow borrowing if the selected book has at least one available copy. | Must Have | Validation |
| FR-BOR-03 | When a borrow transaction is saved, the available copy count for the book shall decrease by one immediately. | Must Have | Inventory |
| FR-BOR-04 | The new transaction shall appear in the member's active borrows list immediately after saving. | Must Have | Borrowing |
| FR-BOR-05 | Librarians shall be able to view all currently active borrowing transactions in a single list view. | Must Have | Borrowing |
| FR-BOR-06 | The active borrows list shall display: book title, borrower name, borrow date, and expected return date. | Must Have | Borrowing |
| FR-BOR-07 | Overdue transactions (expected return date in the past) shall be visually highlighted in the active borrows list. | Must Have | Borrowing |
| FR-BOR-08 | The active borrows list shall be filterable by expected return date range and searchable by member name. | Should Have | Borrowing |
| FR-BOR-09 | The system shall allow a Librarian to set a future expected return date only (past dates shall be rejected). | Must Have | Validation |

### 3.5 Book Returns & Fine Calculation

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-RET-01 | Librarians shall be able to record the return of a borrowed book from the active borrows list. | Must Have | Returns |
| FR-RET-02 | When a return is recorded, the system shall increment the available copy count of the returned book by one. | Must Have | Inventory |
| FR-RET-03 | The system shall automatically calculate the late fine as: `Fine = max(0, Days Overdue) × Daily Fine Rate`. | Must Have | Fines |
| FR-RET-04 | The calculated fine shall be displayed to the Librarian before they confirm the return. | Must Have | Fines |
| FR-RET-05 | When a book is returned on time, the system shall display a zero fine (not hide the fine field). | Must Have | Fines |
| FR-RET-06 | The fine and the return date shall be recorded against the borrowing transaction upon confirmation. | Must Have | Fines |
| FR-RET-07 | The fine calculation shall use the daily rate configured at the time of return, not at the time of borrowing. | Must Have | Fines |
| FR-RET-08 | The system shall prevent re-recording a return on an already-returned transaction. | Must Have | Validation |

### 3.6 Search & Filtering

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-SRH-01 | All users (including Guests) shall be able to search the book catalog by title, author, or category from a single search bar. | Must Have | Search |
| FR-SRH-02 | Search results shall update within 1 second for catalogs of up to 10,000 books. | Must Have | Performance |
| FR-SRH-03 | The catalog shall support filtering by availability status: All / Available / Borrowed. | Must Have | Search |
| FR-SRH-04 | When no search results are found, the system shall display a clear empty-state message. | Must Have | UX |
| FR-SRH-05 | Librarians shall be able to access the search function from any page in the Librarian interface. | Must Have | Search |
| FR-SRH-06 | Search shall be case-insensitive and shall support partial matching (substring search). | Must Have | Search |
| FR-SRH-07 | The system shall support combined search (e.g., title + availability filter simultaneously). | Should Have | Search |

### 3.7 Administration

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-ADM-01 | Admins shall be able to create new Librarian accounts specifying name, email, and role. | Must Have | Admin |
| FR-ADM-02 | Admins shall be able to deactivate any Librarian or Admin account without deleting it. | Must Have | Admin |
| FR-ADM-03 | Admins shall be able to configure the global daily fine rate (a positive numeric value in the local currency unit). | Must Have | Configuration |
| FR-ADM-04 | A change to the daily fine rate shall apply to all future return calculations; it shall not retroactively alter existing fine records. | Must Have | Configuration |
| FR-ADM-05 | Admins shall be able to add, rename, and delete book categories. | Must Have | Admin |
| FR-ADM-06 | Deleting a category shall require the Admin to reassign all books in that category first. | Must Have | Validation |
| FR-ADM-07 | Admins shall be able to assign or change the role of any user (Guest, Librarian, Admin). | Must Have | Admin |
| FR-ADM-08 | An Admin shall not be permitted to remove their own Admin role. | Must Have | Admin |

### 3.8 Dashboard & Reporting

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-RPT-01 | The Librarian and Admin dashboards shall display: total books, available books, active borrows, overdue count, and outstanding fines total. | Must Have | Dashboard |
| FR-RPT-02 | The Admin dashboard shall include a chart showing the most frequently borrowed books. | Must Have | Reports |
| FR-RPT-03 | The Admin dashboard shall include a member activity report showing members with the highest borrow counts. | Must Have | Reports |
| FR-RPT-04 | The Admin shall be able to view a dedicated overdue report listing all overdue borrows with: member name, book title, days overdue, and accrued fine. | Must Have | Reports |
| FR-RPT-05 | The overdue report total shall be displayed at the top of the report. | Must Have | Reports |
| FR-RPT-06 | Dashboard metrics shall refresh automatically or on manual refresh without requiring a full page reload. | Should Have | Dashboard |
| FR-RPT-07 | The Admin shall be able to export the overdue report to a CSV file. | Should Have | Reports |

### 3.9 Localisation & Language Support

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| FR-LOC-01 | The system shall support two display languages: English (LTR) and Arabic (RTL). | Must Have | Localisation |
| FR-LOC-02 | A language toggle shall be accessible from the main header or user settings on every page. | Must Have | Localisation |
| FR-LOC-03 | Switching language shall update all labels, buttons, error messages, and date formats without a page reload. | Must Have | Localisation |
| FR-LOC-04 | When Arabic is selected, the entire page layout shall switch to RTL direction automatically. | Must Have | Localisation |
| FR-LOC-05 | Date formats shall follow regional conventions: DD/MM/YYYY for English, and the same format adapted for Arabic locale. | Should Have | Localisation |
| FR-LOC-06 | The user's language preference shall be persisted across sessions. | Should Have | Localisation |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| NFR-PRF-01 | All page load times shall be under 3 seconds on a standard broadband connection (10 Mbps+). | Must Have | Performance |
| NFR-PRF-02 | Catalog search results shall appear within 1 second for catalogs of up to 10,000 books. | Must Have | Performance |
| NFR-PRF-03 | Borrowing and return transactions shall complete and confirm within 2 seconds. | Must Have | Performance |
| NFR-PRF-04 | The system shall support a minimum of 50 concurrent users without performance degradation. | Must Have | Performance |
| NFR-PRF-05 | Dashboard metrics shall load within 5 seconds even for datasets exceeding 100,000 transactions. | Should Have | Performance |

### 4.2 Security

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| NFR-SEC-01 | All data transmitted between the client and server shall be encrypted using TLS 1.2 or higher. | Must Have | Security |
| NFR-SEC-02 | Passwords shall be stored as salted hashes using a strong algorithm (bcrypt, Argon2, or equivalent). | Must Have | Security |
| NFR-SEC-03 | The system shall protect against OWASP Top 10 vulnerabilities, including SQL injection, XSS, and CSRF. | Must Have | Security |
| NFR-SEC-04 | Session tokens shall be invalidated immediately upon logout. | Must Have | Security |
| NFR-SEC-05 | Access to member PII shall be restricted to Librarians and Admins; Guests shall have no access to member data. | Must Have | Security |
| NFR-SEC-06 | All admin actions (role changes, fine rule changes, account deactivations) shall be written to an audit log. | Must Have | Audit |
| NFR-SEC-07 | Failed login attempts shall be logged with timestamp and IP address for security review. | Should Have | Audit |

### 4.3 Usability & Accessibility

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| NFR-USA-01 | The UI shall be responsive and fully functional on viewport widths from 375 px (mobile) to 1920 px (desktop). | Must Have | Usability |
| NFR-USA-02 | All interactive touch targets shall be at least 44 × 44 CSS pixels to meet mobile usability guidelines. | Must Have | Usability |
| NFR-USA-03 | No horizontal scrolling shall occur on any core page at minimum supported viewport width. | Must Have | Usability |
| NFR-USA-04 | The system shall conform to WCAG 2.1 Level AA for all public-facing and authenticated pages. | Should Have | Accessibility |
| NFR-USA-05 | All form fields shall display inline validation errors without requiring a page reload. | Must Have | Usability |
| NFR-USA-06 | All destructive actions (delete book, deactivate account) shall require a confirmation dialog before execution. | Must Have | Usability |
| NFR-USA-07 | The system shall provide meaningful empty-state messages when lists contain no data. | Must Have | Usability |

### 4.4 Reliability & Availability

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| NFR-REL-01 | The system shall maintain 99.5% uptime during library operating hours (defined as 07:00–22:00 local time). | Must Have | Reliability |
| NFR-REL-02 | The system shall perform automated daily backups of all data with a minimum 30-day retention period. | Must Have | Data Integrity |
| NFR-REL-03 | The system shall recover from a single server failure within 4 hours (Recovery Time Objective). | Must Have | Reliability |
| NFR-REL-04 | The maximum acceptable data loss in a failure scenario is 1 hour (Recovery Point Objective). | Must Have | Reliability |
| NFR-REL-05 | The database shall enforce transactional integrity; partial borrow/return records shall never be persisted. | Must Have | Data Integrity |

### 4.5 Maintainability & Scalability

| Req. ID | Requirement | Priority | Category |
|---|---|---|---|
| NFR-MNT-01 | Application source code shall be accompanied by developer documentation covering setup, deployment, and architecture. | Must Have | Maintainability |
| NFR-MNT-02 | The fine calculation engine shall be configurable through the Admin UI without requiring code changes or redeployment. | Must Have | Maintainability |
| NFR-MNT-03 | The system architecture shall support horizontal scaling to handle future growth to 500 concurrent users. | Should Have | Scalability |
| NFR-MNT-04 | Adding a new language to the localisation system shall not require changes to business logic code. | Should Have | Maintainability |
| NFR-MNT-05 | The system shall log application errors with sufficient context for diagnosis without exposing PII in log files. | Must Have | Observability |

---

## 5. External Interface Requirements

### 5.1 User Interface

- A persistent top navigation bar shall provide role-appropriate links and the language toggle on all authenticated pages.
- The catalog shall be the default landing page for unauthenticated (Guest) sessions.
- All pages shall display an appropriate page title in the browser tab.
- Loading states shall be communicated via visual indicators (spinners or skeleton screens) for any action exceeding 500 ms.
- Success and error feedback shall be presented through non-blocking toast notifications or inline messages.

### 5.2 Software Interfaces

| Interface | Specification |
|---|---|
| Web Server | HTTPS, TLS 1.2+; serves the web application over standard ports 80/443 |
| Database | Relational DBMS (PostgreSQL 14+ recommended); ACID-compliant transactions required |
| Email Service | SMTP or transactional email API (e.g., SendGrid, SES) for password-reset emails |
| Browser Compatibility | Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ (evergreen versions) |
| Authentication Tokens | HTTP-only secure cookies or JWT Bearer tokens; refresh token rotation recommended |

### 5.3 Data Interfaces

Full entity-relationship design is specified in the separate Database Design Document (LMS-DB-001).

| Entity | Key Attributes |
|---|---|
| Book | `book_id` (PK), `title`, `author`, `category_id` (FK), `total_copies`, `available_copies`, `is_active`, `created_at`, `updated_at` |
| Member | `member_id` (PK), `full_name`, `email` (unique), `phone`, `address`, `membership_date`, `is_active`, `created_at`, `updated_at` |
| BorrowTransaction | `transaction_id` (PK), `member_id` (FK), `book_id` (FK), `borrow_date`, `expected_return_date`, `actual_return_date`, `fine_amount`, `status` {active\|returned\|overdue} |
| User | `user_id` (PK), `email` (unique), `password_hash`, `role` {guest\|librarian\|admin}, `is_active`, `last_login`, `created_at` |
| Category | `category_id` (PK), `name`, `created_at` |
| FineConfig | `config_id` (PK), `daily_rate`, `effective_from`, `created_by` (FK → User) |
| AuditLog | `log_id` (PK), `user_id` (FK), `action`, `target_entity`, `target_id`, `timestamp`, `ip_address` |

---

## 6. System Constraints & Assumptions

### 6.1 System Constraints

- Version 1.0 supports a single library branch. Multi-branch federation is explicitly out of scope.
- The fine system calculates and records fines but does not integrate with any payment gateway.
- Barcode or RFID scanning is out of scope; copy tracking is by count, not by individual copy serial number.
- Self-registration by library members is out of scope; all member accounts are created by Librarians.
- Per-category or per-book fine rates are out of scope; a single global daily rate applies to all overdue returns.
- Digital/e-book content management and integration with external catalogs (e.g., ISBN lookup services) are out of scope.

### 6.2 Assumptions

- Library staff (Librarians and Admins) have access to a desktop or tablet browser during work hours.
- Network connectivity is sufficient and stable within the library premises.
- The library operates in a single time zone for fine calculation purposes.
- A system administrator with server access will be available for initial deployment and configuration.
- The organisation will provide valid SMTP credentials or an email service API key for password reset functionality.

---

## 7. Appendices

### 7.1 Requirements Traceability Matrix

| Functional Area | Requirement IDs | Count | Related User Stories |
|---|---|---|---|
| Authentication & RBAC | FR-AUTH-01 to FR-AUTH-10 | 10 | US-24, US-25 |
| Book Management | FR-BOOK-01 to FR-BOOK-10 | 10 | US-06, US-07, US-08 |
| Member Management | FR-MEM-01 to FR-MEM-08 | 8 | US-09, US-10, US-11, US-17 |
| Borrowing Transactions | FR-BOR-01 to FR-BOR-09 | 9 | US-12, US-13 |
| Returns & Fines | FR-RET-01 to FR-RET-08 | 8 | US-14, US-15, US-28 |
| Search & Filtering | FR-SRH-01 to FR-SRH-07 | 7 | US-02, US-03, US-16 |
| Administration | FR-ADM-01 to FR-ADM-08 | 8 | US-18, US-19, US-20, US-21 |
| Dashboard & Reports | FR-RPT-01 to FR-RPT-07 | 7 | US-22, US-23 |
| Localisation | FR-LOC-01 to FR-LOC-06 | 6 | US-26 |
| Performance | NFR-PRF-01 to NFR-PRF-05 | 5 | — |
| Security | NFR-SEC-01 to NFR-SEC-07 | 7 | — |
| Usability & Accessibility | NFR-USA-01 to NFR-USA-07 | 7 | US-27 |
| Reliability & Availability | NFR-REL-01 to NFR-REL-05 | 5 | — |
| Maintainability | NFR-MNT-01 to NFR-MNT-05 | 5 | — |

### 7.2 Requirement Count Summary

| Category | Count |
|---|---|
| Functional Requirements (FR) | 88 |
| Non-Functional Requirements (NFR) | 29 |
| Must Have | 79 |
| Should Have | 35 |
| **Total Requirements** | **117** |

### 7.3 Glossary

| Term | Meaning |
|---|---|
| Active Borrow | A borrowing transaction where the book has not yet been returned |
| Available Copy | A physical copy of a book that is not currently borrowed |
| Daily Fine Rate | The monetary amount charged per calendar day that a book is overdue |
| Days Overdue | The number of calendar days between the expected return date and the actual return date (0 if returned on time) |
| Soft Delete | Marking a record as inactive rather than physically removing it from the database |
| Role | A named set of permissions assigned to a user: Guest, Librarian, or Admin |
| Transaction Status | One of: `active` (book currently borrowed), `returned` (book returned on time), `overdue` (book returned late or not yet returned past due date) |

---

## Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 09/06/2026 | Initial release — all sections drafted | Systems Analysis Team |
