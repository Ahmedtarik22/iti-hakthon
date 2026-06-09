import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { COLORS, StepIndicator, MemberAvatar, BookSpine, ArabesqueHeader, SearchInput, WaxSealButton } from '../components/nebras/index';
import { api, Member, Book } from '../../lib/api';
import { useLocale } from '../../lib/LocaleContext';
import { monthName } from '../../lib/i18n';
import { CATEGORY_COLORS } from '../components/nebras/index';

function MiniCalendar({ selectedDate, onSelect }: { selectedDate: string | null; onSelect: (d: string) => void }) {
  const { locale, t } = useLocale();
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay }, () => null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const isPast = (d: number) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const makeDate = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div style={{ background: 'white', border: `1.5px solid ${COLORS.goldLight}`, borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg,${COLORS.darkLapis},${COLORS.lapis})`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); }} style={{ background: 'transparent', border: 'none', color: COLORS.gold, cursor: 'pointer', fontSize: '18px' }}>‹</button>
        <div style={{ color: COLORS.gold, fontWeight: 700 }}>{monthName(locale, month)} {year}</div>
        <button onClick={() => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); }} style={{ background: 'transparent', border: 'none', color: COLORS.gold, cursor: 'pointer', fontSize: '18px' }}>›</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '8px', gap: '2px' }}>
        {days.map((d, i) => {
          if (!d) return <div key={`e${i}`} />;
          const dateStr = makeDate(d);
          const past = isPast(d);
          return (
            <button key={i} onClick={() => !past && onSelect(dateStr)} disabled={past}
              style={{ padding: '6px', border: 'none', borderRadius: '8px', cursor: past ? 'not-allowed' : 'pointer', background: dateStr === selectedDate ? COLORS.gold : 'transparent', color: dateStr === selectedDate ? 'white' : COLORS.darkLapis, opacity: past ? 0.35 : 1 }}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function RecordBorrowScreen() {
  const { t } = useLocale();
  const [step, setStep] = useState(0);
  const [members, setMembers] = useState<Member[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [member, setMember] = useState<Member | null>(null);
  const [book, setBook] = useState<Book | null>(null);
  const [dueDate, setDue] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getMembers({ limit: 100 }).then((r) => setMembers(r.data));
    api.getBooks({ availability: 'available', limit: 100 }).then((r) => setBooks(r.data));
  }, []);

  const steps = [{ labelAr: t('rec_step_member'), labelEn: t('rec_step_member') }, { labelAr: t('rec_step_book'), labelEn: t('rec_step_book') }, { labelAr: t('rec_step_date'), labelEn: t('rec_step_date') }];
  const memberFiltered = members.filter((m) => m.full_name.includes(search) || m.email.toLowerCase().includes(search.toLowerCase()));
  const bookFiltered = books.filter((b) => b.title.includes(search) || (b.category?.name || '').includes(search));

  const handleConfirm = async () => {
    if (!member || !book || !dueDate) return;
    setError('');
    try {
      await api.createTransaction({ member_id: member.member_id, book_id: book.book_id, expected_return_date: dueDate });
      setDone(true);
      setTimeout(() => { setStep(0); setMember(null); setBook(null); setDue(null); setDone(false); setBooks([]); api.getBooks({ availability: 'available', limit: 100 }).then((r) => setBooks(r.data)); }, 2000);
    } catch { setError(t('rec_failed')); }
  };

  if (done) return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <div style={{ fontSize: '28px', color: COLORS.sealGreen, fontWeight: 700 }}>{t('success')}</div>
      <div style={{ color: '#717182', marginTop: '8px' }}>{t('rec_success_sub')}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px' }}>
      <ArabesqueHeader titleAr={t('rec_title')} />
      <StepIndicator steps={steps} current={step} />
      {error && <div style={{ color: COLORS.bloodRed, marginBottom: '12px' }}>{error}</div>}

      {step === 0 && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ marginBottom: '16px', fontWeight: 600 }}>{t('rec_select_member')}</div>
          <SearchInput placeholder={t('rec_search_member')} value={search} onChange={setSearch} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '12px', marginTop: '16px' }}>
            {memberFiltered.map((m) => (
              <div key={m.member_id} onClick={() => { setMember(m); setSearch(''); setStep(1); }}
                style={{ background: 'white', border: `1.5px solid ${COLORS.goldLight}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <MemberAvatar nameAr={m.full_name} size={44} />
                <div>
                  <div style={{ fontWeight: 700 }}>{m.full_name}</div>
                  <div style={{ fontSize: '10px', color: COLORS.lapis }}>{m.active_borrows_count || 0} {t('active')}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {step === 1 && member && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <MemberAvatar nameAr={member.full_name} size={36} />
            <span style={{ fontWeight: 700 }}>{member.full_name}</span>
            <button onClick={() => { setStep(0); setMember(null); }} style={{ marginInlineStart: 'auto', border: `1px solid ${COLORS.goldLight}`, borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', background: 'transparent' }}>{t('change')}</button>
          </div>
          <SearchInput placeholder={t('rec_search_book')} value={search} onChange={setSearch} />
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', padding: '20px', marginTop: '16px', background: 'white', border: `1px solid ${COLORS.goldLight}`, borderRadius: '12px' }}>
            {bookFiltered.map((b) => {
              const cat = b.category?.name || '';
              return (
                <div key={b.book_id} onClick={() => { setBook(b); setSearch(''); setStep(2); }} style={{ cursor: 'pointer', opacity: b.available_copies === 0 ? 0.45 : 1 }}>
                  <BookSpine titleAr={b.title} category={cat} color={CATEGORY_COLORS[cat] || COLORS.gold} />
                  <div style={{ textAlign: 'center', fontSize: '10px', color: COLORS.sealGreen }}>{b.available_copies}/{b.total_copies}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {step === 2 && member && book && (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <div style={{ marginBottom: '16px', fontWeight: 600 }}>{t('rec_set_due')}</div>
              <MiniCalendar selectedDate={dueDate} onSelect={setDue} />
            </div>
            <div>
              <div style={{ background: COLORS.parchment, border: `1px solid ${COLORS.goldLight}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontWeight: 700, marginBottom: '14px' }}>{t('rec_summary')}</div>
                <div>{member.full_name}</div>
                <div style={{ marginTop: '8px' }}>{book.title}</div>
                {dueDate && <div style={{ marginTop: '8px' }}>{t('due_date')}: {dueDate}</div>}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <WaxSealButton onClick={dueDate ? handleConfirm : undefined} variant="lapis">{t('rec_confirm')}</WaxSealButton>
                <button onClick={() => setStep(1)} style={{ border: `1px solid ${COLORS.goldLight}`, borderRadius: '8px', padding: '10px', cursor: 'pointer', background: 'transparent' }}>← {t('rec_change_book')}</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
