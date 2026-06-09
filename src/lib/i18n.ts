export type Locale = 'ar' | 'en';

const translations = {
  // Nav
  nav_dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  nav_catalog: { ar: 'كتالوج الكتب', en: 'Book Catalog' },
  nav_members: { ar: 'الأعضاء', en: 'Members' },
  nav_record: { ar: 'تسجيل إعارة', en: 'Record Borrow' },
  nav_borrows: { ar: 'الإعارات النشطة', en: 'Active Borrows' },
  nav_reports: { ar: 'التقارير', en: 'Reports' },
  nav_settings: { ar: 'الإعدادات', en: 'Settings' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },

  // Common
  loading: { ar: 'جارٍ التحميل...', en: 'Loading...' },
  save: { ar: 'حفظ', en: 'Save' },
  cancel: { ar: 'إلغاء', en: 'Cancel' },
  edit: { ar: 'تعديل', en: 'Edit' },
  add: { ar: 'إضافة', en: 'Add' },
  search: { ar: 'بحث', en: 'Search' },
  all: { ar: 'الكل', en: 'All' },
  none: { ar: 'لا شيء', en: 'None' },
  close: { ar: 'إغلاق', en: 'Close' },
  confirm: { ar: 'تأكيد', en: 'Confirm' },
  success: { ar: 'تمت العملية بنجاح!', en: 'Operation completed successfully!' },
  error_generic: { ar: 'حدث خطأ', en: 'An error occurred' },
  currency: { ar: 'ر.س', en: 'SAR' },
  books_count: { ar: 'كتاب', en: 'books' },
  days: { ar: 'يوم', en: 'days' },
  active: { ar: 'نشط', en: 'Active' },
  overdue: { ar: 'متأخرة', en: 'Overdue' },
  returned: { ar: 'مُعاد', en: 'Returned' },
  fine: { ar: 'غرامة', en: 'Fine' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  phone: { ar: 'الهاتف', en: 'Phone' },
  address: { ar: 'العنوان', en: 'Address' },
  name: { ar: 'الاسم', en: 'Name' },
  available: { ar: 'متاح', en: 'Available' },
  unavailable: { ar: 'غير متاح', en: 'Unavailable' },
  borrowed: { ar: 'مُعار', en: 'Borrowed' },
  copies: { ar: 'نسخ', en: 'Copies' },
  category: { ar: 'الفئة', en: 'Category' },
  author: { ar: 'المؤلف', en: 'Author' },
  title: { ar: 'العنوان', en: 'Title' },
  status: { ar: 'الحالة', en: 'Status' },
  due_date: { ar: 'موعد الإعادة', en: 'Due Date' },
  borrow_date: { ar: 'تاريخ الإعارة', en: 'Borrow Date' },
  change: { ar: 'تغيير', en: 'Change' },
  no_results: { ar: 'لا توجد نتائج', en: 'No results found' },

  // Roles
  role_admin: { ar: 'مدير', en: 'Administrator' },
  role_librarian: { ar: 'أمين مكتبة', en: 'Librarian' },
  role_guest: { ar: 'زائر', en: 'Guest' },

  // Login
  login_welcome: { ar: 'أهلاً وسهلاً', en: 'Welcome back' },
  login_subtitle: { ar: 'سجّل الدخول للمتابعة', en: 'Sign in to continue' },
  login_email: { ar: 'البريد الإلكتروني', en: 'Email address' },
  login_password: { ar: 'كلمة المرور', en: 'Password' },
  login_submit: { ar: 'الدخول إلى المكتبة', en: 'Sign in to Library' },
  login_loading: { ar: 'جارٍ الدخول...', en: 'Signing in...' },
  login_fill_fields: { ar: 'يرجى تعبئة جميع الحقول', en: 'Please fill in all fields' },
  login_invalid: { ar: 'بيانات الدخول غير صحيحة', en: 'Invalid email or password' },
  login_server_error: { ar: 'فشل الاتصال بالخادم', en: 'Could not connect to server' },
  login_demo: { ar: 'تجريبي: admin@nebras.sa / Admin@123', en: 'Demo: admin@nebras.sa / Admin@123' },
  app_subtitle_ar: { ar: 'نظام إدارة المكتبة', en: 'Library Management System' },

  // Dashboard
  dash_overview: { ar: 'نظرة عامة', en: 'Dashboard Overview' },
  dash_total_books: { ar: 'إجمالي الكتب', en: 'Total Books' },
  dash_members: { ar: 'الأعضاء', en: 'Members' },
  dash_active_borrows: { ar: 'إعارات نشطة', en: 'Active Borrows' },
  dash_overdue: { ar: 'متأخرة', en: 'Overdue' },
  dash_outstanding_fines: { ar: 'غرامات مستحقة', en: 'Outstanding Fines' },
  dash_most_borrowed: { ar: 'الكتب الأكثر إعارة', en: 'Most Borrowed Books' },
  dash_no_data: { ar: 'لا توجد بيانات بعد', en: 'No data yet' },
  dash_quick_stats: { ar: 'إحصاءات سريعة', en: 'Quick Stats' },
  dash_available_copies: { ar: 'نسخ متاحة', en: 'Available copies' },
  dash_currently: { ar: 'حالياً', en: 'Currently' },
  dash_borrow_count: { ar: 'إعارة', en: 'borrows' },

  // Catalog
  cat_title: { ar: 'كتالوج الكتب', en: 'Book Catalog' },
  cat_add_book: { ar: 'إضافة كتاب', en: 'Add Book' },
  cat_search_placeholder: { ar: 'ابحث في الكتالوج...', en: 'Search catalog...' },
  cat_edit_book: { ar: 'تعديل الكتاب', en: 'Edit Book' },
  cat_new_book: { ar: 'إضافة كتاب جديد', en: 'Add New Book' },
  cat_title_ar: { ar: 'العنوان (عربي)', en: 'Title (Arabic)' },
  cat_title_en: { ar: 'العنوان (إنجليزي)', en: 'Title (English)' },
  cat_isbn: { ar: 'الرقم الدولي', en: 'ISBN' },
  cat_num_copies: { ar: 'عدد النسخ', en: 'Number of Copies' },
  cat_copies_warning: { ar: 'عدد النسخ أقل من المُعارة', en: 'Copies below borrowed count' },
  cat_save_edits: { ar: 'حفظ التعديلات', en: 'Save Changes' },
  cat_save_failed: { ar: 'فشل حفظ الكتاب', en: 'Failed to save book' },

  // Members
  mem_title: { ar: 'إدارة الأعضاء', en: 'Members Management' },
  mem_add: { ar: 'إضافة عضو', en: 'Add Member' },
  mem_search_placeholder: { ar: 'ابحث في الأعضاء...', en: 'Search members...' },
  mem_member: { ar: 'العضو', en: 'Member' },
  mem_active_borrows: { ar: 'إعارات نشطة', en: 'Active Borrows' },
  mem_fines: { ar: 'الغرامات', en: 'Fines' },
  mem_joined: { ar: 'الانضمام', en: 'Joined' },
  mem_history: { ar: 'سجل الإعارة', en: 'Borrow History' },
  mem_no_fines: { ar: 'لا توجد غرامات', en: 'No outstanding fines' },
  mem_fine_due: { ar: 'ريال سعودي — مستحق', en: 'SAR — outstanding' },
  mem_full_name: { ar: 'الاسم الكامل', en: 'Full Name' },
  mem_add_failed: { ar: 'فشل إضافة العضو — قد يكون البريد مكرراً', en: 'Failed to add member — email may already exist' },

  // Record borrow
  rec_title: { ar: 'تسجيل إعارة', en: 'Record New Borrow' },
  rec_step_member: { ar: 'اختيار العضو', en: 'Select Member' },
  rec_step_book: { ar: 'اختيار الكتاب', en: 'Select Book' },
  rec_step_date: { ar: 'تحديد الموعد', en: 'Set Due Date' },
  rec_select_member: { ar: 'اختر العضو', en: 'Select Member' },
  rec_select_book: { ar: 'اختر الكتاب', en: 'Select Book' },
  rec_set_due: { ar: 'تحديد موعد الإعادة', en: 'Set return date' },
  rec_summary: { ar: 'ملخص الإعارة', en: 'Borrow Summary' },
  rec_confirm: { ar: 'تأكيد الإعارة', en: 'Confirm Borrow' },
  rec_change_book: { ar: 'تغيير الكتاب', en: 'Change Book' },
  rec_search_member: { ar: 'ابحث باسم العضو...', en: 'Search member name...' },
  rec_search_book: { ar: 'ابحث في الكتب...', en: 'Search books...' },
  rec_failed: { ar: 'فشل تسجيل الإعارة — تأكد من توفر نسخ', en: 'Failed to record borrow — check availability' },
  rec_success_sub: { ar: 'تم تسجيل الإعارة بنجاح', en: 'Borrow recorded successfully' },

  // Active borrows
  bor_title: { ar: 'الإعارات النشطة', en: 'Active Borrows' },
  bor_total: { ar: 'إجمالي الإعارات', en: 'Total Active' },
  bor_pending_fines: { ar: 'غرامات معلقة', en: 'Pending Fines' },
  bor_filter_all: { ar: 'الكل', en: 'All' },
  bor_filter_overdue: { ar: 'المتأخرة', en: 'Overdue' },
  bor_filter_active: { ar: 'النشطة', en: 'Active' },
  bor_days_out: { ar: 'أيام الإعارة', en: 'Days out' },
  bor_return_fine: { ar: 'إعادة مع غرامة', en: 'Return with fine' },
  bor_confirm_return: { ar: 'تأكيد الإعادة', en: 'Confirm Return' },
  bor_no_match: { ar: 'لا توجد إعارات مطابقة', en: 'No matching borrows' },
  bor_fine_modal_title: { ar: 'تأكيد الإعادة ودفع الغرامة', en: 'Confirm Return & Fine' },
  bor_confirm_pay: { ar: 'تأكيد الدفع والإعادة', en: 'Confirm payment & return' },
  bor_preview_failed: { ar: 'فشل معاينة الإعادة', en: 'Failed to preview return' },
  bor_return_failed: { ar: 'فشل تأكيد الإعادة', en: 'Failed to confirm return' },

  // Reports
  rpt_title: { ar: 'التقارير والإحصاءات', en: 'Reports & Analytics' },
  rpt_export_csv: { ar: 'تصدير CSV', en: 'Export CSV' },
  rpt_total_borrows: { ar: 'إجمالي الإعارات', en: 'Total Borrows' },
  rpt_return_rate: { ar: 'معدل الإعادة', en: 'Return Rate' },
  rpt_monthly_fines: { ar: 'غرامات الشهر', en: 'Monthly Fines' },
  rpt_by_category: { ar: 'الإعارات حسب الفئة', en: 'Borrows by Category' },
  rpt_top_borrowers: { ar: 'أكثر الأعضاء إعارة', en: 'Top Borrowers' },
  rpt_finance: { ar: 'المالية', en: 'Finance' },
  rpt_total_fines: { ar: 'إجمالي الغرامات المستحقة', en: 'Total Outstanding Fines' },
  rpt_sar: { ar: 'ريال سعودي', en: 'Saudi Riyal' },
  rpt_borrows_label: { ar: 'إعارة', en: 'borrows' },

  // Settings
  set_title: { ar: 'إعدادات النظام', en: 'System Settings' },
  set_fines_tab: { ar: 'قواعد الغرامات', en: 'Fine Rules' },
  set_categories_tab: { ar: 'الفئات', en: 'Categories' },
  set_users_tab: { ar: 'المستخدمون', en: 'Users' },
  set_daily_rate: { ar: 'معدل الغرامة اليومية', en: 'Daily Fine Rate' },
  set_per_day: { ar: 'ريال / يوم', en: 'SAR / day' },
  set_save_settings: { ar: 'حفظ الإعدادات', en: 'Save Settings' },
  set_saved: { ar: 'تم حفظ الإعدادات', en: 'Settings saved' },
  set_save_failed: { ar: 'فشل الحفظ', en: 'Failed to save' },
  set_live_preview: { ar: 'معاينة حية', en: 'Live Preview' },
  set_simulate_days: { ar: 'محاكاة أيام التأخير', en: 'Simulate days overdue' },
  set_on_time: { ar: 'في الوقت المحدد ✓', en: 'On time ✓' },
  set_fine_due: { ar: 'ريال سعودي — مستحق', en: 'SAR — due' },
  set_book_categories: { ar: 'فئات الكتب', en: 'Book Categories' },
  set_add_category: { ar: 'إضافة فئة', en: 'Add Category' },
  set_cat_placeholder: { ar: 'اسم الفئة...', en: 'Category name...' },
  set_cat_count: { ar: 'فئة', en: 'categories' },
  set_cat_delete_failed: { ar: 'لا يمكن حذف الفئة — قد تحتوي على كتب', en: 'Cannot delete — category has books' },
  set_cat_add_failed: { ar: 'فشل إضافة الفئة', en: 'Failed to add category' },
  set_users_title: { ar: 'مستخدمو النظام', en: 'System Users' },
  set_users_registered: { ar: 'مستخدم مسجل', en: 'users registered' },

  // Months
  month_0: { ar: 'يناير', en: 'January' },
  month_1: { ar: 'فبراير', en: 'February' },
  month_2: { ar: 'مارس', en: 'March' },
  month_3: { ar: 'أبريل', en: 'April' },
  month_4: { ar: 'مايو', en: 'May' },
  month_5: { ar: 'يونيو', en: 'June' },
  month_6: { ar: 'يوليو', en: 'July' },
  month_7: { ar: 'أغسطس', en: 'August' },
  month_8: { ar: 'سبتمبر', en: 'September' },
  month_9: { ar: 'أكتوبر', en: 'October' },
  month_10: { ar: 'نوفمبر', en: 'November' },
  month_11: { ar: 'ديسمبر', en: 'December' },
} as const;

export type TranslationKey = keyof typeof translations;

export function translate(locale: Locale, key: TranslationKey): string {
  const entry = translations[key];
  return entry ? entry[locale] : key;
}

export function roleLabel(locale: Locale, role: string): string {
  const map: Record<string, TranslationKey> = {
    admin: 'role_admin',
    librarian: 'role_librarian',
    guest: 'role_guest',
  };
  const k = map[role];
  return k ? translate(locale, k) : role;
}

export function monthName(locale: Locale, monthIndex: number): string {
  const key = `month_${monthIndex}` as TranslationKey;
  return translate(locale, key);
}
