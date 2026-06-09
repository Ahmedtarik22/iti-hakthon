# Library Management System — User Stories

| Field | Value |
|---|---|
| **Version** | 1.0 |
| **Date** | 9 June 2026 |
| **Total User Stories** | 28 |

> *Confidential — Internal Use Only*

---

## Summary

| Role | Stories | Epics |
|---|---|---|
| Guest | 5 | Catalog Browsing |
| Librarian | 12 | Book Management, Member Management, Borrowing, Returns, Search |
| Admin | 6 | User Management, Fine Configuration, Category Management, Reports & Analytics |
| Shared | 5 | Authentication, Localisation, Responsive UI, Fine Engine |

---

## Table of Contents

- [Guest Stories](#guest-stories)
  - [US-01 Browse the book catalog](#us-01-browse-the-book-catalog)
  - [US-02 Search books by title, author, or category](#us-02-search-books-by-title-author-or-category)
  - [US-03 Filter catalog by availability](#us-03-filter-catalog-by-availability)
  - [US-04 View book details](#us-04-view-book-details)
  - [US-05 Prompted to log in to borrow](#us-05-prompted-to-log-in-to-borrow)
- [Librarian Stories](#librarian-stories)
  - [US-06 Add a new book](#us-06-add-a-new-book)
  - [US-07 Edit book details](#us-07-edit-book-details)
  - [US-08 Delete a book](#us-08-delete-a-book)
  - [US-09 Register a new member](#us-09-register-a-new-member)
  - [US-10 Edit a member's profile](#us-10-edit-a-members-profile)
  - [US-11 View a member's borrowing history](#us-11-view-a-members-borrowing-history)
  - [US-12 Record a borrowing transaction](#us-12-record-a-borrowing-transaction)
  - [US-13 View all currently borrowed books](#us-13-view-all-currently-borrowed-books)
  - [US-14 Record a book return](#us-14-record-a-book-return)
  - [US-15 Auto-calculate late fine on return](#us-15-auto-calculate-late-fine-on-return)
  - [US-16 Search books by title, author, or category](#us-16-search-books-by-title-author-or-category)
  - [US-17 View a member's active borrows and outstanding fines](#us-17-view-a-members-active-borrows-and-outstanding-fines)
- [Admin Stories](#admin-stories)
  - [US-18 Manage librarian accounts](#us-18-manage-librarian-accounts)
  - [US-19 Assign and change user roles](#us-19-assign-and-change-user-roles)
  - [US-20 Configure the daily fine rate](#us-20-configure-the-daily-fine-rate)
  - [US-21 Manage book categories](#us-21-manage-book-categories)
  - [US-22 View platform-wide analytics dashboard](#us-22-view-platform-wide-analytics-dashboard)
  - [US-23 View overdue books and outstanding fines report](#us-23-view-overdue-books-and-outstanding-fines-report)
- [Shared Stories](#shared-stories)
  - [US-24 Log in with email and password](#us-24-log-in-with-email-and-password)
  - [US-25 Role-based access control](#us-25-role-based-access-control)
  - [US-26 Switch UI language between Arabic and English](#us-26-switch-ui-language-between-arabic-and-english)
  - [US-27 Use the app on a mobile browser](#us-27-use-the-app-on-a-mobile-browser)
  - [US-28 Automatic fine calculation on all overdue borrows](#us-28-automatic-fine-calculation-on-all-overdue-borrows)

---

## Guest Stories

> Users who browse the library without an account.

### US-01 Browse the book catalog

| Field | Value |
|---|---|
| **Role** | Guest |
| **Epic** | Catalog Browsing |
| **Priority** | High |

**As a** guest, **I want to** browse the full book catalog **so that** I can discover available titles without needing an account.

**Acceptance Criteria:**

1. Catalog displays title, author, category, and availability status
2. Results are paginated or infinitely scrolled
3. No login is required to view the list

---

### US-02 Search books by title, author, or category

| Field | Value |
|---|---|
| **Role** | Guest |
| **Epic** | Catalog Browsing |
| **Priority** | High |

**As a** guest, **I want to** search for books by title, author, or category **so that** I can quickly find what I'm looking for.

**Acceptance Criteria:**

1. Search bar is prominently placed on the catalog page
2. Results update dynamically or on submit
3. Empty-state message shown when no results match

---

### US-03 Filter catalog by availability

| Field | Value |
|---|---|
| **Role** | Guest |
| **Epic** | Catalog Browsing |
| **Priority** | Medium |

**As a** guest, **I want to** filter books by availability (available / borrowed) **so that** I know which books I can borrow right now.

**Acceptance Criteria:**

1. Filter control visible on the catalog page
2. Available copies count is shown per book
3. Borrowed books are visually distinguished

---

### US-04 View book details

| Field | Value |
|---|---|
| **Role** | Guest |
| **Epic** | Catalog Browsing |
| **Priority** | Medium |

**As a** guest, **I want to** view a book's detail page **so that** I can read a full description, see the category, and check copy availability.

**Acceptance Criteria:**

1. Detail page shows title, author, category, total copies, and available copies
2. Page is accessible without login
3. A login prompt appears if the guest attempts to borrow

---

### US-05 Prompted to log in to borrow

| Field | Value |
|---|---|
| **Role** | Guest |
| **Epic** | Catalog Browsing |
| **Priority** | Low |

**As a** guest, **I want to** be clearly prompted to log in when I try to borrow a book **so that** I understand why the action is unavailable.

**Acceptance Criteria:**

1. Borrow button/link is visible but triggers a login modal or redirect
2. Message explains that an account is required
3. Guest can navigate back to the catalog after seeing the prompt

---

## Librarian Stories

> Staff who manage books, members, borrowing, and returns.

### US-06 Add a new book

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Book Management |
| **Priority** | High |

**As a** librarian, **I want to** add a new book to the catalog **so that** members can see and borrow it.

**Acceptance Criteria:**

1. Form accepts title, author, category, and number of copies
2. Validation prevents saving with empty required fields
3. Newly added book appears immediately in the catalog

---

### US-07 Edit book details

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Book Management |
| **Priority** | High |

**As a** librarian, **I want to** edit a book's details **so that** catalog information stays accurate.

**Acceptance Criteria:**

1. All fields editable except system-generated ID
2. Changes saved immediately and reflected in the catalog
3. Warning shown if reducing copies below the number currently borrowed

---

### US-08 Delete a book

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Book Management |
| **Priority** | Medium |

**As a** librarian, **I want to** delete a book from the catalog **so that** discontinued titles are removed.

**Acceptance Criteria:**

1. Delete requires confirmation dialog
2. Books with active borrows cannot be deleted until all copies are returned
3. Deleted books are removed from search results

---

### US-09 Register a new member

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Member Management |
| **Priority** | High |

**As a** librarian, **I want to** register a new member **so that** they can borrow books from the library.

**Acceptance Criteria:**

1. Form collects name, contact info, and membership details
2. Duplicate email or ID is rejected with a clear error
3. New member profile is saved and searchable immediately

---

### US-10 Edit a member's profile

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Member Management |
| **Priority** | Medium |

**As a** librarian, **I want to** update a member's profile **so that** contact and membership details remain current.

**Acceptance Criteria:**

1. All profile fields are editable
2. Changes are saved and reflected immediately
3. Audit timestamp of last update is recorded

---

### US-11 View a member's borrowing history

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Member Management |
| **Priority** | Medium |

**As a** librarian, **I want to** view the full borrowing history of a member **so that** I can resolve disputes or assist with recommendations.

**Acceptance Criteria:**

1. History lists all past and current borrows with dates
2. Late fines per transaction are shown
3. History is sortable by date or status

---

### US-12 Record a borrowing transaction

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Borrowing |
| **Priority** | High |

**As a** librarian, **I want to** record a borrow transaction for a member **so that** the system tracks which book they have and when it is due.

**Acceptance Criteria:**

1. Form links a member, a book, and an expected return date
2. Available copy count decreases by one on save
3. Transaction appears in the member's active borrows list

---

### US-13 View all currently borrowed books

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Borrowing |
| **Priority** | High |

**As a** librarian, **I want to** see all currently borrowed books **so that** I have a live picture of the library's circulation.

**Acceptance Criteria:**

1. List shows book title, borrower name, borrow date, and expected return date
2. Overdue items are visually flagged
3. List is filterable by due date or member name

---

### US-14 Record a book return

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Returns |
| **Priority** | High |

**As a** librarian, **I want to** record when a book is returned **so that** the copy is marked available again.

**Acceptance Criteria:**

1. Return action is accessible from the active borrows list
2. Returning a book immediately increments available copies
3. Return date is recorded against the transaction

---

### US-15 Auto-calculate late fine on return

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Returns |
| **Priority** | High |

**As a** librarian, **I want the** system to automatically calculate any late fine when a book is returned **so that** I do not have to compute it manually.

**Acceptance Criteria:**

1. Fine = days overdue × configured fine rate
2. Fine is displayed before the librarian confirms the return
3. Zero fine shown (not hidden) when the book is returned on time

---

### US-16 Search books by title, author, or category

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Search |
| **Priority** | Medium |

**As a** librarian, **I want** a powerful search bar **so that** I can quickly locate books to edit, delete, or add to a transaction.

**Acceptance Criteria:**

1. Search works across title, author, and category simultaneously
2. Results appear in under one second for typical catalog sizes
3. Search is accessible from any librarian page

---

### US-17 View a member's active borrows and outstanding fines

| Field | Value |
|---|---|
| **Role** | Librarian |
| **Epic** | Member Management |
| **Priority** | Low |

**As a** librarian, **I want to** see a member's active borrows and unpaid fines in one view **so that** I can handle a return or fine payment efficiently.

**Acceptance Criteria:**

1. Summary card shows count of active borrows and total outstanding fines
2. Clicking a borrow row goes to the return workflow
3. Fine total updates in real time as returns are processed

---

## Admin Stories

> Platform administrators managing users, settings, and reports.

### US-18 Manage librarian accounts

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | User Management |
| **Priority** | High |

**As an** admin, **I want to** create, edit, and deactivate librarian accounts **so that** only authorised staff can access librarian features.

**Acceptance Criteria:**

1. Admin can create a librarian account with name, email, and role
2. Admin can deactivate an account without deleting it
3. Deactivated accounts cannot log in but their historical data is preserved

---

### US-19 Assign and change user roles

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | User Management |
| **Priority** | High |

**As an** admin, **I want to** assign or change the role of any user **so that** permissions stay aligned with staffing changes.

**Acceptance Criteria:**

1. Roles available: Guest, Librarian, Admin
2. Role change takes effect on the user's next login
3. Admin cannot remove their own admin role

---

### US-20 Configure the daily fine rate

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | Fine Configuration |
| **Priority** | High |

**As an** admin, **I want to** set the fine amount charged per overdue day **so that** the library's policy is enforced automatically.

**Acceptance Criteria:**

1. Settings page exposes a numeric fine-per-day field
2. Change applies to all future fines; existing fines are unaffected
3. Current rate is displayed on the returns screen for librarians

---

### US-21 Manage book categories

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | Category Management |
| **Priority** | Medium |

**As an** admin, **I want to** add, rename, or remove book categories **so that** the catalog stays organised.

**Acceptance Criteria:**

1. Category list shows how many books belong to each category
2. Deleting a category requires reassigning its books first
3. New categories are immediately available in the book form

---

### US-22 View platform-wide analytics dashboard

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | Reports & Analytics |
| **Priority** | Medium |

**As an** admin, **I want** a dashboard that shows key library metrics **so that** I can monitor health and activity at a glance.

**Acceptance Criteria:**

1. Dashboard shows: total books, available books, active borrows, overdue count, outstanding fines
2. Charts highlight most borrowed books and member activity
3. Data refreshes automatically or with a manual refresh button

---

### US-23 View overdue books and outstanding fines report

| Field | Value |
|---|---|
| **Role** | Admin |
| **Epic** | Reports & Analytics |
| **Priority** | Low |

**As an** admin, **I want** a dedicated overdue report **so that** I can audit fines and follow up with members.

**Acceptance Criteria:**

1. Report lists every overdue borrow with member name, book, days overdue, and accrued fine
2. Report is exportable or printable
3. Totals are shown at the top of the report

---

## Shared Stories

> System-level features applicable to all roles.

### US-24 Log in with email and password

| Field | Value |
|---|---|
| **Role** | Shared |
| **Epic** | Authentication |
| **Priority** | High |

**As** any user, **I want to** log in securely **so that** I can access features appropriate to my role.

**Acceptance Criteria:**

1. Login form accepts email and password
2. Failed attempts show a generic error (no account enumeration)
3. Successful login redirects to the role-appropriate home screen

---

### US-25 Role-based access control

| Field | Value |
|---|---|
| **Role** | Shared |
| **Epic** | Authentication |
| **Priority** | High |

**As the** system, **I want to** enforce role permissions on every route and action **so that** users cannot access features beyond their role.

**Acceptance Criteria:**

1. Navigating to a restricted URL redirects to a 403 or login page
2. API endpoints validate the session role before processing
3. Role changes propagate without requiring a server restart

---

### US-26 Switch UI language between Arabic and English

| Field | Value |
|---|---|
| **Role** | Shared |
| **Epic** | Localisation |
| **Priority** | Medium |

**As** any user, **I want to** switch the interface language between Arabic and English **so that** I can use the app in my preferred language.

**Acceptance Criteria:**

1. Language toggle visible in the header or settings
2. All labels, messages, and date formats change immediately
3. RTL layout applied automatically when Arabic is selected

---

### US-27 Use the app on a mobile browser

| Field | Value |
|---|---|
| **Role** | Shared |
| **Epic** | Responsive UI |
| **Priority** | Medium |

**As** any user, **I want** the web app to work well on my phone **so that** I can perform tasks without needing a native app.

**Acceptance Criteria:**

1. All pages render correctly on viewport widths from 375 px upward
2. Touch targets are at least 44 × 44 px
3. No horizontal scrolling on any core page at mobile width

---

### US-28 Automatic fine calculation on all overdue borrows

| Field | Value |
|---|---|
| **Role** | Shared |
| **Epic** | Fine Engine |
| **Priority** | High |

**As the** system, **I want to** calculate late fines automatically whenever a return is processed **so that** accuracy is guaranteed.

**Acceptance Criteria:**

1. `Fine = max(0, days overdue) × daily rate`
2. Calculation uses the configured rate at the time of return
3. Result is recorded on the transaction and visible in the member's fine history
