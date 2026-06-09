# Library Management System — API Endpoints
**Document ID:** LMS-API-001  
**Version:** 1.0  
**Date:** 9 June 2026  
**Base URL:** `https://<host>/api/v1`

---

## Conventions

| Convention | Detail |
|------------|--------|
| **Auth** | HTTP-only secure cookie or `Authorization: Bearer <token>` |
| **Roles** | `G` = Guest (unauthenticated) · `L` = Librarian · `A` = Admin |
| **Format** | All request/response bodies are `application/json` |
| **Errors** | `{ "error": "<message>", "code": "<ERROR_CODE>" }` |
| **Success** | `{ "data": { ... } }` or `{ "data": [ ... ] }` |
| **Pagination** | `?page=1&limit=20` — responses include `meta.total`, `meta.page`, `meta.limit` |

---

## 1. Authentication

### `POST /auth/login`
Log in with email and password.

**Access:** Public (G, L, A)

**Request body:**
```json
{
  "email": "librarian@library.org",
  "password": "s3cur3P@ss"
}
```

**Responses:**

| Status | Meaning |
|--------|---------|
| `200` | Login successful — returns user profile and sets session token |
| `401` | Invalid credentials |
| `403` | Account deactivated |
| `429` | Account locked (5 failed attempts) — retry after 15 minutes |

**200 body:**
```json
{
  "data": {
    "user_id": "usr_01",
    "email": "librarian@library.org",
    "role": "librarian",
    "name": "Sara Ahmed"
  }
}
```

---

### `POST /auth/logout`
Invalidate the current session token.

**Access:** L, A

**Responses:** `204 No Content`

---

### `POST /auth/forgot-password`
Send a password-reset email.

**Access:** Public

**Request body:**
```json
{ "email": "user@library.org" }
```

**Responses:** `200` always (prevents account enumeration)

---

### `POST /auth/reset-password`
Complete a password reset using the emailed token.

**Access:** Public

**Request body:**
```json
{
  "token": "<reset_token>",
  "new_password": "newP@ssw0rd"
}
```

**Responses:** `200` · `400` (invalid or expired token)

---

## 2. Books

### `GET /books`
Retrieve the book catalog. Available to all users including guests.

**Access:** G, L, A

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Search across title, author, category (case-insensitive, substring) |
| `availability` | `all` \| `available` \| `borrowed` | Filter by copy availability |
| `category_id` | string | Filter by category |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 20, max: 100) |

**Responses:** `200` — paginated list of books

**200 body:**
```json
{
  "data": [
    {
      "book_id": "bk_01",
      "title": "Clean Code",
      "author": "Robert C. Martin",
      "category": { "category_id": "cat_01", "name": "Engineering" },
      "total_copies": 5,
      "available_copies": 3,
      "is_active": true
    }
  ],
  "meta": { "total": 142, "page": 1, "limit": 20 }
}
```

---

### `GET /books/:book_id`
Get full details for a single book.

**Access:** G, L, A

**Responses:** `200` · `404`

---

### `POST /books`
Add a new book to the catalog.

**Access:** L, A

**Request body:**
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category_id": "cat_01",
  "total_copies": 5
}
```

**Responses:** `201` · `400` (validation error) · `403`

---

### `PUT /books/:book_id`
Update a book's details.

**Access:** L, A

**Request body:** Any subset of `title`, `author`, `category_id`, `total_copies`

**Responses:** `200` · `400` · `404` · `403`

> ⚠️ If `total_copies` is reduced below the current borrowed count, the server returns `200` with `"warning": "copies_below_borrowed"` and requires re-submission with `"force": true`.

---

### `DELETE /books/:book_id`
Soft-delete a book (sets `is_active = false`).

**Access:** L, A

**Responses:** `204` · `409` (copies currently borrowed) · `404` · `403`

---

## 3. Members

### `GET /members`
List all members.

**Access:** L, A

**Query params:** `q` (name or email search), `page`, `limit`

**Responses:** `200` — paginated member list

---

### `GET /members/:member_id`
Get a member's profile, active borrows, and outstanding fines summary.

**Access:** L, A

**Responses:** `200` · `404`

**200 body:**
```json
{
  "data": {
    "member_id": "mem_01",
    "full_name": "Ahmed Khalil",
    "email": "ahmed@example.com",
    "phone": "+20100000000",
    "address": "Cairo, Egypt",
    "membership_date": "2025-01-15",
    "is_active": true,
    "active_borrows_count": 2,
    "outstanding_fines_total": 15.00,
    "updated_at": "2026-05-10T09:00:00Z"
  }
}
```

---

### `POST /members`
Register a new member.

**Access:** L, A

**Request body:**
```json
{
  "full_name": "Ahmed Khalil",
  "email": "ahmed@example.com",
  "phone": "+20100000000",
  "address": "Cairo, Egypt",
  "membership_date": "2026-06-09"
}
```

**Responses:** `201` · `400` (duplicate email) · `403`

---

### `PUT /members/:member_id`
Update a member's profile.

**Access:** L, A

**Responses:** `200` · `400` · `404` · `403`

---

### `GET /members/:member_id/history`
Get a member's full borrowing history.

**Access:** L, A

**Query params:** `sort` (`date_asc` | `date_desc`), `status` (`active` | `returned` | `overdue`), `page`, `limit`

**Responses:** `200` — paginated transaction list with fine detail per row

---

## 4. Borrow Transactions

### `GET /transactions`
List all active borrowing transactions.

**Access:** L, A

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | `active` \| `overdue` \| `returned` | Filter by status |
| `member_name` | string | Search by borrower name |
| `from` | date (`YYYY-MM-DD`) | Expected return date range start |
| `to` | date (`YYYY-MM-DD`) | Expected return date range end |
| `page` | integer | |
| `limit` | integer | |

**Responses:** `200` — paginated list; overdue items include `"is_overdue": true`

---

### `GET /transactions/:transaction_id`
Get full details of a single transaction.

**Access:** L, A

**Responses:** `200` · `404`

---

### `POST /transactions`
Record a new borrowing transaction.

**Access:** L, A

**Request body:**
```json
{
  "member_id": "mem_01",
  "book_id": "bk_01",
  "expected_return_date": "2026-06-30"
}
```

**Responses:**

| Status | Meaning |
|--------|---------|
| `201` | Transaction created; `available_copies` decremented |
| `400` | Validation error (past return date, missing fields) |
| `409` | No available copies |
| `403` | Insufficient role |

---

### `POST /transactions/:transaction_id/return`
Record the return of a borrowed book and calculate the fine.

**Access:** L, A

**Request body:**
```json
{ "confirm": true }
```

> Call without `"confirm": true` (or omit body) to get a **fine preview** without committing the return.

**Response — preview (confirm omitted):**
```json
{
  "data": {
    "transaction_id": "txn_01",
    "days_overdue": 3,
    "daily_rate": 5.00,
    "fine_amount": 15.00,
    "is_on_time": false
  }
}
```

**Response — confirmed (`confirm: true`):**
```json
{
  "data": {
    "transaction_id": "txn_01",
    "actual_return_date": "2026-07-03",
    "fine_amount": 15.00,
    "status": "returned"
  }
}
```

| Status | Meaning |
|--------|---------|
| `200` | Return recorded; `available_copies` incremented |
| `409` | Transaction already returned |
| `404` | Transaction not found |
| `403` | Insufficient role |

---

## 5. Categories

### `GET /categories`
List all book categories.

**Access:** G, L, A

**Responses:** `200`

```json
{
  "data": [
    { "category_id": "cat_01", "name": "Engineering", "book_count": 42 }
  ]
}
```

---

### `POST /categories`
Create a new category.

**Access:** A

**Request body:** `{ "name": "History" }`

**Responses:** `201` · `400` (duplicate name) · `403`

---

### `PUT /categories/:category_id`
Rename a category.

**Access:** A

**Responses:** `200` · `400` · `404` · `403`

---

### `DELETE /categories/:category_id`
Delete a category.

**Access:** A

**Responses:** `204` · `409` (books still assigned — must be reassigned first) · `403`

---

## 6. Administration — User Accounts

### `GET /admin/users`
List all user accounts.

**Access:** A

**Query params:** `role` (`librarian` | `admin` | `guest`), `is_active` (`true` | `false`), `q`, `page`, `limit`

**Responses:** `200`

---

### `POST /admin/users`
Create a new Librarian or Admin account.

**Access:** A

**Request body:**
```json
{
  "full_name": "Sara Ahmed",
  "email": "sara@library.org",
  "role": "librarian"
}
```

**Responses:** `201` · `400` (duplicate email) · `403`

---

### `PUT /admin/users/:user_id`
Update a user account (name, email, role).

**Access:** A

**Responses:** `200` · `400` · `403`

> ⚠️ An Admin cannot change their own role away from `admin` — returns `403` with `"code": "SELF_DEMOTION_BLOCKED"`.  
> Role changes take effect on the affected user's next login.

---

### `POST /admin/users/:user_id/deactivate`
Deactivate a user account (does not delete it).

**Access:** A

**Responses:** `200` · `404` · `403`

---

### `POST /admin/users/:user_id/activate`
Re-activate a deactivated account.

**Access:** A

**Responses:** `200` · `404` · `403`

---

## 7. Administration — Fine Configuration

### `GET /admin/fine-config`
Get the current and historical daily fine rate configuration.

**Access:** L, A

**Responses:** `200`

```json
{
  "data": {
    "current_rate": 5.00,
    "effective_from": "2026-06-01T00:00:00Z",
    "created_by": "usr_admin_01"
  }
}
```

---

### `POST /admin/fine-config`
Set a new global daily fine rate.

**Access:** A

**Request body:**
```json
{ "daily_rate": 7.50 }
```

**Responses:** `201` · `400` (non-positive value) · `403`

> The new rate applies to all future returns only. Existing fine records are unaffected.

---

## 8. Dashboard & Reports

### `GET /reports/dashboard`
Retrieve real-time dashboard metrics.

**Access:** L (limited metrics), A (full metrics)

**Responses:** `200`

```json
{
  "data": {
    "total_books": 520,
    "available_books": 371,
    "active_borrows": 149,
    "overdue_count": 23,
    "outstanding_fines_total": 345.00
  }
}
```

---

### `GET /reports/most-borrowed`
Top borrowed books (Admin only).

**Access:** A

**Query params:** `limit` (default: 10)

**Responses:** `200`

---

### `GET /reports/member-activity`
Members ranked by borrow count (Admin only).

**Access:** A

**Query params:** `limit` (default: 10)

**Responses:** `200`

---

### `GET /reports/overdue`
Full overdue report: member name, book title, days overdue, accrued fine.

**Access:** A

**Query params:** `page`, `limit`, `format` (`json` | `csv`)

**Responses:** `200` JSON · `200` CSV file download when `format=csv`

**CSV headers:**
```
member_name,book_title,borrow_date,expected_return_date,days_overdue,accrued_fine
```

---

## 9. Localisation

### `GET /locale`
Get available languages.

**Access:** G, L, A

**Responses:**
```json
{
  "data": [
    { "code": "en", "label": "English", "direction": "ltr" },
    { "code": "ar", "label": "عربي", "direction": "rtl" }
  ]
}
```

---

### `PUT /locale`
Set the user's language preference (persisted across sessions).

**Access:** L, A

**Request body:** `{ "locale": "ar" }`

**Responses:** `200` · `400` (unsupported locale)

---

## 10. Audit Log

### `GET /admin/audit-log`
View the immutable audit log of privileged actions.

**Access:** A

**Query params:** `user_id`, `action`, `from` (date), `to` (date), `page`, `limit`

**Responses:** `200`

```json
{
  "data": [
    {
      "log_id": "log_001",
      "user_id": "usr_admin_01",
      "action": "ROLE_CHANGE",
      "target_entity": "User",
      "target_id": "usr_002",
      "timestamp": "2026-06-09T10:30:00Z",
      "ip_address": "197.x.x.x"
    }
  ]
}
```

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_CREDENTIALS` | 401 | Email or password incorrect |
| `ACCOUNT_DEACTIVATED` | 403 | Account has been deactivated |
| `ACCOUNT_LOCKED` | 429 | Too many failed login attempts |
| `FORBIDDEN` | 403 | Insufficient role for this action |
| `SELF_DEMOTION_BLOCKED` | 403 | Admin cannot remove own admin role |
| `NO_COPIES_AVAILABLE` | 409 | Book has no available copies to borrow |
| `ALREADY_RETURNED` | 409 | This transaction has already been returned |
| `COPIES_BELOW_BORROWED` | 400 | Requested copy count is below borrowed count |
| `ACTIVE_BORROWS_EXIST` | 409 | Cannot delete book with active borrows |
| `CATEGORY_HAS_BOOKS` | 409 | Reassign books before deleting category |
| `DUPLICATE_EMAIL` | 400 | Email address already in use |
| `PAST_RETURN_DATE` | 400 | Expected return date must be in the future |
| `NOT_FOUND` | 404 | Requested resource does not exist |
| `VALIDATION_ERROR` | 400 | One or more fields failed validation |

---

*LMS-API-001 | v1.0 | 9 June 2026 | Systems Analysis Team*
