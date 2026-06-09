import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Category } from './models/Category.js';
import { Book } from './models/Book.js';
import { Member } from './models/Member.js';
import { Transaction } from './models/Transaction.js';
import { FineConfig } from './models/FineConfig.js';

const CATEGORIES = ['تاريخ', 'أدب', 'علوم', 'فلسفة', 'شعر', 'فقه', 'لغة'];

const BOOKS = [
  { title: 'مقدمة ابن خلدون', title_en: 'Muqaddimah', author: 'Ibn Khaldun', category: 'تاريخ', total_copies: 5 },
  { title: 'ألف ليلة وليلة', title_en: 'One Thousand and One Nights', author: 'Anonymous', category: 'أدب', total_copies: 8 },
  { title: 'كليلة ودمنة', title_en: 'Kalila and Dimna', author: 'Ibn al-Muqaffa', category: 'أدب', total_copies: 4 },
  { title: 'نهج البلاغة', title_en: 'Peak of Eloquence', author: 'Ali ibn Abi Talib', category: 'فقه', total_copies: 6 },
  { title: 'ديوان المتنبي', title_en: 'Diwan al-Mutanabbi', author: 'Al-Mutanabbi', category: 'شعر', total_copies: 3 },
  { title: 'رسالة الغفران', title_en: 'Epistle of Forgiveness', author: 'Abu al-Ala al-Maarri', category: 'أدب', total_copies: 2 },
  { title: 'دلائل الإعجاز', title_en: 'Signs of Inimitability', author: 'Abd al-Qahir al-Jurjani', category: 'لغة', total_copies: 4 },
  { title: 'قصص الأنبياء', title_en: 'Stories of the Prophets', author: 'Ibn Kathir', category: 'فقه', total_copies: 7 },
];

const MEMBERS = [
  { full_name: 'أحمد القرشي', email: 'ahmed@nebras.sa', phone: '+966500000001', address: 'الرياض', membership_date: '2023-01-15' },
  { full_name: 'فاطمة الزهراء', email: 'fatima@nebras.sa', phone: '+966500000002', address: 'جدة', membership_date: '2023-03-22' },
  { full_name: 'عمر الهاشمي', email: 'omar@nebras.sa', phone: '+966500000003', address: 'الدمام', membership_date: '2022-11-08' },
  { full_name: 'خديجة السيد', email: 'khadija@nebras.sa', phone: '+966500000004', address: 'مكة', membership_date: '2024-02-10' },
  { full_name: 'يوسف إبراهيم', email: 'yusuf@nebras.sa', phone: '+966500000005', address: 'المدينة', membership_date: '2023-07-19' },
  { full_name: 'سارة النجار', email: 'sara@nebras.sa', phone: '+966500000006', address: 'الطائف', membership_date: '2024-05-03' },
];

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Book.deleteMany({}),
    Member.deleteMany({}),
    Transaction.deleteMany({}),
    FineConfig.deleteMany({}),
  ]);

  const adminHash = await User.hashPassword('Admin@123');
  const libHash = await User.hashPassword('Librarian@123');

  const admin = await User.create({
    email: 'admin@nebras.sa',
    password_hash: adminHash,
    full_name: 'أحمد القرشي',
    role: 'admin',
  });

  await User.create([
    { email: 'fatima@nebras.sa', password_hash: libHash, full_name: 'فاطمة الزهراء', role: 'librarian' },
    { email: 'omar@nebras.sa', password_hash: libHash, full_name: 'عمر الهاشمي', role: 'librarian' },
  ]);

  await FineConfig.create({ daily_rate: 2.5, created_by: admin._id });

  const catMap = {};
  for (const name of CATEGORIES) {
    const cat = await Category.create({ name });
    catMap[name] = cat._id;
  }

  const bookDocs = [];
  for (const b of BOOKS) {
    const borrowed = Math.min(b.total_copies, Math.floor(Math.random() * 3) + 1);
    const book = await Book.create({
      title: b.title,
      title_en: b.title_en,
      author: b.author,
      category_id: catMap[b.category],
      total_copies: b.total_copies,
      available_copies: b.total_copies - borrowed,
    });
    bookDocs.push({ book, borrowed });
  }

  const memberDocs = [];
  for (const m of MEMBERS) {
    memberDocs.push(await Member.create({ ...m, membership_date: new Date(m.membership_date) }));
  }

  const pastDue = new Date();
  pastDue.setDate(pastDue.getDate() - 10);
  const futureDue = new Date();
  futureDue.setDate(futureDue.getDate() + 14);

  const borrows = [
    { member: 2, book: 0, due: pastDue },
    { member: 3, book: 2, due: pastDue },
    { member: 0, book: 1, due: futureDue },
    { member: 1, book: 3, due: futureDue },
    { member: 4, book: 4, due: futureDue },
  ];

  for (const b of borrows) {
    const member = memberDocs[b.member];
    const { book } = bookDocs[b.book];
    await Transaction.create({
      member_id: member._id,
      book_id: book._id,
      borrowed_by: admin._id,
      borrow_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      expected_return_date: b.due,
      status: b.due < new Date() ? 'overdue' : 'active',
    });
  }

  console.log('Database seeded successfully!');
  console.log('Login: admin@nebras.sa / Admin@123');
  console.log('Login: fatima@nebras.sa / Librarian@123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
