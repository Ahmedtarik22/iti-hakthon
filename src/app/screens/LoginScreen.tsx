import { useState } from 'react';
import { motion } from 'motion/react';
import { COLORS, ArabesquePattern, GoldInput, starPath, waxSealPath } from '../components/nebras/index';
import { useAuth } from '../../lib/AuthContext';
import { useLocale } from '../../lib/LocaleContext';
import { ApiError } from '../../lib/api';

function RoseWindow() {
  const sp = (cx: number, cy: number, r: number) => starPath(cx, cy, r, r * 0.4);
  const radialLines = Array.from({ length: 16 }, (_, i) => {
    const a = (i * Math.PI * 2) / 16 - Math.PI / 2;
    return { x1: 300 + 380 * Math.cos(a), y1: 400 + 380 * Math.sin(a), x2: 300 - 380 * Math.cos(a), y2: 400 - 380 * Math.sin(a) };
  });
  const secondaryStarAngles = Array.from({ length: 8 }, (_, i) => (i * Math.PI * 2) / 8 - Math.PI / 2);
  return (
    <svg viewBox="0 0 600 800" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.16 }} aria-hidden>
      {[60, 130, 200, 270, 340].map((r, i) => (
        <circle key={r} cx="300" cy="400" r={r} fill="none" stroke={COLORS.gold} strokeWidth={0.6 + i * 0.1} opacity={0.9 - i * 0.12} />
      ))}
      {radialLines.map((l, i) => (
        <line key={i} x1={l.x1.toFixed(1)} y1={l.y1.toFixed(1)} x2={l.x2.toFixed(1)} y2={l.y2.toFixed(1)} stroke={COLORS.gold} strokeWidth="0.4" opacity="0.25" />
      ))}
      {[55, 120, 195, 270].map((r, i) => (
        <path key={r} d={sp(300, 400, r)} fill="none" stroke={COLORS.gold} strokeWidth={0.8 - i * 0.1} opacity={0.85 - i * 0.1} />
      ))}
      <path d={starPath(300, 400, 48, 20, 12)} fill="none" stroke={COLORS.gold} strokeWidth="0.8" opacity="0.9" />
    </svg>
  );
}

export function LoginScreen() {
  const { login } = useAuth();
  const { t, isRTL, toggleLocale, locale } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email || !password) { setError(t('login_fill_fields')); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      const msg = err instanceof ApiError && err.code === 'INVALID_CREDENTIALS'
        ? t('login_invalid') : t('login_server_error');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', height: '100vh', fontFamily: isRTL ? 'Amiri,serif' : 'Inter,sans-serif', overflow: 'hidden' }}>
      <div style={{ flex: '0 0 60%', background: COLORS.darkLapis, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <ArabesquePattern id="login-main-arb" opacity={0.07} />
        <RoseWindow />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }} style={{ position: 'relative', textAlign: 'center', zIndex: 1 }}>
          <h1 style={{ fontFamily: 'Amiri,serif', fontSize: '72px', color: COLORS.gold, fontWeight: 700, margin: 0, lineHeight: 0.9 }}>نبراس</h1>
          <p style={{ fontFamily: 'Inter,sans-serif', fontSize: '15px', color: COLORS.goldLight, marginTop: '12px', letterSpacing: '6px' }}>N E B R A S</p>
          <div style={{ marginTop: '10px', fontSize: '14px', color: `${COLORS.gold}90` }}>{t('app_subtitle_ar')}</div>
        </motion.div>
      </div>

      <div style={{ flex: '0 0 40%', background: COLORS.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative' }}>
        <button onClick={toggleLocale} style={{ position: 'absolute', top: 16, right: isRTL ? 'auto' : 16, left: isRTL ? 16 : 'auto', background: COLORS.darkLapis, border: `1px solid ${COLORS.gold}`, borderRadius: '20px', padding: '6px 14px', color: COLORS.gold, cursor: 'pointer', fontSize: '12px' }}>
          {locale === 'ar' ? 'English' : 'عربي'}
        </button>
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '36px', boxShadow: '0 8px 40px rgba(27,58,107,0.12)', border: `1px solid ${COLORS.goldLight}` }}>
            <h2 style={{ fontSize: '28px', color: COLORS.darkLapis, fontWeight: 700, margin: '0 0 6px' }}>{t('login_welcome')}</h2>
            <p style={{ fontSize: '14px', color: '#717182', margin: '0 0 28px' }}>{t('login_subtitle')}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <GoldInput label={t('login_email')} labelAr={t('login_email')} type="email" value={email} onChange={setEmail} placeholder="admin@nebras.sa" />
              <GoldInput label={t('login_password')} labelAr={t('login_password')} type="password" value={password} onChange={setPassword} placeholder="••••••••" />
              {error && <div style={{ fontSize: '13px', color: COLORS.bloodRed, padding: '8px 12px', background: '#8B000012', borderRadius: '6px' }}>{error}</div>}
              <button onClick={handleSubmit} disabled={loading}
                style={{ background: `linear-gradient(135deg,${COLORS.gold},#B8960A)`, border: 'none', borderRadius: '10px', padding: '14px', color: 'white', fontSize: '17px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? t('login_loading') : t('login_submit')}
              </button>
              <div style={{ fontSize: '11px', color: '#AAABB8', textAlign: 'center' }}>{t('login_demo')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
