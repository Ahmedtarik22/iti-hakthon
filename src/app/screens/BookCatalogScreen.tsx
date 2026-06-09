import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, List, Plus, AlertTriangle } from 'lucide-react';
import { COLORS, BookCard, ArabesqueHeader, SearchInput, GoldButton, GhostButton, GlassModal, StatusStamp, StarDivider, CATEGORY_COLORS, GoldInput } from '../components/nebras/index';
import { api, Book, Category } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';

interface BookForm { titleAr: string; titleEn: string; author: string; category_id: string; copies: number; isbn: string }

export function BookCatalogScreen() {
  const { t } = useLocale();
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<BookForm>({ titleAr: '', titleEn: '', author: '', category_id: '', copies: 1, isbn: '' });
  const [avFilter, setAvFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [booksRes, catsRes] = await Promise.all([
        api.getBooks({ q: search || undefined, availability: avFilter === 'all' ? undefined : avFilter, category_id: filterCat === 'all' ? undefined : filterCat, limit: 100 }),
        api.getCategories(),
      ]);
      setBooks(booksRes.data);
      setCategories(catsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, avFilter, filterCat]);

  useEffect(() => { const id = setTimeout(loadData, 300); return () => clearTimeout(id); }, [loadData]);

  const catName = (id: string) => categories.find((c) => c.category_id === id)?.name || '';

  const openEdit = (b: Book) => {
    setEditBook(b);
    setForm({ titleAr: b.title, titleEn: b.title_en || '', author: b.author, category_id: b.category?.category_id || '', copies: b.total_copies, isbn: b.isbn || '' });
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!form.titleAr || !form.author || !form.category_id) return;
    setSaving(true);
    try {
      if (editBook) {
        const borrowed = editBook.total_copies - editBook.available_copies;
        await api.updateBook(editBook.book_id, { title: form.titleAr, title_en: form.titleEn, author: form.author, category_id: form.category_id, total_copies: form.copies, force: form.copies < borrowed });
      } else {
        await api.createBook({ title: form.titleAr, title_en: form.titleEn, author: form.author, category_id: form.category_id, total_copies: form.copies, isbn: form.isbn || undefined });
      }
      setShowAdd(false);
      loadData();
    } catch { alert(t('cat_save_failed')); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <ArabesqueHeader titleAr={t('cat_title')} action={<GoldButton onClick={() => { setEditBook(null); setForm({ titleAr: '', titleEn: '', author: '', category_id: categories[0]?.category_id || '', copies: 1, isbn: '' }); setShowAdd(true); }}><Plus size={15} /> {t('cat_add_book')}</GoldButton>} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px' }}><SearchInput placeholder={t('cat_search_placeholder')} value={search} onChange={setSearch} /></div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterCat('all')} style={{ padding: '6px 12px', borderRadius: '20px', border: `1.5px solid ${filterCat === 'all' ? COLORS.gold : COLORS.goldLight}`, background: filterCat === 'all' ? COLORS.gold : 'transparent', color: filterCat === 'all' ? 'white' : COLORS.darkLapis, cursor: 'pointer' }}>{t('all')}</button>
          {categories.map((c) => (
            <button key={c.category_id} onClick={() => setFilterCat(c.category_id)} style={{ padding: '6px 12px', borderRadius: '20px', border: `1.5px solid ${filterCat === c.category_id ? COLORS.gold : COLORS.goldLight}`, background: filterCat === c.category_id ? COLORS.gold : 'transparent', color: filterCat === c.category_id ? 'white' : COLORS.darkLapis, cursor: 'pointer' }}>{c.name}</button>
          ))}
        </div>
        <div style={{ display: 'flex', background: COLORS.sage, borderRadius: '8px', padding: '3px' }}>
          {(['all', 'available', 'borrowed'] as const).map((a) => (
            <button key={a} onClick={() => setAvFilter(a)} style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', background: avFilter === a ? 'white' : 'transparent', cursor: 'pointer', fontSize: '11px' }}>
              {a === 'all' ? t('all') : a === 'available' ? t('available') : t('borrowed')}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', border: `1px solid ${COLORS.goldLight}`, borderRadius: '8px', padding: '3px' }}>
          <button onClick={() => setView('grid')} style={{ padding: '6px 10px', border: 'none', background: view === 'grid' ? COLORS.gold : 'transparent', color: view === 'grid' ? 'white' : COLORS.goldLight, cursor: 'pointer' }}><LayoutGrid size={15} /></button>
          <button onClick={() => setView('table')} style={{ padding: '6px 10px', border: 'none', background: view === 'table' ? COLORS.gold : 'transparent', color: view === 'table' ? 'white' : COLORS.goldLight, cursor: 'pointer' }}><List size={15} /></button>
        </div>
      </div>
      <div style={{ fontSize: '13px', color: COLORS.goldLight, marginBottom: '16px' }}>{loading ? t('loading') : `${books.length} ${t('books_count')}`}</div>

      <AnimatePresence mode="wait">
        {view === 'grid' && !loading && (
          <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '16px' }}>
            {books.map((b) => {
              const borrowed = b.total_copies - b.available_copies;
              const cat = b.category?.name || '';
              return (
                <BookCard key={b.book_id} titleAr={b.title} titleEn={b.title_en || ''} author={b.author} category={cat} categoryColor={CATEGORY_COLORS[cat] || COLORS.gold} copies={b.total_copies} borrowed={borrowed} onEdit={() => openEdit(b)} />
              );
            })}
          </motion.div>
        )}
        {view === 'table' && !loading && (
          <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ background: 'white', borderRadius: '14px', border: `1px solid ${COLORS.goldLight}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: COLORS.sage }}>
                {['#', t('title'), t('author'), t('category'), t('copies'), t('available'), t('status'), ''].map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {books.map((b, i) => {
                  const cat = b.category?.name || '';
                  const catColor = CATEGORY_COLORS[cat] || COLORS.gold;
                  const status = b.available_copies === 0 ? 'overdue' : b.available_copies / b.total_copies < 0.4 ? 'active' : 'returned';
                  return (
                    <tr key={b.book_id} style={{ borderBottom: `1px solid ${COLORS.goldLight}30`, borderLeft: `3px solid ${catColor}` }}>
                      <td style={{ padding: '12px 16px' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px' }}><div style={{ fontWeight: 700 }}>{b.title}</div><div style={{ fontSize: '11px', color: '#717182' }}>{b.title_en}</div></td>
                      <td style={{ padding: '12px 16px' }}>{b.author}</td>
                      <td style={{ padding: '12px 16px' }}>{cat}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{b.total_copies}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: b.available_copies > 0 ? COLORS.sealGreen : COLORS.bloodRed }}>{b.available_copies}</td>
                      <td style={{ padding: '12px 16px' }}><StatusStamp status={status} size={36} /></td>
                      <td style={{ padding: '12px 16px' }}><button onClick={() => openEdit(b)} style={{ border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', background: 'transparent' }}>{t('edit')}</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title={editBook ? t('cat_edit_book') : t('cat_new_book')} titleAr={editBook ? t('cat_edit_book') : t('cat_new_book')} width={580}>
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GoldInput dark label={t('cat_title_ar')} labelAr={t('cat_title_ar')} value={form.titleAr} onChange={(v) => setForm((f) => ({ ...f, titleAr: v }))} />
          <GoldInput dark label={t('cat_title_en')} labelAr={t('cat_title_en')} value={form.titleEn} onChange={(v) => setForm((f) => ({ ...f, titleEn: v }))} />
          <GoldInput dark label={t('author')} labelAr={t('author')} value={form.author} onChange={(v) => setForm((f) => ({ ...f, author: v }))} />
          <GoldInput dark label={t('cat_isbn')} labelAr={t('cat_isbn')} value={form.isbn} onChange={(v) => setForm((f) => ({ ...f, isbn: v }))} />
          <select value={form.category_id} onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))} style={{ background: 'transparent', color: 'white', border: `1px solid ${COLORS.gold}50`, padding: '8px' }}>
            {categories.map((c) => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
          <StarDivider label={t('cat_num_copies')} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px' }}>
            <button onClick={() => setForm((f) => ({ ...f, copies: Math.max(0, f.copies - 1) }))} style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1.5px solid ${COLORS.gold}`, background: 'transparent', color: COLORS.gold, cursor: 'pointer' }}>−</button>
            <span style={{ fontSize: '52px' }}>{form.copies}</span>
            <button onClick={() => setForm((f) => ({ ...f, copies: f.copies + 1 }))} style={{ width: '38px', height: '38px', borderRadius: '50%', background: COLORS.gold, border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
          </div>
          {editBook && form.copies < editBook.total_copies - editBook.available_copies && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C98200' }}><AlertTriangle size={14} />{t('cat_copies_warning')}</div>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <GhostButton onClick={() => setShowAdd(false)}>{t('cancel')}</GhostButton>
            <GoldButton onClick={handleSave}>{saving ? '...' : editBook ? t('cat_save_edits') : t('cat_add_book')}</GoldButton>
          </div>
        </div>
      </GlassModal>
    </div>
  );
}
