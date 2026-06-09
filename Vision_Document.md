# Library Management System — Vision Document

| Field | Value |
|---|---|
| **Document ID** | LMS-VIS-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | 9 June 2026 |
| **Prepared by** | Systems Analysis Team |
| **Classification** | Internal |

> *Confidential — Internal Use Only*

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Vision Statement](#2-vision-statement)
3. [Stakeholders](#3-stakeholders)
4. [Product Overview](#4-product-overview)
5. [Key Features and Capabilities](#5-key-features-and-capabilities)
6. [Scope](#6-scope)
7. [Constraints and Assumptions](#7-constraints-and-assumptions)
8. [Non-Functional Highlights](#8-non-functional-highlights)
9. [Success Metrics](#9-success-metrics)
10. [Risks and Mitigations](#10-risks-and-mitigations)
11. [Revision History](#11-revision-history)

---

## 1. Introduction

### 1.1 Purpose of This Document

This Vision Document defines the product concept, strategic objectives, key stakeholder needs, and high-level scope of the Library Management System (LMS). It serves as the authoritative statement of what the system is, why it is being built, and what it must accomplish. The document is intended to align stakeholders, guide design decisions, and provide the foundation for the Software Requirements Specification (LMS-SRS-001).

### 1.2 Project Background

Libraries today continue to depend on manual processes, disconnected spreadsheets, or aging desktop software to manage book catalogs, member records, and borrowing transactions. These approaches create operational friction, make real-time inventory visibility difficult, and leave library staff unable to serve members efficiently.

The Library Management System addresses this gap by providing a modern, web-based platform that centralises catalog management, automates borrowing workflows, enforces fine policies, and delivers analytics to library administrators — all accessible from any device without a native application install.

### 1.3 Document Scope

This document covers:

- Product vision, mission, and positioning
- Problem statement and identified pain points
- Stakeholder identification and their needs
- High-level product features and capabilities
- System boundaries and out-of-scope items
- Key constraints, assumptions, and risks
- Success metrics and acceptance criteria

### 1.4 References

| Reference | Description |
|---|---|
| LMS-SRS-001 | Library Management System — Software Requirements Specification, v1.0, June 2026 |
| LMS-US-001 | Library Management System — User Stories Document, v1.0, June 2026 |
| IEEE 830-1998 | IEEE Recommended Practice for Software Requirements Specifications |
| WCAG 2.1 AA | Web Content Accessibility Guidelines, Level AA |
| OWASP Top 10 | OWASP Web Application Security Risks (2021 Edition) |

---

## 2. Vision Statement

### 2.1 Product Vision

> **Vision:** To provide every library with a modern, accessible, and easy-to-use web platform that empowers staff to manage books, members, and lending operations efficiently — replacing paper-based and spreadsheet-driven workflows with a single, reliable system accessible from any device.

### 2.2 Mission

The Library Management System will streamline daily library operations by automating borrowing and return workflows, enforcing fine policies consistently, and providing real-time visibility into catalog availability and member activity — freeing librarians to focus on member service rather than administrative overhead.

### 2.3 Problem Statement

Libraries operating without a dedicated management system face the following key challenges:

| Pain Point | Impact |
|---|---|
| **Manual tracking** | Borrowing and return records kept in registers or spreadsheets are error-prone and slow to query. |
| **No real-time availability** | Staff cannot instantly determine how many copies of a book are available without physically checking. |
| **Inconsistent fine enforcement** | Late fines are calculated manually, leading to discrepancies and disputes with members. |
| **Limited member history** | There is no unified view of a member's past borrows, active loans, and outstanding fines. |
| **No analytics** | Administrators have no insight into popular titles, member activity, or overdue trends without laborious manual aggregation. |
| **Accessibility** | Existing tools often require native software installations or are desktop-only, limiting access for mobile or remote staff. |

### 2.4 Opportunity

By delivering a responsive, browser-based platform with role-appropriate interfaces, the LMS can eliminate these pain points, reduce staff training time, and provide a foundation for data-driven library management. The system's bilingual support (Arabic and English) ensures it can serve libraries in multilingual regions without bespoke customisation.

---

## 3. Stakeholders

### 3.1 Stakeholder Summary

| Stakeholder | Role | Interest / Concern |
|---|---|---|
| Library Administration | Executive Sponsor | Return on investment; operational efficiency; compliance with library policies. |
| Librarians | Primary End Users | Ease of use; reliable workflows for borrowing, returns, and member management; minimal training required. |
| Library Members (Patrons) | End Beneficiaries | Accurate catalog availability; transparent fine calculations; prompt service from staff. |
| IT / System Administrator | Technical Owner | Ease of deployment; maintainability; security; documentation quality. |
| Systems Analysis Team | Requirements & Design | Clear stakeholder agreement; complete, unambiguous requirements; traceable design decisions. |
| Development Team | Implementation | Well-defined, stable requirements; clear acceptance criteria; realistic timelines. |
| QA / Testing Team | Quality Assurance | Testable requirements; accessible test environments; clear definition of done. |

### 3.2 User Roles

| Role | Responsibilities |
|---|---|
| **Guest** | An anonymous visitor who can browse and search the book catalog and view availability without logging in. Prompted to log in when attempting to borrow. |
| **Librarian** | A library staff member responsible for daily operations: managing books and members, recording borrowing transactions and returns, and searching the catalog. |
| **Admin** | A platform administrator responsible for user account management, fine rate configuration, book category management, and reviewing platform-wide analytics and reports. |

---

## 4. Product Overview

### 4.1 Product Perspective

The LMS is a standalone, three-tier web application consisting of a responsive browser-based presentation layer, a server-side application layer enforcing business logic and access controls, and a relational database layer maintaining transactional integrity. The system is accessed entirely through a web browser and requires no native mobile or desktop application.

The system does not replace an existing digital platform. It will be deployed alongside legacy catalog spreadsheets, which will be migrated during the rollout phase.

### 4.2 High-Level Architecture

| Tier | Description |
|---|---|
| **Presentation Tier** | Responsive HTML5/CSS3/JavaScript web interface supporting Arabic (RTL) and English (LTR) layouts, accessible on any modern evergreen browser and on mobile viewports from 375 px. |
| **Application Tier** | Server-side business logic handling authentication, Role-Based Access Control (RBAC), borrowing workflow, automatic fine calculation, and reporting aggregation. |
| **Data Tier** | Relational database (PostgreSQL 14+ recommended) storing books, members, borrow transactions, fines, fine configuration, audit logs, and user accounts with full ACID compliance. |

---

## 5. Key Features and Capabilities

### 5.1 Feature Overview

| Feature Area | Key Capabilities |
|---|---|
| Authentication & Access Control | Email/password login; RBAC enforced on all routes and API endpoints; account lockout after repeated failed attempts; password reset via email; configurable session expiry. |
| Book Catalog Management | Full CRUD for books (title, author, category, copy count); real-time available/borrowed copy tracking; soft deletion preserving historical transaction data; immediate catalog visibility after changes. |
| Member Management | Librarian-managed member registration and profile editing; complete borrowing history per member with fine detail; active borrow and outstanding fine summary view; audit timestamps on profile changes. |
| Borrowing Transactions | Record borrow against a member and book with expected return date; real-time copy count decrement; active borrows list with overdue highlighting; filter and search across active transactions. |
| Returns & Fine Calculation | One-click return from active borrows list; automatic fine calculation (Days Overdue × Daily Rate); fine preview before confirmation; zero-fine display on timely returns; immutable fine records after confirmation. |
| Search & Filtering | Unified search bar across title, author, and category; sub-second results for catalogs up to 10,000 books; availability filter (All / Available / Borrowed); case-insensitive partial matching; accessible from any page. |
| Administration | Librarian account creation and deactivation; role assignment with next-login propagation; global daily fine rate configuration; book category management with reassignment guard; admin self-demotion prevention. |
| Dashboard & Reporting | Real-time metrics: total books, available books, active borrows, overdue count, outstanding fines; most-borrowed books chart; member activity report; dedicated overdue report with CSV export capability. |
| Localisation | English (LTR) and Arabic (RTL) language support with a single toggle; instant layout, label, and date format switching without page reload; persisted language preference across sessions. |
| Accessibility & Responsive UI | WCAG 2.1 Level AA conformance; fully functional from 375 px to 1920 px viewport; touch targets minimum 44 × 44 CSS px; no horizontal scrolling on any core page; inline validation; confirmation dialogs for destructive actions. |

### 5.2 Feature Details

#### 5.2.1 Authentication & Role-Based Access Control

Security is foundational to the LMS. Every request to a protected route or API endpoint is validated against the authenticated user's role before processing. The system prevents privilege escalation by design: Admins cannot remove their own Admin role, and role changes propagate only on the affected user's next login to avoid mid-session disruption.

- Account lockout triggers after 5 consecutive failed login attempts (15-minute lockout).
- Deactivated accounts are rejected at login with a clear error message and are never deleted.
- All admin actions — role changes, fine rule updates, account deactivations — are written to an immutable audit log with timestamp and IP address.

#### 5.2.2 Book Catalog Management

Librarians maintain the book catalog with full create, read, update, and delete capabilities. The system enforces data quality by requiring all mandatory fields (title, author, category, copy count) before saving. Soft deletion ensures that historical borrowing records remain accurate even after a book is removed from the public catalog.

- Reducing copies below the currently borrowed count triggers a warning and requires explicit confirmation.
- Deletion is blocked while any copies are borrowed.
- Available and total copy counts are updated atomically with every borrow and return.

#### 5.2.3 Borrowing Transactions & Returns

The borrowing workflow is designed for speed and accuracy. Librarians record a transaction by selecting a member, a book with available copies, and an expected return date. The system rejects past return dates at entry. On return, the fine engine automatically calculates the penalty using the current daily rate, displays it to the librarian before confirmation, and records it against the transaction.

- Fine formula: `Fine = max(0, Days Overdue) × Daily Fine Rate`
- The daily rate applied is the one configured at the time of return, not at the time of borrowing.
- Re-recording a return on an already-returned transaction is blocked.

#### 5.2.4 Localisation

The system supports Arabic and English simultaneously. Switching language updates all UI text, error messages, date formats, and layout direction (RTL/LTR) without a page reload. The user's preference is persisted across sessions, ensuring a consistent experience on return visits.

---

## 6. Scope

### 6.1 In Scope — Version 1.0

- Web-based catalog browsing and search for all users including unauthenticated guests
- Full book CRUD with copy count management for Librarians
- Member registration, profile management, and borrowing history
- Borrowing transaction recording, active borrow management, and return processing
- Automatic late fine calculation using a globally configured daily rate
- Role-Based Access Control across all routes and API endpoints (Guest, Librarian, Admin)
- Admin account management, role assignment, and category management
- Platform-wide analytics dashboard and overdue report with CSV export
- Arabic and English language support with full RTL layout
- Responsive web UI functional on mobile browsers from 375 px viewport width
- Audit logging for all privileged administrative actions

### 6.2 Out of Scope — Version 1.0

| Excluded Item | Rationale |
|---|---|
| Multi-branch / federation | The system supports a single library branch. Multi-branch inventory sharing and cross-branch borrowing are not supported. |
| Payment gateway integration | Fines are calculated and recorded but the system does not process financial transactions or integrate with payment services. |
| Barcode / RFID scanning | Copy tracking is by count only. Individual copy serial numbers, barcode scanning, and RFID integration are out of scope. |
| Self-registration by members | All member accounts are created by Librarians. Members cannot self-register via the public-facing interface. |
| Per-category fine rates | A single global daily fine rate applies to all overdue returns. Category-specific or book-type-specific fine rates are not supported. |
| E-book / digital content | The system manages physical book inventory only. Digital content platforms and external catalog lookups (e.g., ISBN services) are excluded. |
| Native mobile applications | All functionality is delivered via the responsive web browser. No iOS or Android native app is planned for v1.0. |

---

## 7. Constraints and Assumptions

### 7.1 Constraints

| Constraint | Detail |
|---|---|
| Single time zone | Fine calculations assume the library operates in a single time zone. Multi-timezone support is not required for v1.0. |
| RBAC enforcement | Role-Based Access Control must be enforced on both client and server sides; client-side enforcement alone is insufficient. |
| No code changes for fine config | The fine rate must be configurable through the Admin UI without requiring code changes or redeployment. |
| Data integrity | The database must maintain referential integrity across books, members, and transaction records at all times. |
| TLS mandatory | All client-server communications must be encrypted using TLS 1.2 or higher. |
| Browser-only delivery | No core feature may require a native application download; all functionality is web-based. |
| PII protection | All member personally identifiable information must be stored with appropriate access controls; Guests must have no access to member data. |

### 7.2 Assumptions

- Library staff (Librarians and Admins) have access to a desktop or tablet browser with a reliable internet connection during working hours.
- The library operates in a single time zone relevant to fine date calculations.
- Each book copy is trackable by count; individual copy serial numbers are not required.
- The organisation will provide valid SMTP credentials or a transactional email API key for password reset functionality.
- A system administrator with server access will be available for initial deployment and configuration.
- Infrastructure will be provisioned to meet the 99.5% uptime target during library operating hours (07:00–22:00 local time).
- Legacy catalog data in spreadsheets will be migrated to the LMS by library staff prior to go-live.

---

## 8. Non-Functional Highlights

| Quality Attribute | Strategic Requirement |
|---|---|
| **Performance** | Catalog search results within 1 second (up to 10,000 books); page loads under 3 seconds on 10 Mbps broadband; borrowing and return transactions confirmed within 2 seconds; support for 50 concurrent users with headroom to scale to 500. |
| **Security** | OWASP Top 10 protection; salted password hashing (bcrypt/Argon2); HTTP-only secure session tokens; audit log for all privileged actions; failed login logging with IP address. |
| **Reliability** | 99.5% uptime during operating hours; daily automated backups with 30-day retention; Recovery Time Objective of 4 hours; Recovery Point Objective of 1 hour; full database transactional integrity. |
| **Usability** | WCAG 2.1 Level AA conformance; responsive from 375 px to 1920 px; 44 × 44 px minimum touch targets; inline form validation; confirmation dialogs for all destructive actions. |
| **Maintainability** | Full developer documentation covering setup, deployment, and architecture; fine calculation engine configurable without code changes; language additions require no business logic changes; PII excluded from error logs. |

---

## 9. Success Metrics

| Metric Category | Target Outcome |
|---|---|
| Operational | All daily borrowing, return, and member management tasks are completable by Librarians without recourse to manual registers or spreadsheets. |
| Fine accuracy | 100% of late fine calculations match the configured daily rate with zero manual adjustments required post-launch. |
| Performance | Search response time remains under 1 second and page load time under 3 seconds under normal operating load. |
| Uptime | System availability meets or exceeds 99.5% during library operating hours in the first 90 days post-launch. |
| Adoption | All active Librarians and Admins complete onboarding and begin independent system use within 2 weeks of go-live. |
| Data integrity | Zero instances of partial or corrupt borrow/return records in the production database following go-live. |
| Accessibility | All public-facing and authenticated pages pass WCAG 2.1 Level AA automated and manual audit checks at release. |

---

## 10. Risks and Mitigations

| Risk | Impact and Mitigation |
|---|---|
| **Scope creep** | Stakeholders may request multi-branch or payment integration before v1.0 stabilises. Mitigation: Maintain a firm out-of-scope list in this document; route enhancement requests to a v1.1 backlog. |
| **Data migration complexity** | Legacy catalog spreadsheets may contain inconsistent or duplicate data requiring significant cleansing effort. Mitigation: Schedule a dedicated data migration sprint with library staff involvement before go-live. |
| **RTL UI quality** | Arabic RTL layout issues may not surface until late in development if not tested continuously. Mitigation: Include RTL layout testing in the definition of done for every UI story. |
| **Browser compatibility** | Unexpected rendering differences across evergreen browsers may cause regressions. Mitigation: Automated cross-browser testing in CI/CD pipeline targeting Chrome 120+, Firefox 120+, Safari 17+, and Edge 120+. |
| **Email service dependency** | Password reset functionality depends on SMTP or transactional email credentials provided by the organisation. Mitigation: Confirm credentials and test email flow during environment setup; document fallback (admin-initiated reset). |
| **Fine dispute risk** | Members may dispute fines if the daily rate changes between borrow and return. Mitigation: FRRET-07 mandates that the rate applied is the one current at the time of return; the audit log provides a record of rate changes. |

---

## 11. Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 09/06/2026 | Initial release — all sections drafted | Systems Analysis Team |

---

*— End of Document —*
