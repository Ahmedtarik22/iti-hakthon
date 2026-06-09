const API_BASE = '/api/v1';

class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function getToken(): string | null {
  return localStorage.getItem('nebras_token');
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('nebras_token', token);
  else localStorage.removeItem('nebras_token');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 204) return {} as T;

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(
      body.error || 'Request failed',
      body.code || 'ERROR',
      res.status
    );
  }

  return body as T;
}

export interface User {
  user_id: string;
  email: string;
  role: 'admin' | 'librarian' | 'guest';
  name: string;
}

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number };
}

export const api = {
  login: (email: string, password: string) =>
    request<{ data: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  getDashboard: () =>
    request<{
      data: {
        total_books: number;
        available_books: number;
        active_borrows: number;
        overdue_count: number;
        outstanding_fines_total: number;
        member_count: number;
      };
    }>('/reports/dashboard'),

  getMostBorrowed: (limit = 10) =>
    request<{ data: { book_id: string; title: string; category: string; borrow_count: number }[] }>(
      `/reports/most-borrowed?limit=${limit}`
    ),

  getMemberActivity: (limit = 10) =>
    request<{ data: { member_id: string; full_name: string; borrow_count: number }[] }>(
      `/reports/member-activity?limit=${limit}`
    ),

  getOverdueReport: (params?: { page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    return request<{ data: OverdueRow[]; meta: { total: number; total_fines: number } }>(
      `/reports/overdue?${q}`
    );
  },

  exportOverdueCsv: () =>
    fetch(`${API_BASE}/reports/overdue?format=csv`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      credentials: 'include',
    }),

  getBooks: (params?: { q?: string; availability?: string; category_id?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.q) q.set('q', params.q);
    if (params?.availability) q.set('availability', params.availability);
    if (params?.category_id) q.set('category_id', params.category_id);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit ?? 100));
    return request<Paginated<Book>>(`/books?${q}`);
  },

  createBook: (data: BookInput) =>
    request<{ data: Book }>('/books', { method: 'POST', body: JSON.stringify(data) }),

  updateBook: (id: string, data: Partial<BookInput> & { force?: boolean }) =>
    request<{ data: Book; warning?: string }>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteBook: (id: string) =>
    request<void>(`/books/${id}`, { method: 'DELETE' }),

  getCategories: () =>
    request<{ data: Category[] }>('/categories'),

  createCategory: (name: string) =>
    request<{ data: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: string) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),

  getMembers: (params?: { q?: string; page?: number; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.q) q.set('q', params.q);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit ?? 100));
    return request<Paginated<Member>>(`/members?${q}`);
  },

  getMember: (id: string) =>
    request<{ data: Member }>(`/members/${id}`),

  getMemberHistory: (id: string) =>
    request<Paginated<MemberHistory>>(`/members/${id}/history?limit=50`),

  createMember: (data: MemberInput) =>
    request<{ data: Member }>('/members', { method: 'POST', body: JSON.stringify(data) }),

  getTransactions: (params?: { status?: string; member_name?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.member_name) q.set('member_name', params.member_name);
    q.set('limit', '100');
    return request<Paginated<Transaction>>(`/transactions?${q}`);
  },

  createTransaction: (data: { member_id: string; book_id: string; expected_return_date: string }) =>
    request<{ data: Transaction }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  previewReturn: (id: string) =>
    request<{ data: ReturnPreview }>(`/transactions/${id}/return`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  confirmReturn: (id: string) =>
    request<{ data: { transaction_id: string; fine_amount: number; status: string } }>(
      `/transactions/${id}/return`,
      { method: 'POST', body: JSON.stringify({ confirm: true }) }
    ),

  getFineConfig: () =>
    request<{ data: { current_rate: number; effective_from: string } }>('/admin/fine-config'),

  setFineConfig: (daily_rate: number) =>
    request<{ data: { current_rate: number } }>('/admin/fine-config', {
      method: 'POST',
      body: JSON.stringify({ daily_rate }),
    }),

  getAdminUsers: () =>
    request<Paginated<AdminUser>>('/admin/users?limit=100'),

  createAdminUser: (data: { full_name: string; email: string; role: string }) =>
    request<{ data: AdminUser }>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  setLocale: (locale: string) =>
    request<{ data: { locale: string } }>('/locale', {
      method: 'PUT',
      body: JSON.stringify({ locale }),
    }),
};

export interface Book {
  book_id: string;
  title: string;
  title_en?: string;
  author: string;
  category: { category_id: string; name: string } | null;
  total_copies: number;
  available_copies: number;
  is_active: boolean;
  isbn?: string;
}

export interface BookInput {
  title: string;
  title_en?: string;
  author: string;
  category_id: string;
  total_copies: number;
  isbn?: string;
}

export interface Category {
  category_id: string;
  name: string;
  book_count?: number;
}

export interface Member {
  member_id: string;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  membership_date: string;
  is_active: boolean;
  active_borrows_count?: number;
  outstanding_fines_total?: number;
}

export interface MemberInput {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  membership_date: string;
}

export interface MemberHistory {
  transaction_id: string;
  book_title: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  fine_amount: number;
  status: string;
}

export interface Transaction {
  transaction_id: string;
  member_id: string;
  member_name: string;
  book_id: string;
  book_title: string;
  borrow_date: string;
  expected_return_date: string;
  actual_return_date: string | null;
  fine_amount: number;
  status: 'active' | 'overdue' | 'returned';
  is_overdue?: boolean;
}

export interface ReturnPreview {
  transaction_id: string;
  days_overdue: number;
  daily_rate: number;
  fine_amount: number;
  is_on_time: boolean;
}

export interface AdminUser {
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface OverdueRow {
  member_name: string;
  book_title: string;
  borrow_date: string;
  expected_return_date: string;
  days_overdue: number;
  accrued_fine: number;
}

export { ApiError };
