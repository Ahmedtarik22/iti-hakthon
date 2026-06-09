import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight } from 'lucide-react';
import { COLORS, ArabesqueHeader, SearchInput, MemberAvatar, StatusStamp, GoldButton, GlassModal, GoldInput } from '../components/nebras/index';
import { api, Member, MemberHistory } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';

function MemberPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const { t } = useLocale();
  const [tab, setTab] = useState<'history' | 'fines'>('history');
  const [history, setHistory] = useState<MemberHistory[]>([]);
  const [activeBooks, setActiveBooks] = useState<string[]>([]);

  useEffect(() => {
    api.getMemberHistory(member.member_id).then((res) => {
      setHistory(res.data.filter((h) => h.status === 'returned'));
      setActiveBooks(res.data.filter((h) => h.status !== 'returned').map((h) => h.book_title));
    });
  }, [member.member_id]);

  const fine = member.outstanding_fines_total || 0;

  return (
    <motion.div initial={{ x: 360, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 360, opacity: 0 }}
      style={{ position: 'fixed', right: 0, top: 60, bottom: 0, width: '360px', background: 'white', borderLeft: `2px solid ${COLORS.goldLight}`, zIndex: 500, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px', background: COLORS.parchment }}>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', float: 'right' }}><X size={16} /> {t('close')}</button>
        <div style={{ textAlign: 'center', paddingTop: '20px' }}>
          <MemberAvatar nameAr={member.full_name} size={64} />
          <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '10px' }}>{member.full_name}</div>
          <div style={{ fontSize: '12px', color: '#717182' }}>{member.email}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '12px' }}>
            <div><div style={{ fontSize: '20px', color: COLORS.lapis }}>{member.active_borrows_count || 0}</div><div style={{ fontSize: '11px' }}>{t('active')}</div></div>
            <div><div style={{ fontSize: '20px', color: fine > 0 ? COLORS.bloodRed : COLORS.sealGreen }}>{fine}</div><div style={{ fontSize: '11px' }}>{t('fine')}</div></div>
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: '16px' }}>
          {(['history', 'fines'] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{ flex: 1, padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: tab === tb ? `2px solid ${COLORS.gold}` : '2px solid transparent', color: tab === tb ? COLORS.gold : COLORS.darkLapis }}>
              {tb === 'history' ? t('mem_history') : t('mem_fines')}
            </button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {tab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((h, i) => (
              <div key={i} style={{ background: COLORS.parchment, border: `1px solid ${COLORS.goldLight}`, borderRadius: '10px', padding: '12px' }}>
                <div style={{ fontWeight: 700 }}>{h.book_title}</div>
                <div style={{ fontSize: '10px', color: '#717182', marginTop: '4px' }}>{h.borrow_date} → {h.actual_return_date}</div>
                {h.fine_amount > 0 && <div style={{ fontSize: '10px', color: COLORS.bloodRed }}>{h.fine_amount} {t('currency')}</div>}
              </div>
            ))}
            {activeBooks.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: `1px solid ${COLORS.goldLight}`, borderRadius: '8px' }}>
                <StatusStamp status="active" size={28} /><span>{b}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'fines' && (
          fine > 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', background: `${COLORS.bloodRed}12`, borderRadius: '10px' }}>
              <div style={{ fontSize: '32px', color: COLORS.bloodRed }}>{fine}</div>
              <div>{t('mem_fine_due')}</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: COLORS.sealGreen }}>✅ {t('mem_no_fines')}</div>
          )
        )}
      </div>
    </motion.div>
  );
}

export function MembersScreen() {
  const { t } = useLocale();
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelected] = useState<Member | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', address: '', membership_date: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(true);

  const loadMembers = () => {
    setLoading(true);
    api.getMembers({ q: search || undefined, limit: 100 }).then((res) => setMembers(res.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { const id = setTimeout(loadMembers, 300); return () => clearTimeout(id); }, [search]);

  const handleAdd = async () => {
    if (!form.full_name || !form.email) return;
    try {
      await api.createMember(form);
      setShowAdd(false);
      setForm({ full_name: '', email: '', phone: '', address: '', membership_date: new Date().toISOString().split('T')[0] });
      loadMembers();
    } catch { alert(t('mem_add_failed')); }
  };

  return (
    <div>
      <ArabesqueHeader titleAr={t('mem_title')} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}><SearchInput placeholder={t('mem_search_placeholder')} value={search} onChange={setSearch} /></div>
        <GoldButton onClick={() => setShowAdd(true)}>+ {t('mem_add')}</GoldButton>
      </div>
      <div style={{ background: 'white', borderRadius: '14px', border: `1px solid ${COLORS.goldLight}`, overflow: 'hidden' }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: COLORS.goldLight }}>{t('loading')}</div> : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: COLORS.sage }}>
              {[t('mem_member'), t('email'), t('mem_active_borrows'), t('mem_fines'), t('mem_joined'), ''].map((h, i) => (
                <th key={i} style={{ padding: '13px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 700 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.member_id} onClick={() => setSelected(m.member_id === selectedMember?.member_id ? null : m)} style={{ cursor: 'pointer', borderBottom: `1px solid ${COLORS.goldLight}25`, background: selectedMember?.member_id === m.member_id ? `${COLORS.gold}10` : 'white' }}>
                  <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><MemberAvatar nameAr={m.full_name} size={40} /><span style={{ fontWeight: 700 }}>{m.full_name}</span></div></td>
                  <td style={{ padding: '14px 16px', fontSize: '11px', color: '#717182' }}>{m.email}</td>
                  <td style={{ padding: '14px 16px', color: COLORS.lapis }}>{m.active_borrows_count || 0}</td>
                  <td style={{ padding: '14px 16px', color: (m.outstanding_fines_total || 0) > 0 ? COLORS.terracotta : COLORS.sealGreen }}>{(m.outstanding_fines_total || 0) > 0 ? `${m.outstanding_fines_total} ${t('currency')}` : t('none')}</td>
                  <td style={{ padding: '14px 16px', fontSize: '11px', color: '#AAABB8' }}>{m.membership_date}</td>
                  <td style={{ padding: '14px 16px' }}><ChevronRight size={16} color={COLORS.goldLight} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AnimatePresence>{selectedMember && <MemberPanel member={selectedMember} onClose={() => setSelected(null)} />}</AnimatePresence>
      <GlassModal open={showAdd} onClose={() => setShowAdd(false)} title={t('mem_add')} titleAr={t('mem_add')} width={480}>
        <div style={{ color: 'white', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <GoldInput dark label={t('mem_full_name')} labelAr={t('mem_full_name')} value={form.full_name} onChange={(v) => setForm((f) => ({ ...f, full_name: v }))} />
          <GoldInput dark label={t('email')} labelAr={t('email')} value={form.email} onChange={(v) => setForm((f) => ({ ...f, email: v }))} />
          <GoldInput dark label={t('phone')} labelAr={t('phone')} value={form.phone} onChange={(v) => setForm((f) => ({ ...f, phone: v }))} />
          <GoldInput dark label={t('address')} labelAr={t('address')} value={form.address} onChange={(v) => setForm((f) => ({ ...f, address: v }))} />
          <GoldButton onClick={handleAdd}>{t('mem_add')}</GoldButton>
        </div>
      </GlassModal>
    </div>
  );
}
