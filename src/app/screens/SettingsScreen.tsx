import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Plus, X } from 'lucide-react';
import { COLORS, ArabesqueHeader, StarDivider, GoldButton, MemberAvatar, RoleBadge } from '../components/nebras/index';
import { api, Category, AdminUser } from '../../lib/api';
import { useAuth } from '../../lib/AuthContext';
import { useLocale } from '../../lib/LocaleContext';
import { roleLabel } from '../../lib/i18n';

const CAT_COLORS: Record<string, string> = {
  'تاريخ': '#8B4513', 'أدب': '#1B3A6B', 'علوم': '#2D5A1B', 'فلسفة': '#5B2C8A', 'شعر': '#B8421A', 'فقه': '#9A7A1A', 'لغة': '#1B5B6B',
};

function HexChip({ label, color, onDelete }: { label: string; color: string; onDelete: () => void }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${color}18`, border: `1.5px solid ${color}60`, borderRadius: '8px', padding: '6px 12px', color }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color }} />
      {label}
      <button onClick={onDelete} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: `${color}80` }}><Flame size={12} /></button>
    </div>
  );
}

export function SettingsScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [dailyRate, setDailyRate] = useState(2.5);
  const [previewDays, setPreview] = useState(5);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [newCat, setNewCat] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [activeTab, setActiveTab] = useState<'fines' | 'categories' | 'users'>('fines');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getFineConfig().then((r) => setDailyRate(r.data.current_rate));
    api.getCategories().then((r) => setCategories(r.data));
    if (user?.role === 'admin') api.getAdminUsers().then((r) => setUsers(r.data));
  }, [user]);

  const previewFine = Math.max(0, previewDays * dailyRate);

  const handleSaveFine = async () => {
    if (user?.role !== 'admin') return;
    setSaving(true);
    try {
      await api.setFineConfig(dailyRate);
      alert(t('set_saved'));
    } catch { alert(t('set_save_failed')); }
    finally { setSaving(false); }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    try {
      await api.createCategory(newCat.trim());
      const res = await api.getCategories();
      setCategories(res.data);
      setNewCat('');
      setAddingCat(false);
    } catch { alert(t('set_cat_add_failed')); }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await api.deleteCategory(id);
      setCategories((c) => c.filter((x) => x.category_id !== id));
    } catch { alert(t('set_cat_delete_failed')); }
  };

  const tabs = [
    { id: 'fines' as const, label: t('set_fines_tab') },
    { id: 'categories' as const, label: t('set_categories_tab') },
    { id: 'users' as const, label: t('set_users_tab') },
  ];

  return (
    <div>
      <ArabesqueHeader titleAr={t('set_title')} />
      <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', border: `1px solid ${COLORS.goldLight}`, marginBottom: '24px', gap: '4px' }}>
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setActiveTab(tb.id)}
            style={{ flex: 1, padding: '11px 16px', borderRadius: '9px', border: 'none', background: activeTab === tb.id ? COLORS.darkLapis : 'transparent', color: activeTab === tb.id ? COLORS.gold : COLORS.darkLapis, cursor: 'pointer' }}>
            {tb.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'fines' && (
          <motion.div key="fines" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: 'white', border: `1.5px solid ${COLORS.goldLight}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontWeight: 700, marginBottom: '16px' }}>{t('set_daily_rate')}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <button onClick={() => setDailyRate((r) => Math.max(0.5, +(r - 0.5).toFixed(1)))} style={{ width: '36px', height: '36px', borderRadius: '50%', border: `1.5px solid ${COLORS.gold}`, background: 'transparent', cursor: 'pointer' }}>−</button>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', fontWeight: 600 }}>{dailyRate}</div>
                    <div style={{ fontSize: '12px', color: COLORS.goldLight }}>{t('set_per_day')}</div>
                  </div>
                  <button onClick={() => setDailyRate((r) => +(r + 0.5).toFixed(1))} style={{ width: '36px', height: '36px', borderRadius: '50%', background: COLORS.gold, border: 'none', color: 'white', cursor: 'pointer' }}>+</button>
                </div>
                {user?.role === 'admin' && (
                  <div style={{ marginTop: '20px' }}><GoldButton small onClick={handleSaveFine}>{saving ? '...' : t('set_save_settings')}</GoldButton></div>
                )}
              </div>
              <div style={{ background: COLORS.darkLapis, borderRadius: '14px', padding: '24px', color: 'white' }}>
                <div style={{ color: COLORS.gold, fontWeight: 700, marginBottom: '16px' }}>{t('set_live_preview')}</div>
                <label style={{ fontSize: '11px', color: COLORS.goldLight }}>{t('set_simulate_days')}</label>
                <input type="range" min="0" max="30" value={previewDays} onChange={(e) => setPreview(+e.target.value)} style={{ accentColor: COLORS.gold, width: '100%' }} />
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <div style={{ fontSize: '48px', color: previewFine > 0 ? COLORS.bloodRed : COLORS.gold }}>{previewFine.toFixed(1)}</div>
                  <div style={{ color: COLORS.goldLight }}>{previewFine === 0 ? t('set_on_time') : t('set_fine_due')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div key="cats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}` }}>
              <div style={{ fontWeight: 700, marginBottom: '20px' }}>{t('set_book_categories')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {categories.map((c) => (
                  <HexChip key={c.category_id} label={c.name} color={CAT_COLORS[c.name] || COLORS.lapis} onDelete={() => user?.role === 'admin' && handleDeleteCategory(c.category_id)} />
                ))}
                {user?.role === 'admin' && (
                  addingCat ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: `1.5px solid ${COLORS.gold}`, borderRadius: '8px', padding: '4px 8px' }}>
                      <input autoFocus value={newCat} onChange={(e) => setNewCat(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()} placeholder={t('set_cat_placeholder')} style={{ border: 'none', outline: 'none', width: '120px' }} />
                      <button onClick={handleAddCategory} style={{ background: COLORS.gold, border: 'none', borderRadius: '4px', padding: '3px 8px', color: 'white', cursor: 'pointer' }}>+</button>
                      <button onClick={() => { setNewCat(''); setAddingCat(false); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                  ) : (
                    <button onClick={() => setAddingCat(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: `1.5px dashed ${COLORS.goldLight}`, borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', background: 'transparent', color: COLORS.goldLight }}>
                      <Plus size={14} /> {t('set_add_category')}
                    </button>
                  )
                )}
              </div>
              <StarDivider />
              <div style={{ fontSize: '12px', color: '#717182' }}>{categories.length} {t('set_cat_count')}</div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}` }}>
              <div style={{ fontWeight: 700, marginBottom: '20px' }}>{t('set_users_title')}</div>
              <div style={{ fontSize: '12px', color: '#717182', marginBottom: '16px' }}>{users.length} {t('set_users_registered')}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '12px' }}>
                {users.map((u) => (
                  <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', background: COLORS.parchment, border: `1px solid ${COLORS.goldLight}`, borderRadius: '10px' }}>
                    <MemberAvatar nameAr={u.full_name} size={42} color={u.role === 'admin' ? COLORS.gold : COLORS.lapis} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{u.full_name}</div>
                      <div style={{ fontSize: '10px', color: '#717182' }}>{u.email}</div>
                      <RoleBadge role={u.role as 'admin' | 'librarian' | 'guest'} label={roleLabel(locale, u.role)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
