import { useEffect, useState } from 'react';
import { COLORS, StatCard, ArabesqueHeader, StarDivider, MemberAvatar, CATEGORY_COLORS } from '../components/nebras/index';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';

export function ReportsScreen() {
  const { t } = useLocale();
  const [dashboard, setDashboard] = useState({ total_books: 0, active_borrows: 0, outstanding_fines_total: 0, member_count: 0 });
  const [topBorrowers, setTopBorrowers] = useState<{ nameAr: string; count: number; rank: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getMemberActivity(5), api.getMostBorrowed(20)])
      .then(([dash, activity, books]) => {
        setDashboard(dash.data);
        setTopBorrowers(activity.data.map((m, i) => ({ nameAr: m.full_name, count: m.borrow_count, rank: i + 1 })));
        const byCat: Record<string, number> = {};
        books.data.forEach((b) => { byCat[b.category || '—'] = (byCat[b.category || '—'] || 0) + b.borrow_count; });
        setCategoryData(Object.entries(byCat).map(([name, value]) => ({ name, value, color: CATEGORY_COLORS[name] || COLORS.gold })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = async () => {
    const res = await api.exportOverdueCsv();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'overdue-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: COLORS.goldLight }}>{t('loading')}</div>;

  return (
    <div>
      <ArabesqueHeader titleAr={t('rpt_title')} action={
        <button onClick={handleExportCsv} style={{ border: `1.5px solid ${COLORS.goldLight}`, borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', background: 'transparent', color: COLORS.lapis }}>{t('rpt_export_csv')}</button>
      } />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard labelAr={t('dash_total_books')} labelEn={t('dash_total_books')} value={dashboard.total_books} max={500} color={COLORS.gold} />
        <StatCard labelAr={t('dash_active_borrows')} labelEn={t('dash_active_borrows')} value={dashboard.active_borrows} max={100} color={COLORS.lapis} />
        <StatCard labelAr={t('dash_outstanding_fines')} labelEn={t('dash_outstanding_fines')} value={dashboard.outstanding_fines_total} max={5000} unit={t('currency')} color={COLORS.terracotta} />
        <StatCard labelAr={t('dash_members')} labelEn={t('dash_members')} value={dashboard.member_count} max={200} color={COLORS.sealGreen} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}` }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{t('rpt_by_category')}</div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}` }}>
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>{t('rpt_top_borrowers')}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topBorrowers.map((m) => (
              <div key={m.rank} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: m.rank === 1 ? `${COLORS.gold}10` : COLORS.parchment, border: `1px solid ${COLORS.goldLight}`, borderRadius: '10px' }}>
                <span>{m.rank === 1 ? '🏆' : m.rank}</span>
                <MemberAvatar nameAr={m.nameAr} size={36} />
                <div style={{ flex: 1, fontWeight: m.rank === 1 ? 700 : 400 }}>{m.nameAr}</div>
                <div style={{ fontWeight: 600 }}>{m.count} {t('rpt_borrows_label')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <StarDivider label={t('rpt_finance')} />
      <div style={{ background: 'white', borderRadius: '14px', padding: '24px', border: `1px solid ${COLORS.goldLight}`, marginTop: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 700 }}>{t('rpt_total_fines')}</div>
        <div style={{ fontSize: '40px', color: COLORS.gold, fontWeight: 600, marginTop: '12px' }}>
          {dashboard.outstanding_fines_total.toLocaleString()} <span style={{ fontSize: '16px' }}>{t('rpt_sar')}</span>
        </div>
      </div>
    </div>
  );
}
