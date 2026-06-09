import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { COLORS, ArabesqueHeader, StatusStamp, MemberAvatar, WaxSealButton, FineMeter, GlassModal, StarDivider } from '../components/nebras/index';
import { api, Transaction, ReturnPreview } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';

export function ActiveBorrowsScreen() {
  const { t } = useLocale();
  const [borrows, setBorrows] = useState<Transaction[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [fineModal, setFineModal] = useState<{ txn: Transaction; preview: ReturnPreview } | null>(null);
  const [filter, setFilter] = useState<'all' | 'overdue' | 'active'>('all');
  const [loading, setLoading] = useState(true);

  const loadBorrows = () => {
    setLoading(true);
    api.getTransactions({ status: filter === 'all' ? undefined : filter })
      .then((res) => setBorrows(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBorrows(); }, [filter]);

  const handleReturn = async (b: Transaction) => {
    try {
      const preview = await api.previewReturn(b.transaction_id);
      if (preview.data.fine_amount > 0) setFineModal({ txn: b, preview: preview.data });
      else { await api.confirmReturn(b.transaction_id); loadBorrows(); setExpanded(null); }
    } catch { alert(t('bor_preview_failed')); }
  };

  const handleFinePaid = async () => {
    if (!fineModal) return;
    try {
      await api.confirmReturn(fineModal.txn.transaction_id);
      setFineModal(null);
      setExpanded(null);
      loadBorrows();
    } catch { alert(t('bor_return_failed')); }
  };

  const totalOverdue = borrows.filter((b) => b.status === 'overdue' || b.is_overdue).length;
  const totalFines = borrows.reduce((s, b) => s + (b.fine_amount || 0), 0);

  return (
    <div>
      <ArabesqueHeader titleAr={t('bor_title')} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
        {[
          { label: t('bor_total'), val: borrows.length, color: COLORS.lapis },
          { label: t('bor_filter_overdue'), val: totalOverdue, color: COLORS.bloodRed },
          { label: t('bor_pending_fines'), val: `${totalFines} ${t('currency')}`, color: COLORS.terracotta },
        ].map((s, i) => (
          <div key={i} style={{ background: 'white', border: `1px solid ${COLORS.goldLight}`, borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '22px', color: s.color, fontWeight: 600 }}>{s.val}</div>
            <div style={{ fontSize: '13px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['all', 'overdue', 'active'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '7px 16px', borderRadius: '20px', border: `1.5px solid ${filter === f ? COLORS.gold : COLORS.goldLight}`, background: filter === f ? COLORS.gold : 'transparent', color: filter === f ? 'white' : COLORS.darkLapis, cursor: 'pointer' }}>
            {f === 'all' ? t('bor_filter_all') : f === 'overdue' ? t('bor_filter_overdue') : t('bor_filter_active')}
          </button>
        ))}
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px', color: COLORS.goldLight }}>{t('loading')}</div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {borrows.map((b) => {
            const isOverdue = b.status === 'overdue' || b.is_overdue;
            const isExp = expanded === b.transaction_id;
            const borrowedDays = Math.round((Date.now() - new Date(b.borrow_date).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <div key={b.transaction_id}>
                <div onClick={() => setExpanded(isExp ? null : b.transaction_id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 16px', background: isOverdue ? `${COLORS.bloodRed}08` : 'white', border: `1px solid ${isOverdue ? COLORS.bloodRed + '40' : COLORS.goldLight}`, borderRadius: isExp ? '12px 12px 0 0' : '12px', cursor: 'pointer', borderLeft: `4px solid ${isOverdue ? COLORS.bloodRed : COLORS.lapis}` }}>
                  <MemberAvatar nameAr={b.member_name} size={40} color={isOverdue ? COLORS.bloodRed : COLORS.gold} />
                  <div style={{ flex: 1, fontWeight: 700 }}>{b.member_name}</div>
                  <div style={{ flex: 1, textAlign: 'center' }}>{b.book_title}</div>
                  <div style={{ fontSize: '12px', color: isOverdue ? COLORS.bloodRed : COLORS.darkLapis }}>{b.expected_return_date}</div>
                  <StatusStamp status={isOverdue ? 'overdue' : 'active'} size={42} />
                  {isExp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
                <AnimatePresence>
                  {isExp && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ border: `1px solid ${COLORS.goldLight}`, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                      <div style={{ fontSize: '12px', color: '#717182' }}>{t('borrow_date')}: {b.borrow_date} · {t('bor_days_out')}: {borrowedDays}</div>
                      <div style={{ marginInlineStart: 'auto' }}>
                        <WaxSealButton onClick={() => handleReturn(b)} variant={isOverdue ? 'red' : 'lapis'}>
                          {isOverdue ? t('bor_return_fine') : t('bor_confirm_return')}
                        </WaxSealButton>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {!loading && borrows.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: COLORS.goldLight }}>{t('bor_no_match')}</div>}

      <GlassModal open={!!fineModal} onClose={() => setFineModal(null)} title={t('bor_fine_modal_title')} titleAr={t('bor_fine_modal_title')} width={480}>
        {fineModal && (
          <div style={{ color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <div>{fineModal.txn.member_name}</div>
              <div style={{ opacity: 0.8 }}>{fineModal.txn.book_title}</div>
            </div>
            <FineMeter borrowedDays={fineModal.preview.days_overdue} overdueDays={fineModal.preview.days_overdue} fineAmount={fineModal.preview.fine_amount} />
            <StarDivider />
            <WaxSealButton onClick={handleFinePaid} variant="gold">{t('bor_confirm_pay')}</WaxSealButton>
          </div>
        )}
      </GlassModal>
    </div>
  );
}
