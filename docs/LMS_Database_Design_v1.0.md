# Database Design Document — Library Management System

| Field | Value |
|---|---|
| **Document ID** | LMS-DB-001 |
| **Version** | 1.0 |
| **Status** | Draft |
| **Date** | 9 June 2026 |
| **Prepared by** | Systems Analysis Team |
| **Classification** | Internal |

> *Confidential — Internal Use Only*

---

## Table of Contents

1. [Overview](#1-overview)
2. [Entities & Attributes](#2-entities--attributes)
   - [Users](#21-users)
   - [BookCategories](#22-bookcategories)
   - [Books](#23-books)
   - [Members](#24-members)
   - [Loans](#25-loans)
   - [FinePayments](#26-finepayments)
3. [Relationships](#3-relationships)
4. [Business Rules](#4-business-rules)
5. [Normalization Notes](#5-normalization-notes)
6. [Recommended Indexes](#6-recommended-indexes)
7. [Schema Summary (Quick Reference)](#7-schema-summary-quick-reference)
8. [Revision History](#8-revision-history)

---

## 1. Overview

The LMS database follows a **relational model** conforming to **Third Normal Form (3NF)**. It is designed for a single-branch library supporting three user roles (Admin, Librarian, Member) and tracks the full lifecycle of book loans, returns, fine calculation, and fine payment.

The schema separates concerns cleanly:

- **Users** handles authentication and RBAC for all system actors.
- **Members** extends Users with borrowing-specific data, maintaining a clean 1:1 relationship.
- **Books** and **BookCategories** manage the catalog.
- **Loans** is the core associative/transaction table linking members to books over time.
- **FinePayments** provides an auditable ledger of all fine payment activity.

**Recommended DBMS:** PostgreSQL 14+  
**Compliance:** ACID transactions required on all loan/return/fine operations.

---

## 2. Entities & Attributes

### 2.1 Users

> Base user table — supports Role-Based Access Control (RBAC) for all system actors.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key |
| `clerkId` | String | NOT NULL, UNIQUE | External auth provider ID (Clerk) |
| `email` | String | NOT NULL, UNIQUE | Used for login and communication |
| `password_hash` | String | NOT NULL | Stored as salted hash (bcrypt / Argon2) |
| `full_name` | String | NOT NULL | Display name |
| `phone` | String | NULLABLE | Contact number |
| `national_id` | String | NULLABLE, UNIQUE | Optional government ID |
| `role` | ENUM | NOT NULL | `'Admin'`, `'Librarian'`, `'Member'` |
| `is_active` | Boolean | NOT NULL, DEFAULT `true` | Soft-disable without deletion |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | Timestamp | NOT NULL | Auto-updated on any change |

**Notes:**
- `clerkId` ties this record to the Clerk authentication provider. It must be populated for all users who log in via Clerk.
- `is_active = false` prevents login without deleting historical audit data.
- `role` is enforced on both client and server; every API endpoint validates the session role before processing.

---

### 2.2 BookCategories

> Lookup table for book classification. Managed exclusively by Admins.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key |
| `name` | String | NOT NULL, UNIQUE | e.g., `"Fiction"`, `"Science"`, `"Computer Science"` |
| `description` | Text | NULLABLE | Optional description of the category |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |

**Notes:**
- A category cannot be deleted while books are assigned to it. Books must be reassigned to another category first (enforced at application layer).
- `name` uniqueness prevents duplicate categories.

---

### 2.3 Books

> Catalog of physical book titles. Tracks copy inventory.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key |
| `isbn` | String | NULLABLE, UNIQUE | International Standard Book Number |
| `title` | String | NOT NULL | Book title |
| `author` | String | NOT NULL | Author name(s) |
| `publisher` | String | NULLABLE | Publisher name |
| `publication_year` | Integer | NULLABLE | Year of publication |
| `category_id` | ObjectId / UUID | NOT NULL, FK → `BookCategories.id` | Each book belongs to exactly one category |
| `total_copies` | Integer | NOT NULL, DEFAULT `1` | Total physical copies owned |
| `available_copies` | Integer | NOT NULL | Copies not currently on loan — must be `≤ total_copies` |
| `description` | Text | NULLABLE | Book synopsis or notes |
| `cover_image_url` | String | NULLABLE | URL to cover image asset |
| `is_active` | Boolean | NOT NULL, DEFAULT `true` | Soft-delete flag |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | Timestamp | NOT NULL | Auto-updated on any change |

**Notes:**
- `available_copies` is decremented on loan creation and incremented on return. This must be atomic (wrapped in a database transaction).
- `available_copies` must never go below `0` or exceed `total_copies` — enforced by a CHECK constraint and/or application logic.
- Soft deletion (`is_active = false`) hides the book from the catalog but preserves historical loan records.
- Reducing `total_copies` below the number of currently active loans must trigger a warning and require explicit confirmation.

---

### 2.4 Members

> Extends Users with borrowing privileges and membership metadata.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key (may equal `user_id`) |
| `user_id` | ObjectId / UUID | NOT NULL, UNIQUE, FK → `Users.id` | 1:1 relationship with the Users table |
| `membership_number` | String | NOT NULL, UNIQUE | Human-readable library membership identifier |
| `membership_type` | ENUM | NOT NULL | `'Student'`, `'Faculty'`, `'Public'` (extensible) |
| `membership_start_date` | Date | NOT NULL | Date membership became active |
| `membership_end_date` | Date | NULLABLE | Expiry date; NULL = indefinite |
| `outstanding_fine` | Decimal(10,2) | NOT NULL, DEFAULT `0.00` | Running total of all unpaid fines |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |
| `updated_at` | Timestamp | NOT NULL | Auto-updated on any change |

**Notes:**
- The separation of `Users` and `Members` allows for staff accounts (Admin, Librarian) that have no borrowing privileges, and supports future guest user roles.
- `outstanding_fine` is a denormalized summary field for performance — it should be kept in sync with the sum of unpaid `fine_amount` values across all related `Loans`. Update it transactionally on every return and fine payment.
- `membership_end_date` can be checked at loan time to prevent expired members from borrowing.

---

### 2.5 Loans

> Core transaction table — the associative entity linking Members to Books over time.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key (`loan_id`) |
| `book_id` | ObjectId / UUID | NOT NULL, FK → `Books.id` | The book being loaned |
| `member_id` | ObjectId / UUID | NOT NULL, FK → `Members.id` | The borrowing member |
| `borrowed_by` | ObjectId / UUID | NOT NULL, FK → `Users.id` | The Librarian who issued the loan |
| `loan_date` | Date | NOT NULL, DEFAULT TODAY | Date the book was issued |
| `expected_return_date` | Date | NOT NULL | Must be a future date at time of creation |
| `actual_return_date` | Date | NULLABLE | Populated when the book is returned |
| `status` | ENUM | NOT NULL, DEFAULT `'Active'` | `'Active'`, `'Returned'`, `'Overdue'`, `'Lost'` |
| `fine_amount` | Decimal(10,2) | NOT NULL, DEFAULT `0.00` | Fine calculated at return or accrued daily |
| `fine_paid` | Boolean | NOT NULL, DEFAULT `false` | Whether the fine on this loan has been settled |
| `notes` | Text | NULLABLE | Free-text notes by the Librarian |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |

**Fine Calculation Formula:**

```
fine_amount = MAX(0, (actual_return_date - expected_return_date)) × daily_fine_rate
```

Where `daily_fine_rate` is the value from `FineConfig` **at the time of return** (not at the time of borrowing).

**Status Transitions:**

```
Active ──► Returned   (book returned on time or late)
Active ──► Overdue    (expected_return_date has passed; not yet returned)
Active ──► Lost       (manually marked lost by Librarian)
Overdue ──► Returned  (book returned after due date — fine calculated)
Overdue ──► Lost      (manually marked lost)
```

**Notes:**
- `expected_return_date` must be strictly greater than `loan_date` — past dates are rejected at application layer.
- A loan record is **immutable** once `status = 'Returned'`. Re-recording a return on an already-returned loan is blocked.
- `borrowed_by` records accountability — which Librarian issued the loan.
- `status` should be updated to `'Overdue'` either via a scheduled job (nightly) or computed dynamically on read.

---

### 2.6 FinePayments

> Optional auditable ledger for tracking fine payments, including support for partial payments.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | ObjectId / UUID | PK | Auto-generated primary key (`payment_id`) |
| `loan_id` | ObjectId / UUID | NOT NULL, FK → `Loans.id` | The loan this payment applies to |
| `member_id` | ObjectId / UUID | NOT NULL, FK → `Members.id` | The member paying the fine |
| `amount_paid` | Decimal(10,2) | NOT NULL | Amount paid in this transaction |
| `payment_date` | Timestamp | NOT NULL, DEFAULT NOW() | Date and time of payment |
| `payment_method` | String | NOT NULL | e.g., `'Cash'`, `'Card'`, `'Transfer'` |
| `received_by` | ObjectId / UUID | NOT NULL, FK → `Users.id` | The Librarian who received the payment |
| `created_at` | Timestamp | NOT NULL, DEFAULT NOW() | Record creation time |

**Notes:**
- A single loan can have multiple `FinePayments` rows to support partial payments (e.g., a member pays half the fine now and the rest later).
- When the sum of `amount_paid` across all payments for a loan equals `fine_amount`, set `Loans.fine_paid = true` and subtract from `Members.outstanding_fine`.
- All fine payment operations must be wrapped in a transaction to maintain consistency between `FinePayments`, `Loans.fine_paid`, and `Members.outstanding_fine`.

---

## 3. Relationships

| Relationship | Cardinality | Description |
|---|---|---|
| `Users` → `Members` | **1 : 1** | One user account can have one member profile. Not all users are members (e.g., Admins and Librarians may have no `Members` record). |
| `BookCategories` → `Books` | **1 : N** | One category contains many books. Each book belongs to exactly one category. |
| `Books` → `Loans` | **1 : N** | One book title can appear in many loan records over time (sequential borrows). |
| `Members` → `Loans` | **1 : N** | One member can have many loans — both active and historical. |
| `Users (Librarian)` → `Loans` | **1 : N** | One librarian can issue many loans (`borrowed_by` FK). |
| `Loans` → `FinePayments` | **1 : N** | One loan can have many fine payment records (supports partial payments). |
| `Members` → `FinePayments` | **1 : N** | One member can make many fine payments across multiple loans. |
| `Users (Librarian)` → `FinePayments` | **1 : N** | One librarian can receive many fine payments (`received_by` FK). |

### Entity-Relationship Summary

```
Users ─────────────── 1:1 ─────────────── Members
  │                                           │
  │ (borrowed_by)                             │
  │                                           │
  └──── 1:N ──── Loans ────── N:1 ───────────┘
                   │
                   │ 1:N
                   │
              FinePayments
                   │
                   └── N:1 ── Members
                   └── N:1 ── Users (received_by)

BookCategories ── 1:N ── Books ── 1:N ── Loans
```

---

## 4. Business Rules

The following rules are enforced by the database design and/or application logic:

| # | Rule | Enforcement Layer |
|---|---|---|
| 1 | A book can only be borrowed if `available_copies > 0`. | Application + DB CHECK |
| 2 | `available_copies` decrements by 1 on loan creation and increments by 1 on return — atomically. | DB Transaction |
| 3 | `available_copies` must never be `< 0` or `> total_copies`. | DB CHECK Constraint |
| 4 | `expected_return_date` must be a future date (strictly greater than `loan_date`). | Application Validation |
| 5 | A return cannot be re-recorded on a loan with `status = 'Returned'`. | Application Validation |
| 6 | Fine = `MAX(0, days_overdue) × daily_fine_rate` using the rate **at time of return**. | Application Logic |
| 7 | Fine rate changes apply to future returns only — they do not retroactively alter existing `fine_amount` values. | Application Logic |
| 8 | A `BookCategory` cannot be deleted while books are assigned to it. | Application Validation |
| 9 | Reducing `total_copies` below the count of active loans requires explicit confirmation. | Application Validation |
| 10 | An Admin cannot remove their own Admin role. | Application Validation |
| 11 | All privileged admin actions are written to an audit log. | Application / Trigger |
| 12 | `Members.outstanding_fine` is kept in sync with the sum of unpaid fines across all related loans. | DB Transaction |

---

## 5. Normalization Notes

The schema achieves **Third Normal Form (3NF)**:

| Principle | How it is met |
|---|---|
| **1NF** — Atomic values, no repeating groups | Every column holds a single atomic value. No arrays or comma-separated lists in any column. |
| **2NF** — No partial dependencies | All tables use a single surrogate PK (`id`). Every non-key attribute depends fully on that PK. |
| **3NF** — No transitive dependencies | No non-key attribute depends on another non-key attribute. `Members.outstanding_fine` is a controlled denormalization for performance, acknowledged and managed transactionally. |
| **Associative entity** | `Loans` acts as a rich junction/associative entity resolving the many-to-many relationship between `Books` and `Members` over time, with full transaction metadata. |
| **Role separation** | `Users` and `Members` are separate tables. This allows Admin/Librarian accounts to exist without borrowing records, and supports future user types without schema changes. |
| **Auditability** | `FinePayments` is a separate table rather than a single column on `Loans`, enabling partial payment tracking and a full payment audit trail. |

---

## 6. Recommended Indexes

Indexes are recommended based on the most frequent query patterns: catalog search, loan status checks, member lookups, and overdue reporting.

### Users

| Index | Column(s) | Reason |
|---|---|---|
| `idx_users_email` | `email` | Login lookup |
| `idx_users_role` | `role` | Role-based filtering |
| `idx_users_clerkId` | `clerkId` | Clerk auth sync |

### BookCategories

| Index | Column(s) | Reason |
|---|---|---|
| `idx_categories_name` | `name` | Uniqueness check + dropdown population |

### Books

| Index | Column(s) | Reason |
|---|---|---|
| `idx_books_title` | `title` | Catalog search |
| `idx_books_author` | `author` | Catalog search |
| `idx_books_isbn` | `isbn` | ISBN lookup |
| `idx_books_category_id` | `category_id` | Category filter |
| `idx_books_is_active` | `is_active` | Exclude soft-deleted books from catalog |

### Members

| Index | Column(s) | Reason |
|---|---|---|
| `idx_members_user_id` | `user_id` | 1:1 join with Users |
| `idx_members_membership_number` | `membership_number` | Member search / uniqueness |
| `idx_members_outstanding_fine` | `outstanding_fine` | Fine reporting |

### Loans

| Index | Column(s) | Reason |
|---|---|---|
| `idx_loans_member_id` | `member_id` | Member borrowing history |
| `idx_loans_book_id` | `book_id` | Book loan history |
| `idx_loans_status` | `status` | Active / overdue filtering |
| `idx_loans_expected_return_date` | `expected_return_date` | Overdue detection |
| `idx_loans_loan_date` | `loan_date` | Date-range reporting |
| `idx_loans_member_status` | `(member_id, status)` | Composite: active loans per member |

### FinePayments

| Index | Column(s) | Reason |
|---|---|---|
| `idx_finepayments_loan_id` | `loan_id` | Payment history per loan |
| `idx_finepayments_member_id` | `member_id` | Payment history per member |
| `idx_finepayments_payment_date` | `payment_date` | Date-range reporting |

---

## 7. Schema Summary (Quick Reference)

```
┌─────────────────────────────────────────────────────────────────────┐
│ TABLE          │ PK    │ Key FKs                    │ Key Fields     │
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ Users          │ id    │ —                          │ clerkId, email,│
│                │       │                            │ role, is_active│
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ BookCategories │ id    │ —                          │ name           │
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ Books          │ id    │ category_id → BookCategories│ isbn, title,  │
│                │       │                            │ available_copies│
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ Members        │ id    │ user_id → Users            │ membership_    │
│                │       │                            │ number, type,  │
│                │       │                            │ outstanding_fine│
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ Loans          │ id    │ book_id → Books            │ status,        │
│                │       │ member_id → Members        │ fine_amount,   │
│                │       │ borrowed_by → Users        │ fine_paid      │
├────────────────┼───────┼────────────────────────────┼────────────────┤
│ FinePayments   │ id    │ loan_id → Loans            │ amount_paid,   │
│                │       │ member_id → Members        │ payment_method │
│                │       │ received_by → Users        │                │
└─────────────────────────────────────────────────────────────────────┘
```

### ENUM Reference

| Table | Column | Values |
|---|---|---|
| `Users` | `role` | `'Admin'`, `'Librarian'`, `'Member'` |
| `Members` | `membership_type` | `'Student'`, `'Faculty'`, `'Public'` |
| `Loans` | `status` | `'Active'`, `'Returned'`, `'Overdue'`, `'Lost'` |

---

## 8. Revision History

| Version | Date | Description | Author |
|---|---|---|---|
| 1.0 | 09/06/2026 | Initial release — all entities, relationships, and indexes defined | Systems Analysis Team |

---

*— End of Document —*
