import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, BookOpen, Users, BookMarked,
  ClipboardList, BarChart3, Settings, LogOut, Languages
} from 'lucide-react';
import { COLORS, ArabesquePattern, starPath, waxSealPath } from './components/nebras/index';
import { useAuth } from '../lib/AuthContext';
import { useLocale } from '../lib/LocaleContext';
import { roleLabel, TranslationKey } from '../lib/i18n';
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { BookCatalogScreen } from './screens/BookCatalogScreen';
import { MembersScreen } from './screens/MembersScreen';
import { RecordBorrowScreen } from './screens/RecordBorrowScreen';
import { ActiveBorrowsScreen } from './screens/ActiveBorrowsScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { SettingsScreen } from './screens/SettingsScreen';

type Screen = 'dashboard' | 'catalog' | 'members' | 'record' | 'borrows' | 'reports' | 'settings';

const NAV_SCREENS: { screen: Screen; labelKey: TranslationKey; Icon: React.FC<{ size?: number; color?: string }> }[] = [
  { screen: 'dashboard', labelKey: 'nav_dashboard', Icon: LayoutDashboard },
  { screen: 'catalog', labelKey: 'nav_catalog', Icon: BookOpen },
  { screen: 'members', labelKey: 'nav_members', Icon: Users },
  { screen: 'record', labelKey: 'nav_record', Icon: BookMarked },
  { screen: 'borrows', labelKey: 'nav_borrows', Icon: ClipboardList },
  { screen: 'reports', labelKey: 'nav_reports', Icon: BarChart3 },
  { screen: 'settings', labelKey: 'nav_settings', Icon: Settings },
];

function NebrasLogo() {
  const seal = waxSealPath(22, 22, 19);
  const star = starPath(22, 22, 9, 3.5);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 20px 16px' }}>
      <svg width="44" height="44" viewBox="0 0 44 44">
        <path d={seal} fill={COLORS.gold} opacity="0.9" />
        <circle cx="22" cy="22" r="12" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" />
        <path d={star} fill="rgba(255,255,255,0.9)" />
      </svg>
      <div>
        <div style={{ fontFamily: 'Amiri,serif', fontSize: '26px', color: COLORS.gold, fontWeight: 700, lineHeight: 0.9 }}>نبراس</div>
        <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '10px', color: `${COLORS.goldLight}90`, letterSpacing: '3px', marginTop: '4px' }}>NEBRAS LMS</div>
      </div>
    </div>
  );
}

function Sidebar({ current, onChange, isRTL, onLogout, userName, userRole, t }: {
  current: Screen; onChange: (s: Screen) => void; isRTL: boolean; onLogout: () => void;
  userName: string; userRole: string; t: (k: TranslationKey) => string;
}) {
  return (
    <div style={{
      width: '240px', flexShrink: 0,
      background: COLORS.darkLapis,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      [isRTL ? 'borderLeft' : 'borderRight']: `1px solid ${COLORS.gold}18`,
    }}>
      <ArabesquePattern id="sidebar-arb" opacity={0.06} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg,${COLORS.gold},${COLORS.goldLight},transparent)`, zIndex: 1 }} />
      <div style={{ position: 'relative', zIndex: 1, borderBottom: `1px solid ${COLORS.gold}18` }}>
        <NebrasLogo />
      </div>
      <nav style={{ flex: 1, padding: '12px 0', position: 'relative', zIndex: 1, overflowY: 'auto' }}>
        {NAV_SCREENS.map((item) => {
          const active = current === item.screen;
          const label = t(item.labelKey);
          return (
            <div key={item.screen} onClick={() => onChange(item.screen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '13px 20px', cursor: 'pointer', position: 'relative',
                color: active ? COLORS.gold : 'rgba(255,255,255,0.65)',
                background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                [isRTL ? 'borderRight' : 'borderLeft']: `3px solid ${active ? COLORS.gold : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}>
              <item.Icon size={18} color={active ? COLORS.gold : 'rgba(255,255,255,0.65)'} />
              <div style={{ fontFamily: isRTL ? 'Amiri,serif' : 'Inter,sans-serif', fontSize: '14px', fontWeight: active ? 700 : 400 }}>
                {label}
              </div>
            </div>
          );
        })}
      </nav>
      <div style={{ position: 'relative', zIndex: 1, borderTop: `1px solid ${COLORS.gold}18`, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: `linear-gradient(135deg,${COLORS.gold},#B8960A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Amiri,serif', fontSize: '14px', color: 'white', fontWeight: 700 }}>{userName.charAt(0)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Amiri,serif', fontSize: '13px', color: COLORS.gold, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
          <div style={{ fontFamily: 'Inter,sans-serif', fontSize: '9px', color: `${COLORS.goldLight}70` }}>{userRole}</div>
        </div>
        <button onClick={onLogout} title={t('logout')}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: `${COLORS.goldLight}70`, padding: '4px', display: 'flex', alignItems: 'center' }}>
          <LogOut size={15} />
        </button>
      </div>
    </div>
  );
}

function TopBar({ screen, isRTL, locale, onToggleLocale, t }: {
  screen: Screen; isRTL: boolean; locale: string; onToggleLocale: () => void;
  t: (k: TranslationKey) => string;
}) {
  const item = NAV_SCREENS.find((n) => n.screen === screen)!;
  const today = new Date().toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <div style={{
      height: '60px', flexShrink: 0, background: 'white',
      borderBottom: `1px solid ${COLORS.goldLight}`,
      display: 'flex', alignItems: 'center', padding: '0 24px', gap: '16px',
      boxShadow: '0 1px 8px rgba(27,58,107,0.06)',
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '2px', height: '28px', background: `linear-gradient(180deg,${COLORS.gold},transparent)`, borderRadius: '2px' }} />
        <div style={{ fontFamily: isRTL ? 'Amiri,serif' : 'Inter,sans-serif', fontSize: '20px', color: COLORS.darkLapis, fontWeight: 700 }}>
          {t(item.labelKey)}
        </div>
      </div>
      <div style={{ fontFamily: isRTL ? 'Amiri,serif' : 'Inter,sans-serif', fontSize: '12px', color: COLORS.goldLight }}>
        {today}
      </div>
      <button onClick={onToggleLocale}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: isRTL ? COLORS.darkLapis : `${COLORS.gold}15`,
          border: `1.5px solid ${isRTL ? COLORS.gold : COLORS.goldLight}`,
          borderRadius: '20px', padding: '6px 14px', cursor: 'pointer',
        }}>
        <Languages size={14} color={isRTL ? COLORS.gold : COLORS.lapis} />
        <span style={{ fontFamily: 'Inter,sans-serif', fontSize: '11px', color: isRTL ? COLORS.gold : COLORS.lapis, fontWeight: 600 }}>
          {isRTL ? 'عربي' : 'EN'}
        </span>
      </button>
    </div>
  );
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const { locale, isRTL, t, toggleLocale } = useLocale();
  const [screen, setScreen] = useState<Screen>('dashboard');

  if (loading) return null;
  if (!user) return <LoginScreen />;

  const SCREEN_MAP: Record<Screen, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    catalog: <BookCatalogScreen />,
    members: <MembersScreen />,
    record: <RecordBorrowScreen />,
    borrows: <ActiveBorrowsScreen />,
    reports: <ReportsScreen />,
    settings: <SettingsScreen />,
  };

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      style={{
        display: 'flex', height: '100vh', overflow: 'hidden',
        fontFamily: isRTL ? 'Amiri,serif' : 'Inter,sans-serif',
        background: COLORS.parchment,
        direction: isRTL ? 'rtl' : 'ltr',
        flexDirection: isRTL ? 'row-reverse' : 'row',
      }}>
      <Sidebar
        current={screen}
        onChange={setScreen}
        isRTL={isRTL}
        onLogout={logout}
        userName={user.name}
        userRole={roleLabel(locale, user.role)}
        t={t}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar screen={screen} isRTL={isRTL} locale={locale} onToggleLocale={toggleLocale} t={t} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px', background: COLORS.parchment, position: 'relative' }}>
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
            <ArabesquePattern id="content-arb" color={COLORS.lapis} opacity={0.018} />
          </div>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto' }}>
            <AnimatePresence mode="wait">
              <motion.div key={`${screen}-${locale}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}>
                {SCREEN_MAP[screen]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
