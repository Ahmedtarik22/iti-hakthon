import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, StatCard, BookSpine, ArabesqueHeader, StarDivider, CATEGORY_COLORS } from '../components/nebras/index';
import { api } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';

export function DashboardScreen() {
  const { t } = useLocale();
  const [stats, setStats] = useState({ total_books: 0, member_count: 0, active_borrows: 0, overdue_count: 0, outstanding_fines_total: 0, available_books: 0 });
  const [topBooks, setTopBooks] = useState<{ titleAr: string; category: string; color: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getMostBorrowed(10)])
      .then(([dash, borrowed]) => {
        setStats(dash.data);
        setTopBooks(borrowed.data.map((b) => ({
          titleAr: b.title,
          category: b.category,
          color: CATEGORY_COLORS[b.category] || COLORS.gold,
          count: b.borrow_count,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: COLORS.goldLight }}>{t('loading')}</div>;

  return (
    <div>
      <ArabesqueHeader titleAr={t('dash_overview')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { labelAr: t('dash_total_books'), labelEn: t('dash_total_books'), value: stats.total_books, max: 500, color: COLORS.gold },
          { labelAr: t('dash_members'), labelEn: t('dash_members'), value: stats.member_count, max: 200, color: COLORS.lapis },
          { labelAr: t('dash_active_borrows'), labelEn: t('dash_active_borrows'), value: stats.active_borrows, max: 100, color: '#2D5A1B' },
          { labelAr: t('dash_overdue'), labelEn: t('dash_overdue'), value: stats.overdue_count, max: 50, color: COLORS.bloodRed },
          { labelAr: t('dash_outstanding_fines'), labelEn: t('dash_outstanding_fines'), value: stats.outstanding_fines_total, max: 5000, color: COLORS.terracotta, unit: t('currency') },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}` }}>
        <div style={{ fontSize: '18px', color: COLORS.darkLapis, fontWeight: 700, marginBottom: '20px' }}>{t('dash_most_borrowed')}</div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', overflowX: 'auto', paddingBottom: '12px' }}>
          {topBooks.length === 0 ? (
            <div style={{ color: '#717182', padding: '20px' }}>{t('dash_no_data')}</div>
          ) : topBooks.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.06 }}>
              <BookSpine titleAr={b.titleAr} category={b.category} color={b.color} borrowCount={b.count} />
            </motion.div>
          ))}
        </div>
      </div>

      <StarDivider label={t('dash_quick_stats')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginTop: '16px' }}>
        {[
          { labelAr: t('dash_available_copies'), val: String(stats.available_books), unit: t('copies'), color: COLORS.gold },
          { labelAr: t('dash_active_borrows'), val: String(stats.active_borrows), unit: t('dash_currently'), color: COLORS.lapis },
          { labelAr: t('dash_overdue'), val: String(stats.overdue_count), unit: t('dash_borrow_count'), color: COLORS.bloodRed },
          { labelAr: t('dash_outstanding_fines'), val: String(stats.outstanding_fines_total), unit: t('currency'), color: COLORS.sealGreen },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', border: `1px solid ${COLORS.goldLight}`, borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'JetBrains Mono,monospace', fontSize: '28px', color: s.color, fontWeight: 600 }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: COLORS.goldLight }}>{s.unit}</div>
            <div style={{ fontSize: '13px', color: COLORS.darkLapis }}>{s.labelAr}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
