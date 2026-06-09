import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';

// ─── Brand tokens ──────────────────────────────────────────────────────────
export const COLORS = {
  lapis:      '#1B3A6B',
  darkLapis:  '#0F2347',
  gold:       '#C9A84C',
  goldLight:  '#D4C9B0',
  goldGlow:   'rgba(201,168,76,0.25)',
  parchment:  '#F5F0E8',
  terracotta: '#8B4513',
  sage:       '#E8EDE4',
  bloodRed:   '#8B0000',
  sealGreen:  '#2D5A1B',
} as const;

export const CATEGORY_COLORS: Record<string, string> = {
  'تاريخ':   '#8B4513',
  'أدب':     '#1B3A6B',
  'علوم':    '#2D5A1B',
  'فلسفة':   '#5B2C8A',
  'شعر':     '#B8421A',
  'فقه':     '#9A7A1A',
  'لغة':     '#1B5B6B',
  'History':    '#8B4513',
  'Literature': '#1B3A6B',
  'Science':    '#2D5A1B',
  'Philosophy': '#5B2C8A',
  'Poetry':     '#B8421A',
};

// ─── Geometry helpers ──────────────────────────────────────────────────────
export function starPath(cx: number, cy: number, outerR: number, innerR: number, n = 8): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / n - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

export function waxSealPath(cx: number, cy: number, r: number, n = 28): string {
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const jitter = 1 + 0.055 * Math.sin(i * 2.9 + 0.7) + 0.03 * Math.cos(i * 7.1 + 1.3);
    const a = (i * 2 * Math.PI) / n;
    pts.push(`${(cx + r * jitter * Math.cos(a)).toFixed(2)},${(cy + r * jitter * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join(' L')} Z`;
}

// ─── ARABESQUE PATTERN ────────────────────────────────────────────────────
export function ArabesquePattern({
  color   = COLORS.gold,
  opacity = 0.05,
  id      = 'arb',
}: { color?: string; opacity?: number; id?: string }) {
  const positions: [number, number][] = [
    [0,0],[40,0],[80,0],[0,40],[40,40],[80,40],[0,80],[40,80],[80,80],
  ];
  const diamond = (cx: number, cy: number, r: number) =>
    `M${cx},${cy-r} L${cx+r},${cy} L${cx},${cy+r} L${cx-r},${cy} Z`;

  return (
    <svg style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity,pointerEvents:'none' }} aria-hidden>
      <defs>
        <pattern id={id} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {positions.map(([cx,cy],i) => (
            <path key={i} d={starPath(cx,cy,17,7)} fill="none" stroke={color} strokeWidth="0.8"/>
          ))}
          <path d={diamond(20,40,3.5)} fill={color} opacity="0.55"/>
          <path d={diamond(60,40,3.5)} fill={color} opacity="0.55"/>
          <path d={diamond(40,20,3.5)} fill={color} opacity="0.55"/>
          <path d={diamond(40,60,3.5)} fill={color} opacity="0.55"/>
          {positions.map(([cx,cy],i) => (
            <circle key={`d${i}`} cx={cx} cy={cy} r="1.8" fill={color} opacity="0.4"/>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`}/>
    </svg>
  );
}

// ─── STAR DIVIDER ─────────────────────────────────────────────────────────
export function StarDivider({ label }: { label?: string }) {
  const s = starPath(12,12,9,3.7);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'20px 0' }}>
      <div style={{ flex:1, height:'1px', background:`linear-gradient(90deg,transparent,${COLORS.gold}70)` }}/>
      <svg width="24" height="24" viewBox="0 0 24 24"><path d={s} fill={COLORS.gold}/></svg>
      {label && <span style={{ fontFamily:'Amiri,serif', fontSize:'13px', color:COLORS.gold, whiteSpace:'nowrap' }}>{label}</span>}
      <svg width="24" height="24" viewBox="0 0 24 24"><path d={s} fill={COLORS.gold}/></svg>
      <div style={{ flex:1, height:'1px', background:`linear-gradient(90deg,${COLORS.gold}70,transparent)` }}/>
    </div>
  );
}

// ─── STATUS STAMP ─────────────────────────────────────────────────────────
export function StatusStamp({ status, size = 52 }: { status:'overdue'|'active'|'returned'; size?: number }) {
  const cfg = {
    overdue:  { color:COLORS.bloodRed,  labelAr:'متأخر',  labelEn:'Overdue' },
    active:   { color:COLORS.lapis,     labelAr:'نشط',    labelEn:'Active'  },
    returned: { color:COLORS.sealGreen, labelAr:'مُعاد',  labelEn:'Returned'},
  }[status];
  const cx = size/2, cy = size/2, r = size*0.42;
  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path d={waxSealPath(cx,cy,r)} fill={cfg.color}/>
        <circle cx={cx} cy={cy} r={r*0.68} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8"/>
        {status === 'overdue' && <>
          <line x1={cx} y1={cy-8} x2={cx} y2={cy+2} stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          <circle cx={cx} cy={cy+6} r="1.6" fill="white"/>
        </>}
        {status === 'active' && (
          <g transform={`translate(${cx-9},${cy-7})`}>
            <path d="M0,0 Q9,3 9,3 Q9,3 18,0 L18,14 Q9,11 9,11 Q9,11 0,14 Z" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
            <line x1="9" y1="3" x2="9" y2="11" stroke="white" strokeWidth="1"/>
          </g>
        )}
        {status === 'returned' && (
          <g transform={`translate(${cx-7},${cy-8})`}>
            <rect x="0" y="0" width="14" height="16" rx="1.5" fill="none" stroke="white" strokeWidth="1.5"/>
            <path d="M3,8 L6,11 L11,5" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </g>
        )}
      </svg>
      <span style={{ fontSize:'9px', color:cfg.color, fontFamily:'Amiri,serif', fontWeight:700 }}>{cfg.labelAr}</span>
    </div>
  );
}

// ─── STAT CARD (Astrolabe KPI) ────────────────────────────────────────────
interface StatCardProps {
  labelEn: string; labelAr: string;
  value: number; max: number;
  unit?: string; sublabel?: string;
  color?: string;
}
export function StatCard({ labelEn, labelAr, value, max, unit, sublabel, color=COLORS.gold }: StatCardProps) {
  const [hov, setHov] = useState(false);
  const pct  = Math.min(value/max, 1);
  const R    = 38;
  const circ = 2 * Math.PI * R;
  const off  = circ * (1 - pct);
  const ticks = Array.from({length:8}, (_,i) => {
    const a = (i*Math.PI*2)/8 - Math.PI/2;
    return { x1:50+(R-5)*Math.cos(a), y1:50+(R-5)*Math.sin(a), x2:50+(R+5)*Math.cos(a), y2:50+(R+5)*Math.sin(a) };
  });
  const needleA = (pct*360 - 90) * (Math.PI/180);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        background: COLORS.parchment,
        border:`1px solid ${hov?COLORS.gold:COLORS.goldLight}`,
        borderRadius:'12px', padding:'20px 16px',
        display:'flex', flexDirection:'column', alignItems:'center',
        cursor:'pointer', transition:'all 0.3s ease',
        boxShadow: hov ? `0 4px 24px ${COLORS.goldGlow}` : '0 2px 8px rgba(27,58,107,0.06)',
      }}>
      <div style={{ position:'relative' }}>
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={R} fill="none" stroke={COLORS.sage} strokeWidth="7"/>
          <circle cx="50" cy="50" r={R+7} fill="none" stroke={COLORS.goldLight} strokeWidth="0.6"/>
          <circle cx="50" cy="50" r={R-7} fill="none" stroke={COLORS.goldLight} strokeWidth="0.5" opacity="0.5"/>
          {ticks.map((t,i)=><line key={i} x1={t.x1.toFixed(2)} y1={t.y1.toFixed(2)} x2={t.x2.toFixed(2)} y2={t.y2.toFixed(2)} stroke={COLORS.goldLight} strokeWidth="1.2"/>)}
          <circle cx="50" cy="50" r={R} fill="none" stroke={color} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={off}
            transform="rotate(-90 50 50)"
            style={{ transition:'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}/>
          <circle cx="50" cy="50" r="3.5" fill={color}/>
          <line x1="50" y1="50" x2={(50+24*Math.cos(needleA)).toFixed(2)} y2={(50+24*Math.sin(needleA)).toFixed(2)} stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        </svg>
        <div style={{ position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',pointerEvents:'none' }}>
          <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'17px', color:COLORS.darkLapis, fontWeight:600, lineHeight:1 }}>
            {value.toLocaleString()}
          </span>
          {unit && <span style={{ fontFamily:'Inter,sans-serif', fontSize:'10px', color:COLORS.terracotta, marginTop:'2px' }}>{unit}</span>}
        </div>
      </div>
      <div style={{ textAlign:'center', marginTop:'8px' }}>
        <div style={{ fontFamily:'Amiri,serif', fontSize:'15px', color:COLORS.darkLapis, fontWeight:700 }}>{labelAr}</div>
        {labelEn && labelEn !== labelAr && <div style={{ fontFamily:'Inter,sans-serif', fontSize:'11px', color:'#717182', marginTop:'2px' }}>{labelEn}</div>}
        {sublabel && <div style={{ fontSize:'10px', color:COLORS.terracotta, marginTop:'2px', fontFamily:'Inter,sans-serif' }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ─── BOOK SPINE (shelf) ───────────────────────────────────────────────────
export function BookSpine({ titleAr, category, color, borrowCount }: {
  titleAr:string; category:string; color:string; borrowCount?:number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      title={titleAr}
      style={{
        width:'38px', height:'170px',
        background:`linear-gradient(180deg,${color}ee,${color}b0)`,
        borderRadius:'4px 2px 2px 4px',
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', position:'relative', flexShrink:0,
        boxShadow: hov ? `4px 4px 16px rgba(0,0,0,0.45), -1px 0 0 ${COLORS.goldLight}` : '2px 3px 8px rgba(0,0,0,0.28)',
        transform: hov ? 'translateY(-8px) scaleX(1.06)' : 'translateY(0) scaleX(1)',
        transition:'all 0.25s ease',
      }}>
      <div style={{ position:'absolute', top:'6px', left:0, right:0, height:'5px', background:`linear-gradient(90deg,${COLORS.gold}90,transparent)`, borderRadius:'4px 2px 0 0' }}/>
      <div style={{ transform:'rotate(-90deg)', whiteSpace:'nowrap', fontFamily:'Amiri,serif', fontSize:'11px', color:'rgba(255,255,255,0.95)', fontWeight:700, maxWidth:'150px', overflow:'hidden', textOverflow:'ellipsis', textShadow:'0 1px 2px rgba(0,0,0,0.35)' }}>
        {titleAr}
      </div>
      <div style={{ position:'absolute', bottom:'6px', transform:'rotate(-90deg)', fontFamily:'Amiri,serif', fontSize:'8px', color:'rgba(255,255,255,0.55)', whiteSpace:'nowrap' }}>
        {category}
      </div>
      {borrowCount != null && (
        <div style={{ position:'absolute', top:'-9px', right:'-7px', background:COLORS.gold, color:'white', borderRadius:'50%', width:'17px', height:'17px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'JetBrains Mono,monospace', fontSize:'9px', fontWeight:600, boxShadow:'0 1px 4px rgba(0,0,0,0.3)' }}>
          {borrowCount}
        </div>
      )}
    </div>
  );
}

// ─── BOOK CARD (catalog grid) ─────────────────────────────────────────────
export function BookCard({ titleAr, titleEn, author, category, categoryColor, copies, borrowed, onEdit }: {
  titleAr:string; titleEn:string; author:string; category:string;
  categoryColor:string; copies:number; borrowed:number; onEdit?:()=>void;
}) {
  const [hov, setHov] = useState(false);
  const avail = copies - borrowed;
  const avPct = copies>0 ? (avail/copies)*100 : 0;
  const status: 'overdue'|'active'|'returned' = avail===0 ? 'overdue' : avail/copies < 0.4 ? 'active' : 'returned';
  return (
    <div
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:COLORS.parchment, border:`1px solid ${hov?COLORS.gold:COLORS.goldLight}`, borderRadius:'12px', overflow:'hidden', cursor:'pointer', transition:'all 0.3s ease', boxShadow: hov?`0 6px 28px ${COLORS.goldGlow}`:'0 2px 8px rgba(27,58,107,0.07)' }}>
      <div style={{ background:`linear-gradient(135deg,${COLORS.darkLapis},${COLORS.lapis})`, padding:'18px 16px 14px', position:'relative', overflow:'hidden', borderLeft:`4px solid ${categoryColor}` }}>
        <ArabesquePattern id={`bc-${titleEn.replace(/\W/g,'')}`} opacity={0.06}/>
        <div style={{ fontFamily:'Amiri,serif', fontSize:'16px', color:'white', fontWeight:700, lineHeight:1.3, position:'relative' }}>{titleAr}</div>
        <div style={{ fontFamily:'Inter,sans-serif', fontSize:'11px', color:COLORS.goldLight, marginTop:'3px', position:'relative' }}>{titleEn}</div>
        <div style={{ display:'inline-block', marginTop:'8px', background:`${categoryColor}30`, border:`1px solid ${categoryColor}55`, borderRadius:'4px', padding:'2px 8px', fontFamily:'Amiri,serif', fontSize:'11px', color:COLORS.goldLight, position:'relative' }}>
          {category}
        </div>
      </div>
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontFamily:'Inter,sans-serif', fontSize:'11px', color:COLORS.terracotta, marginBottom:'10px' }}>{author}</div>
        <div style={{ marginBottom:'10px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
            <span style={{ fontSize:'11px', color:'#717182', fontFamily:'Inter,sans-serif' }}>Availability</span>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'11px', color:COLORS.darkLapis }}>{avail}/{copies}</span>
          </div>
          <div style={{ height:'4px', background:COLORS.sage, borderRadius:'2px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${avPct}%`, background: avPct>50?COLORS.sealGreen:avPct>20?COLORS.terracotta:COLORS.bloodRed, borderRadius:'2px', transition:'width 0.6s ease' }}/>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <StatusStamp status={status} size={40}/>
          {onEdit && <button onClick={onEdit} style={{ background:'transparent', border:`1px solid ${COLORS.goldLight}`, borderRadius:'6px', padding:'4px 10px', fontFamily:'Inter,sans-serif', fontSize:'11px', color:COLORS.lapis, cursor:'pointer' }}>Edit</button>}
        </div>
      </div>
    </div>
  );
}

// ─── MEMBER AVATAR ────────────────────────────────────────────────────────
export function MemberAvatar({ nameAr, size=44, color=COLORS.gold }: { nameAr:string; size?:number; color?:string }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:`linear-gradient(135deg,${color},#B8960A)`, display:'flex', alignItems:'center', justifyContent:'center', border:`2px solid ${COLORS.goldLight}`, boxShadow:`0 2px 8px ${COLORS.goldGlow}`, flexShrink:0 }}>
      <span style={{ fontFamily:'Amiri,serif', fontSize:`${size*0.42}px`, color:'white', fontWeight:700, lineHeight:1 }}>
        {nameAr.charAt(0)}
      </span>
    </div>
  );
}

// ─── ROLE BADGE ───────────────────────────────────────────────────────────
export function RoleBadge({ role, label }: { role:'admin'|'librarian'|'guest'; label?: string }) {
  const cfg = {
    admin:     { fallback:'مشرف',  color:COLORS.gold,       icon:'★', bg:`${COLORS.gold}20`     },
    librarian: { fallback:'أمين',  color:COLORS.lapis,      icon:'☰', bg:`${COLORS.lapis}18`    },
    guest:     { fallback:'زائر',  color:'#717182',         icon:'◎', bg:'#71718222'            },
  }[role];
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', background:cfg.bg, border:`1px solid ${cfg.color}40`, borderRadius:'20px', padding:'2px 8px', fontSize:'11px', color:cfg.color }}>
      <span style={{ fontSize:'10px' }}>{cfg.icon}</span>{label || cfg.fallback}
    </span>
  );
}

// ─── GOLD BUTTON ──────────────────────────────────────────────────────────
export function GoldButton({ children, onClick, disabled=false, small=false, type='button' }: {
  children:React.ReactNode; onClick?:()=>void; disabled?:boolean; small?:boolean; type?:'button'|'submit';
}) {
  const [hov, setHov] = useState(false);
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:disabled?'#ccc':hov?`linear-gradient(135deg,#D4AF37,${COLORS.gold})`:`linear-gradient(135deg,${COLORS.gold},#B8960A)`, border:'none', borderRadius:'8px', padding:small?'8px 16px':'11px 28px', color:'white', fontFamily:'Amiri,serif', fontSize:small?'13px':'15px', cursor:disabled?'not-allowed':'pointer', display:'inline-flex', alignItems:'center', gap:'8px', position:'relative', overflow:'hidden', boxShadow:hov?`0 4px 18px ${COLORS.goldGlow}`:'0 2px 6px rgba(201,168,76,0.2)', transition:'all 0.2s ease', whiteSpace:'nowrap' }}>
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.2) 50%,transparent 100%)', backgroundSize:'200% 100%', animation:'shimmer 2.5s infinite' }}/>
      <span style={{ position:'relative' }}>{children}</span>
    </button>
  );
}

// ─── GHOST BUTTON ─────────────────────────────────────────────────────────
export function GhostButton({ children, onClick }: { children:React.ReactNode; onClick?:()=>void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?`${COLORS.gold}10`:'transparent', border:`1px solid ${hov?COLORS.gold:COLORS.goldLight}`, borderRadius:'8px', padding:'10px 22px', color:hov?COLORS.gold:COLORS.darkLapis, fontFamily:'Amiri,serif', fontSize:'15px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', transition:'all 0.2s ease' }}>
      {children}
    </button>
  );
}

// ─── SEARCH INPUT ─────────────────────────────────────────────────────────
export function SearchInput({ placeholder, value, onChange }: { placeholder?:string; value:string; onChange:(v:string)=>void }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', background:'white', border:`1.5px solid ${foc?COLORS.gold:COLORS.goldLight}`, borderRadius:'10px', padding:'10px 16px', boxShadow:foc?`0 0 0 3px ${COLORS.goldGlow}`:'none', transition:'all 0.2s ease' }}>
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke={foc?COLORS.gold:COLORS.goldLight} strokeWidth="1.5"/><line x1="11" y1="11" x2="14" y2="14" stroke={foc?COLORS.gold:COLORS.goldLight} strokeWidth="1.5" strokeLinecap="round"/></svg>
      <input value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)} placeholder={placeholder} style={{ border:'none', outline:'none', background:'transparent', fontFamily:'Inter,sans-serif', fontSize:'14px', color:COLORS.darkLapis, flex:1, minWidth:0 }}/>
    </div>
  );
}

// ─── GLASS MODAL ──────────────────────────────────────────────────────────
export function GlassModal({ open, onClose, title, titleAr, children, width=560 }: {
  open:boolean; onClose:()=>void; title:string; titleAr:string; children:React.ReactNode; width?:number;
}) {
  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(15,35,71,0.72)', backdropFilter:'blur(8px)' }}/>
      <motion.div initial={{opacity:0,scale:0.93,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.93,y:20}} transition={{type:'spring',damping:26,stiffness:320}}
        style={{ position:'relative', width, maxWidth:'90vw', maxHeight:'88vh', background:'rgba(15,35,71,0.94)', backdropFilter:'blur(16px)', border:`1px solid ${COLORS.gold}40`, borderRadius:'16px', overflow:'hidden', boxShadow:`0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px ${COLORS.gold}18`, display:'flex', flexDirection:'column' }}>
        <div style={{ position:'relative', padding:'20px 24px 16px', borderBottom:`1px solid ${COLORS.gold}22`, overflow:'hidden' }}>
          <ArabesquePattern id="glass-modal-arb" color={COLORS.gold} opacity={0.04}/>
          <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:'Amiri,serif', fontSize:'22px', color:COLORS.gold, fontWeight:700 }}>{titleAr}</div>
              <div style={{ fontFamily:'Inter,sans-serif', fontSize:'12px', color:COLORS.goldLight, marginTop:'2px' }}>{title}</div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.07)', border:`1px solid ${COLORS.gold}28`, borderRadius:'8px', padding:'7px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <X size={15} color={COLORS.goldLight}/>
            </button>
          </div>
        </div>
        <div style={{ padding:'20px 24px', overflowY:'auto', flex:1 }}>{children}</div>
      </motion.div>
    </div>
  );
}

// ─── WAX SEAL BUTTON ─────────────────────────────────────────────────────
export function WaxSealButton({ children, onClick, variant='gold' }: {
  children:React.ReactNode; onClick?:()=>void; variant?:'gold'|'lapis'|'red';
}) {
  const [pressing,setPressing] = useState(false);
  const [stamped,setStamped]   = useState(false);
  const bg = { gold:`linear-gradient(135deg,${COLORS.gold},#B8960A)`, lapis:`linear-gradient(135deg,${COLORS.lapis},${COLORS.darkLapis})`, red:`linear-gradient(135deg,${COLORS.bloodRed},#6B0000)` }[variant];
  const handle = () => {
    if (pressing||stamped) return;
    setPressing(true);
    setTimeout(()=>{ setPressing(false); setStamped(true); onClick?.(); setTimeout(()=>setStamped(false),1600); },380);
  };
  return (
    <motion.button onClick={handle}
      animate={{ scale:pressing?0.91:1, y:pressing?4:0 }}
      transition={{ type:'spring', stiffness:420, damping:22 }}
      style={{ background:stamped?`linear-gradient(135deg,${COLORS.sealGreen},#1B3A0F)`:bg, border:'none', borderRadius:'8px', padding:'12px 28px', color:'white', fontFamily:'Amiri,serif', fontSize:'16px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'10px', boxShadow:pressing?'0 1px 4px rgba(0,0,0,0.3)':'0 4px 16px rgba(0,0,0,0.2)', transition:'background 0.3s ease, box-shadow 0.2s ease' }}>
      {stamped && <Check size={18}/>}
      {stamped ? 'تم ✓' : children}
    </motion.button>
  );
}

// ─── FINE METER ───────────────────────────────────────────────────────────
export function FineMeter({ borrowedDays, overdueDays, fineAmount, currency='ر.س' }: {
  borrowedDays:number; overdueDays:number; fineAmount:number; currency?:string;
}) {
  const maxDays = Math.max(borrowedDays, 30);
  const outerR=58, innerR=44;
  const oC=2*Math.PI*outerR, iC=2*Math.PI*innerR;
  const oOff=oC*(1-Math.min(borrowedDays/maxDays,1));
  const iOff=iC*(1-Math.min(overdueDays/maxDays,1));
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
      <div style={{ position:'relative', width:'155px', height:'155px' }}>
        <svg width="155" height="155" viewBox="0 0 155 155">
          <circle cx="77.5" cy="77.5" r={outerR} fill="none" stroke={COLORS.sage} strokeWidth="9"/>
          <circle cx="77.5" cy="77.5" r={innerR} fill="none" stroke={COLORS.sage} strokeWidth="7"/>
          <circle cx="77.5" cy="77.5" r={outerR} fill="none" stroke={COLORS.gold} strokeWidth="9" strokeLinecap="round" strokeDasharray={oC} strokeDashoffset={oOff} transform="rotate(-90 77.5 77.5)" style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
          <circle cx="77.5" cy="77.5" r={innerR} fill="none" stroke={overdueDays>0?COLORS.terracotta:COLORS.sage} strokeWidth="7" strokeLinecap="round" strokeDasharray={iC} strokeDashoffset={iOff} transform="rotate(-90 77.5 77.5)" style={{ transition:'stroke-dashoffset 1.2s ease' }}/>
          <circle cx="77.5" cy="77.5" r={outerR+8} fill="none" stroke={COLORS.goldLight} strokeWidth="0.6"/>
          {Array.from({length:12},(_,i)=>{const a=(i*Math.PI*2)/12-Math.PI/2;return<line key={i} x1={(77.5+(outerR+1)*Math.cos(a)).toFixed(2)} y1={(77.5+(outerR+1)*Math.sin(a)).toFixed(2)} x2={(77.5+(outerR+8)*Math.cos(a)).toFixed(2)} y2={(77.5+(outerR+8)*Math.sin(a)).toFixed(2)} stroke={COLORS.goldLight} strokeWidth="1"/>})}
          <circle cx="77.5" cy="77.5" r="28" fill={COLORS.darkLapis} opacity="0.96"/>
          <circle cx="77.5" cy="77.5" r="25" fill="none" stroke={COLORS.gold} strokeWidth="0.5"/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          {fineAmount===0 ? (
            <svg width="30" height="30" viewBox="0 0 30 30">
              <path d={waxSealPath(15,15,13)} fill={COLORS.gold}/>
              <path d="M9,15 L13,19 L21,11" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : <>
            <span style={{ fontFamily:'JetBrains Mono,monospace', fontSize:'15px', color:COLORS.gold, fontWeight:600, lineHeight:1 }}>{fineAmount}</span>
            <span style={{ fontFamily:'Amiri,serif', fontSize:'10px', color:COLORS.goldLight }}>{currency}</span>
          </>}
        </div>
      </div>
      {fineAmount===0 && <div style={{ textAlign:'center' }}>
        <div style={{ fontFamily:'Amiri,serif', fontSize:'18px', color:COLORS.gold }}>في الوقت المحدد</div>
        <div style={{ fontFamily:'Inter,sans-serif', fontSize:'12px', color:COLORS.goldLight }}>Returned on time</div>
      </div>}
      {fineAmount>0 && <div style={{ fontFamily:'Inter,sans-serif', fontSize:'12px', color:COLORS.goldLight, textAlign:'center' }}>
        {overdueDays} days overdue · Fine: {fineAmount} {currency}
      </div>}
    </div>
  );
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────
export function StepIndicator({ steps, current }: { steps:{labelAr:string;labelEn:string}[]; current:number }) {
  const s = starPath(10,10,8,3.5);
  return (
    <div style={{ display:'flex', alignItems:'center', marginBottom:'32px' }}>
      {steps.map((step,i) => {
        const done=i<current, active=i===current;
        return (
          <React.Fragment key={i}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path d={s} fill={done||active?COLORS.gold:'transparent'} stroke={done||active?COLORS.gold:COLORS.goldLight} strokeWidth="1"/>
                {done && <path d="M5,10 L8,13 L15,7" stroke="white" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>}
              </svg>
              <div style={{ textAlign:'center' }}>
                <div style={{ fontFamily:'Amiri,serif', fontSize:'12px', color:active?COLORS.gold:done?COLORS.goldLight:'#717182', fontWeight:active?700:400 }}>{step.labelAr}</div>
                <div style={{ fontFamily:'Inter,sans-serif', fontSize:'9px', color:'#717182' }}>{step.labelEn}</div>
              </div>
            </div>
            {i<steps.length-1 && <div style={{ flex:1, height:'2px', marginBottom:'24px', background:i<current?COLORS.gold:`repeating-linear-gradient(90deg,${COLORS.goldLight} 0px,${COLORS.goldLight} 4px,transparent 4px,transparent 9px)`, transition:'background 0.3s ease' }}/>}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── ARABESQUE HEADER (section heading with calligraphy watermark) ─────────
export function ArabesqueHeader({ titleAr, titleEn, action }: { titleAr:string; titleEn?:string; action?:React.ReactNode }) {
  return (
    <div style={{ position:'relative', marginBottom:'24px' }}>
      <div style={{ position:'absolute', top:'-55%', left:'-8px', fontFamily:'Amiri,serif', fontSize:'110px', color:COLORS.lapis, opacity:0.03, fontWeight:700, whiteSpace:'nowrap', pointerEvents:'none', userSelect:'none', lineHeight:1 }}>
        {titleAr}
      </div>
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', position:'relative' }}>
        <div>
          <h1 style={{ fontFamily:'Amiri,serif', fontSize:'26px', color:COLORS.darkLapis, fontWeight:700, margin:0, lineHeight:1.2 }}>{titleAr}</h1>
          {titleEn && titleEn !== titleAr && <p style={{ fontFamily:'Inter,sans-serif', fontSize:'13px', color:'#717182', margin:'3px 0 0' }}>{titleEn}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <StarDivider/>
    </div>
  );
}

// ─── LAPIS SHIMMER SKELETON ───────────────────────────────────────────────
export function LapisShimmer({ width='100%', height=80, rounded=8 }: { width?:string|number; height?:number; rounded?:number }) {
  return (
    <div style={{ width, height, borderRadius:rounded, background:`linear-gradient(90deg,${COLORS.lapis}22,${COLORS.lapis}44,${COLORS.lapis}22)`, backgroundSize:'200% 100%', animation:'lapis-shimmer 1.5s infinite' }}/>
  );
}

// ─── GOLD UNDERLINE INPUT ─────────────────────────────────────────────────
export function GoldInput({ label, labelAr, type='text', value, onChange, placeholder, dark=false }: {
  label:string; labelAr:string; type?:string; value:string; onChange:(v:string)=>void; placeholder?:string; dark?:boolean;
}) {
  const [foc, setFoc] = useState(false);
  const textColor = dark ? 'rgba(255,255,255,0.9)' : COLORS.darkLapis;
  const labelColor = dark ? COLORS.goldLight : '#717182';
  const borderColor = foc ? COLORS.gold : (dark ? `${COLORS.gold}50` : COLORS.goldLight);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
      <label style={{ fontFamily:'Inter,sans-serif', fontSize:'11px', color:labelColor }}>
        {labelAr === label ? label : <><span style={{ fontFamily:'Amiri,serif' }}>{labelAr}</span> · {label}</>}
      </label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
        style={{ border:'none', borderBottom:`1.8px solid ${borderColor}`, background:'transparent', padding:'8px 2px', fontFamily:'Inter,sans-serif', fontSize:'14px', color:textColor, outline:'none', transition:'border-color 0.2s ease', width:'100%' }}/>
    </div>
  );
}
