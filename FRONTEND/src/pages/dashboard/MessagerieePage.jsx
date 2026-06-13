// ═══════════════════════════════════════════════════════════
//  MessagerieePage.jsx — v3.1 FINAL
//  SPA dark/light conservé + bouton SVG sun/moon animé
//  Stack : React + Pusher + JWT + Axios
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import Pusher from 'pusher-js';

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY || '';
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'eu';

/* ══════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

.ch-wrap *, .ch-wrap *::before, .ch-wrap *::after {
  box-sizing:border-box; margin:0; padding:0;
}

/* ── Dark (défaut) ── */
.ch-wrap {
  --bg:       #0d0d1a;
  --sidebar:  #111128;
  --surface:  #1a1a35;
  --input-bg: #151530;
  --recv:     #1e1e3d;
  --hover:    rgba(124,111,247,.08);
  --active:   rgba(124,111,247,.16);
  --border:   rgba(255,255,255,.06);
  --focus:    #7c6ff7;
  --accent:   #7c6ff7;
  --accent2:  #4da6ff;
  --grad:     linear-gradient(135deg,#7c6ff7,#4da6ff);
  --text:     #e8e8f8;
  --text2:    #8888aa;
  --text3:    #44445a;
  --online:   #22d27f;
  --danger:   #ef4444;
  --sh-sm:    0 2px 8px rgba(0,0,0,.3);
  --sh-md:    0 4px 20px rgba(0,0,0,.4);
  --sh-lg:    0 8px 40px rgba(0,0,0,.5);
  --sh-acc:   0 4px 16px rgba(124,111,247,.4);
  --r-sm:8px; --r-md:14px; --r-lg:22px; --r-full:999px;
  display:flex;
  height:calc(100vh - 60px);
  font-family:'Inter',system-ui,sans-serif;
  background:var(--bg);
  border-radius:16px;
  overflow:hidden;
  box-shadow:var(--sh-lg);
  position:relative;
}

/* ── Light ── */
.ch-wrap.light {
  --bg:       #f0f2ff;
  --sidebar:  #ffffff;
  --surface:  #f8f9ff;
  --input-bg: #eef0fb;
  --recv:     #ffffff;
  --hover:    rgba(108,99,255,.05);
  --active:   rgba(108,99,255,.1);
  --border:   rgba(0,0,0,.07);
  --focus:    #6c63ff;
  --accent:   #6c63ff;
  --accent2:  #4a9eff;
  --grad:     linear-gradient(135deg,#6c63ff,#4a9eff);
  --text:     #1a1a35;
  --text2:    #7070a0;
  --text3:    #b0b0cc;
  --online:   #22c55e;
  --sh-sm:    0 2px 8px rgba(0,0,0,.06);
  --sh-md:    0 4px 20px rgba(0,0,0,.08);
  --sh-lg:    0 8px 40px rgba(0,0,0,.1);
  --sh-acc:   0 4px 16px rgba(108,99,255,.3);
}

/* ════ BOUTON THEME SVG ANIMÉ ════ */
.ch-theme-btn {
  width:36px; height:36px; border-radius:var(--r-sm);
  background:var(--input-bg); border:1.5px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:border-color .2s, background .2s, box-shadow .2s;
  position:relative; overflow:hidden; flex-shrink:0;
}
.ch-theme-btn:hover {
  border-color:var(--accent);
  background:var(--hover);
  box-shadow:0 0 14px rgba(124,111,247,.3);
}
.ch-theme-btn .t-icon {
  position:absolute;
  transition:transform .4s cubic-bezier(.34,1.56,.64,1), opacity .3s ease;
  display:flex; align-items:center; justify-content:center;
}
/* Dark mode : soleil visible, lune cachée */
.ch-theme-btn .t-sun  { transform:rotate(0deg) scale(1);  opacity:1; }
.ch-theme-btn .t-moon { transform:rotate(90deg) scale(0); opacity:0; }
/* Light mode : lune visible, soleil caché */
.ch-wrap.light .ch-theme-btn .t-sun  { transform:rotate(-90deg) scale(0); opacity:0; }
.ch-wrap.light .ch-theme-btn .t-moon { transform:rotate(0deg) scale(1);   opacity:1; }

/* ════ SIDEBAR ════ */
.ch-sb {
  width:300px; flex-shrink:0;
  background:var(--sidebar);
  border-right:1px solid var(--border);
  display:flex; flex-direction:column; overflow:hidden;
  transition:transform .25s ease; z-index:10;
}
.ch-sb-head {
  padding:1rem 1rem .85rem;
  border-bottom:1px solid var(--border);
  display:flex; align-items:center; justify-content:space-between; gap:.5rem;
}
.ch-sb-title {
  font-weight:800; font-size:1rem; color:var(--text);
  display:flex; align-items:center; gap:.45rem; letter-spacing:-.02em;
}
.ch-sb-acts { display:flex; align-items:center; gap:.4rem; }

/* ── Icon button générique ── */
.ch-ib {
  width:32px; height:32px; border-radius:var(--r-sm);
  background:transparent; border:1px solid var(--border);
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--text2); transition:all .15s; flex-shrink:0;
}
.ch-ib:hover  { background:var(--hover); color:var(--accent); border-color:var(--accent); }
.ch-ib.on     { background:var(--active); color:var(--accent); border-color:var(--accent); }
.ch-ib:disabled { opacity:.35; cursor:not-allowed; }

/* ── Search ── */
.ch-search-wrap { padding:.6rem .85rem; border-bottom:1px solid var(--border); }
.ch-search-rel  { position:relative; }
.ch-search {
  width:100%; padding:.48rem .85rem .48rem 2.1rem;
  background:var(--input-bg); border:1.5px solid var(--border);
  border-radius:var(--r-full); font-family:inherit; font-size:.8rem;
  color:var(--text); outline:none; transition:border-color .15s,box-shadow .15s;
}
.ch-search:focus { border-color:var(--focus); box-shadow:0 0 0 3px rgba(124,111,247,.1); }
.ch-search::placeholder { color:var(--text3); }
.ch-si { position:absolute; left:.7rem; top:50%; transform:translateY(-50%); color:var(--text3); pointer-events:none; }

/* ── Filter tabs ── */
.ch-filters { display:flex; gap:.35rem; padding:.55rem .85rem; border-bottom:1px solid var(--border); }
.ch-ftab {
  padding:.28rem .72rem; border-radius:var(--r-full); font-size:.74rem; font-weight:600;
  border:1.5px solid var(--border); background:transparent; color:var(--text2);
  cursor:pointer; transition:all .15s; font-family:inherit; white-space:nowrap;
}
.ch-ftab:hover { border-color:var(--accent); color:var(--accent); background:var(--hover); }
.ch-ftab.act   { background:var(--active); border-color:var(--accent); color:var(--accent); }

/* ── Section label ── */
.ch-lbl { padding:.5rem .85rem .28rem; font-size:.64rem; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.1em; }

/* ── Favorites ── */
.ch-fav { padding:.4rem .85rem .65rem; border-bottom:1px solid var(--border); }
.ch-fav-row { display:flex; gap:.55rem; overflow-x:auto; padding:.15rem 0; scrollbar-width:none; }
.ch-fav-row::-webkit-scrollbar { display:none; }
.ch-fav-it { display:flex; flex-direction:column; align-items:center; gap:.22rem; flex-shrink:0; cursor:pointer; }
.ch-fav-ring { width:46px; height:46px; border-radius:50%; padding:2px; background:var(--grad); transition:transform .15s,box-shadow .15s; box-shadow:0 2px 8px rgba(124,111,247,.25); }
.ch-fav-ring:hover { transform:scale(1.08); box-shadow:0 4px 14px rgba(124,111,247,.45); }
.ch-fav-in { width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:.68rem; color:#fff; overflow:hidden; background:var(--sidebar); }
.ch-fav-in img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.ch-fav-nm { font-size:.6rem; color:var(--text2); max-width:48px; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }

/* ── Dropdown ── */
.ch-dd-wrap { padding:.4rem .85rem .55rem; border-bottom:1px solid var(--border); }
.ch-dd {
  width:100%; padding:.5rem 2rem .5rem .75rem;
  background:var(--input-bg); border:1.5px solid var(--border);
  border-radius:var(--r-md); font-family:inherit; font-size:.8rem;
  color:var(--text); outline:none; cursor:pointer; transition:border-color .15s;
  appearance:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238888aa' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat:no-repeat; background-position:right .65rem center; background-color:var(--input-bg);
}
.ch-dd:focus { border-color:var(--focus); }
.ch-dd option { background:var(--sidebar); color:var(--text); }

/* ── Conversation list ── */
.ch-conv-list { flex:1; overflow-y:auto; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
.ch-conv-list::-webkit-scrollbar { width:3px; }
.ch-conv-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
.ch-conv-it { display:flex; align-items:center; gap:.75rem; padding:.7rem .85rem; cursor:pointer; border-bottom:1px solid var(--border); transition:background .12s; position:relative; }
.ch-conv-it:hover { background:var(--hover); }
.ch-conv-it.act   { background:var(--active); }
.ch-conv-it.act::before { content:''; position:absolute; left:0; top:20%; bottom:20%; width:3px; background:var(--accent); border-radius:0 3px 3px 0; }
.ch-conv-info { flex:1; min-width:0; }
.ch-conv-r1 { display:flex; align-items:center; justify-content:space-between; margin-bottom:.15rem; }
.ch-conv-name { font-weight:600; font-size:.84rem; color:var(--text); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:145px; }
.ch-conv-time { font-size:.63rem; color:var(--text3); flex-shrink:0; }
.ch-conv-r2   { display:flex; align-items:center; justify-content:space-between; }
.ch-conv-prev { font-size:.73rem; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
.ch-conv-prev.bold { color:var(--text); font-weight:600; }
.ch-badge { background:var(--accent); color:#fff; border-radius:var(--r-full); font-size:.6rem; font-weight:700; padding:.1rem .42rem; min-width:18px; text-align:center; flex-shrink:0; margin-left:.3rem; }

/* ── Encadrant card ── */
.ch-enc-card { margin:.65rem .85rem; padding:.8rem; background:linear-gradient(135deg,rgba(124,111,247,.12),rgba(77,166,255,.08)); border-radius:var(--r-md); border:1px solid rgba(124,111,247,.2); display:flex; align-items:center; gap:.7rem; }
.ch-sb-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:2rem; color:var(--text3); text-align:center; gap:.5rem; }

/* ════ AVATAR ════ */
.ch-av { border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; position:relative; overflow:hidden; }
.ch-av img { width:100%; height:100%; object-fit:cover; border-radius:50%; }
.ch-av.on::after  { content:''; position:absolute; bottom:1px; right:1px; width:10px; height:10px; border-radius:50%; background:var(--online); border:2px solid var(--sidebar); }
.ch-av.on2::after { border-color:var(--surface); }

/* ════ CHAT AREA ════ */
.ch-chat { flex:1; display:flex; flex-direction:column; overflow:hidden; background:var(--bg); position:relative; }

/* ── Chat header ── */
.ch-head { padding:.75rem 1.2rem; background:var(--surface); border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; flex-shrink:0; gap:.5rem; }
.ch-head-user { display:flex; align-items:center; gap:.75rem; flex:1; min-width:0; }
.ch-head-name { font-weight:700; font-size:.92rem; color:var(--text); letter-spacing:-.01em; }
.ch-head-meta { display:flex; align-items:center; gap:.35rem; margin-top:.04rem; flex-wrap:wrap; }
.ch-head-role { font-size:.7rem; color:var(--accent); font-weight:600; }
.ch-head-subj { font-size:.64rem; color:var(--text2); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:200px; }
.ch-head-acts { display:flex; align-items:center; gap:.35rem; flex-shrink:0; }
.ch-online-pill { display:flex; align-items:center; gap:.28rem; background:rgba(34,210,127,.1); border:1px solid rgba(34,210,127,.25); border-radius:var(--r-full); padding:.18rem .55rem; font-size:.67rem; color:var(--online); font-weight:600; }
.ch-online-dot { width:6px; height:6px; border-radius:50%; background:var(--online); box-shadow:0 0 5px var(--online); animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;}50%{opacity:.4;} }

/* ── Message search bar ── */
.ch-msg-search { padding:.5rem 1.2rem; background:var(--surface); border-bottom:1px solid var(--border); display:flex; align-items:center; gap:.5rem; flex-shrink:0; animation:slideDown .15s ease; }
@keyframes slideDown { from{opacity:0;transform:translateY(-6px);}to{opacity:1;transform:translateY(0);} }
.ch-msg-search input { flex:1; padding:.4rem .75rem; background:var(--input-bg); border:1.5px solid var(--border); border-radius:var(--r-full); font-family:inherit; font-size:.8rem; color:var(--text); outline:none; transition:border-color .15s; }
.ch-msg-search input:focus { border-color:var(--focus); }
.ch-msg-search input::placeholder { color:var(--text3); }
.ch-search-count { font-size:.72rem; color:var(--text2); white-space:nowrap; }

/* ════ MESSAGES ════ */
.ch-msgs { flex:1; overflow-y:auto; padding:1rem 1.2rem; display:flex; flex-direction:column; gap:.3rem; background:var(--bg); position:relative; scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
.ch-msgs::-webkit-scrollbar { width:3px; }
.ch-msgs::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }

/* ── Drag overlay ── */
.ch-drag-ov { position:absolute; inset:0; background:rgba(124,111,247,.1); backdrop-filter:blur(4px); border:3px dashed var(--accent); border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:.65rem; z-index:50; animation:fadeIn .15s ease; }
.ch-drag-ov-title { font-size:1rem; font-weight:700; color:var(--accent); }
.ch-drag-ov-sub   { font-size:.78rem; color:var(--text2); }

/* ── Date separator ── */
.ch-date-sep { display:flex; align-items:center; gap:.65rem; margin:.6rem 0 .35rem; }
.ch-date-sep::before,.ch-date-sep::after { content:''; flex:1; height:1px; background:var(--border); }
.ch-date-sep span { font-size:.63rem; color:var(--text3); font-weight:600; background:var(--surface); padding:.2rem .7rem; border-radius:var(--r-full); white-space:nowrap; text-transform:uppercase; letter-spacing:.06em; border:1px solid var(--border); }

/* ── Rows ── */
.ch-row { display:flex; align-items:flex-end; gap:.45rem; }
.ch-row.sent { flex-direction:row-reverse; }

/* ── Bubbles ── */
.ch-bub { max-width:60%; word-break:break-word; line-height:1.6; font-size:.84rem; position:relative; transition:transform .1s; }
.ch-bub:active { transform:scale(.98); }
.ch-row.sent .ch-bub { background:var(--grad); color:#fff; border-radius:20px 20px 5px 20px; padding:.6rem .95rem; box-shadow:var(--sh-acc); }
.ch-row.recv .ch-bub { background:var(--recv); color:var(--text); border-radius:20px 20px 20px 5px; padding:.6rem .95rem; border:1px solid var(--border); box-shadow:var(--sh-sm); }
.ch-bub-meta { font-size:.6rem; margin-top:.25rem; display:flex; align-items:center; gap:.2rem; }
.ch-row.sent .ch-bub-meta { color:rgba(255,255,255,.52); justify-content:flex-end; }
.ch-row.recv .ch-bub-meta { color:var(--text3); }

/* ── Attachment chip ── */
.ch-att { display:flex; align-items:center; gap:.35rem; background:rgba(255,255,255,.12); border-radius:var(--r-sm); padding:.32rem .55rem; margin-top:.32rem; font-size:.73rem; cursor:default; }
.ch-row.recv .ch-att { background:var(--hover); }

/* ── Highlight ── */
.ch-hl { background:rgba(255,220,0,.35); border-radius:3px; padding:0 1px; }

/* ── Typing ── */
.ch-typing { display:flex; align-items:flex-end; gap:.45rem; margin-top:.1rem; }
.ch-typing-bub { background:var(--recv); border:1px solid var(--border); border-radius:20px 20px 20px 5px; padding:.65rem 1rem; display:flex; align-items:center; gap:3px; }
@keyframes tdot { 0%,80%,100%{transform:translateY(0);opacity:.4;}40%{transform:translateY(-4px);opacity:1;} }
.tdot { width:7px; height:7px; border-radius:50%; background:var(--accent); animation:tdot 1.4s infinite; }
.tdot:nth-child(2){animation-delay:.15s;}.tdot:nth-child(3){animation-delay:.3s;}

/* ── Scroll btn ── */
.ch-scroll-btn { position:absolute; bottom:1rem; right:1.4rem; width:36px; height:36px; border-radius:50%; background:var(--grad); border:none; color:white; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:var(--sh-acc); transition:transform .15s; z-index:20; }
.ch-scroll-btn:hover { transform:scale(1.08); }

/* ════ FILE PREVIEW ════ */
.ch-fprev { padding:.5rem 1.2rem; background:var(--surface); border-top:1px solid var(--border); display:flex; align-items:center; gap:.55rem; flex-wrap:wrap; flex-shrink:0; }
.ch-fchip { display:flex; align-items:center; gap:.38rem; background:var(--active); border:1px solid rgba(124,111,247,.3); border-radius:var(--r-sm); padding:.28rem .55rem; font-size:.72rem; color:var(--accent); font-weight:600; }
.ch-fthumb { width:34px; height:34px; border-radius:5px; object-fit:cover; flex-shrink:0; }
.ch-frm { background:none; border:none; cursor:pointer; color:var(--accent); font-size:.75rem; line-height:1; opacity:.6; transition:opacity .12s; padding:0 .05rem; }
.ch-frm:hover { opacity:1; }

/* ════ INPUT AREA ════ */
.ch-input-area { padding:.75rem 1.1rem; background:var(--surface); border-top:1px solid var(--border); display:flex; align-items:flex-end; gap:.5rem; flex-shrink:0; }
.ch-input-wrap { flex:1; display:flex; align-items:flex-end; gap:.4rem; background:var(--input-bg); border:1.5px solid var(--border); border-radius:var(--r-lg); padding:.5rem .65rem; transition:border-color .15s,box-shadow .15s; }
.ch-input-wrap:focus-within { border-color:var(--focus); box-shadow:0 0 0 3px rgba(124,111,247,.1); }
.ch-input { flex:1; border:none; background:transparent; font-family:inherit; font-size:.84rem; color:var(--text); outline:none; resize:none; max-height:100px; line-height:1.55; min-height:22px; scrollbar-width:none; }
.ch-input::-webkit-scrollbar { display:none; }
.ch-input::placeholder { color:var(--text3); }
.ch-inp-btn { background:none; border:none; cursor:pointer; color:var(--text3); display:flex; align-items:center; padding:.15rem; transition:color .14s,transform .14s; flex-shrink:0; line-height:1; }
.ch-inp-btn:hover { color:var(--accent); transform:scale(1.1); }
.ch-inp-btn.on { color:var(--accent); }
.ch-send { width:42px; height:42px; border-radius:50%; background:var(--grad); border:none; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; transition:transform .18s,box-shadow .18s; box-shadow:var(--sh-acc); }
.ch-send:hover { transform:scale(1.08) rotate(-5deg); }
.ch-send:disabled { opacity:.32; cursor:not-allowed; transform:none; box-shadow:none; background:var(--text3); }

/* ── Emoji picker ── */
.ch-emoji-wrap { position:relative; flex-shrink:0; }
.ch-emoji-picker { position:absolute; bottom:calc(100% + 12px); right:0; background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:.6rem; box-shadow:var(--sh-lg); display:grid; grid-template-columns:repeat(8,1fr); gap:2px; width:284px; z-index:100; animation:fadeUp .15s ease; }
@keyframes fadeUp { from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);} }
.ch-emoji-picker button { background:none; border:none; cursor:pointer; font-size:1.22rem; padding:.28rem; border-radius:var(--r-sm); transition:background .1s; line-height:1; }
.ch-emoji-picker button:hover { background:var(--hover); }
.ch-emoji-lbl { grid-column:1/-1; font-size:.63rem; font-weight:700; color:var(--text3); text-transform:uppercase; letter-spacing:.08em; padding:.1rem .1rem .35rem; }

/* ════ TOAST ════ */
.ch-toast { position:fixed; bottom:1.5rem; left:50%; transform:translateX(-50%); background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); padding:.55rem 1.1rem; font-size:.8rem; color:var(--text); font-weight:500; box-shadow:var(--sh-md); z-index:999; animation:toastIn .2s ease; pointer-events:none; white-space:nowrap; }
@keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);} }

/* ════ EMPTY / LOADING ════ */
.ch-empty { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; background:var(--bg); text-align:center; padding:2rem; gap:.6rem; }
.ch-empty-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,rgba(124,111,247,.15),rgba(77,166,255,.1)); display:flex; align-items:center; justify-content:center; font-size:2rem; margin-bottom:.5rem; border:1px solid rgba(124,111,247,.2); }
.ch-empty-title { font-weight:700; color:var(--text); font-size:1rem; }
.ch-empty-sub   { font-size:.8rem; color:var(--text2); max-width:240px; line-height:1.65; }
@keyframes spin { to{transform:rotate(360deg);} }
.ch-spinner { width:36px; height:36px; border-radius:50%; border:3px solid rgba(124,111,247,.2); border-top-color:var(--accent); animation:spin .9s linear infinite; }
.ch-err { background:rgba(239,68,68,.1); border:1px solid rgba(239,68,68,.25); color:#fca5a5; padding:.55rem .85rem; border-radius:var(--r-sm); font-size:.78rem; display:flex; align-items:center; gap:.4rem; }

/* ── Animations ── */
@keyframes fadeIn { from{opacity:0;}to{opacity:1;} }
@keyframes msgIn  { from{opacity:0;transform:translateY(8px) scale(.97);}to{opacity:1;transform:translateY(0) scale(1);} }
.ch-new { animation:msgIn .22s cubic-bezier(.34,1.56,.64,1); }

/* ── Context menu ── */
.ch-ctx { position:fixed; background:var(--surface); border:1px solid var(--border); border-radius:var(--r-md); box-shadow:var(--sh-lg); z-index:200; overflow:hidden; animation:fadeIn .12s ease; min-width:150px; }
.ch-ctx-btn { display:flex; align-items:center; gap:.5rem; padding:.55rem .85rem; font-size:.8rem; color:var(--text); cursor:pointer; transition:background .1s; border:none; background:none; width:100%; text-align:left; font-family:inherit; font-weight:500; }
.ch-ctx-btn:hover { background:var(--hover); color:var(--accent); }
.ch-ctx-sep { height:1px; background:var(--border); margin:.2rem 0; }
.ch-ctx-btn.danger { color:var(--danger); }
.ch-ctx-btn.danger:hover { background:rgba(239,68,68,.08); }

/* ── Mobile ── */
.ch-mob-ov { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:9; backdrop-filter:blur(2px); }
@media (max-width:768px) {
  .ch-sb { position:absolute; top:0; left:0; bottom:0; transform:translateX(-100%); }
  .ch-sb.open { transform:translateX(0); box-shadow:var(--sh-lg); }
  .ch-mob-ov.vis { display:block; }
  .ch-mob-btn { display:flex !important; }
  .ch-bub { max-width:80%; }
}
@media (max-width:480px) {
  .ch-sb { width:85%; max-width:300px; }
  .ch-msgs { padding:.75rem; }
  .ch-input-area { padding:.6rem .75rem; }
}
.ch-mob-btn { display:none; }
`;

/* ══════════════════════════════════════════════════════════
   BOUTON THEME SVG ANIMÉ — Soleil ☀️ / Lune 🌙
══════════════════════════════════════════════════════════ */
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      className="ch-theme-btn"
      onClick={onToggle}
      title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label="Basculer le thème"
    >
      {/* ☀️ Soleil — affiché en dark mode */}
      <span className="t-icon t-sun">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" fill="#f59e0b" fillOpacity=".15" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </span>

      {/* 🌙 Lune — affichée en light mode */}
      <span className="t-icon t-moon">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6c63ff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
            fill="#6c63ff"
            fillOpacity=".12"
          />
        </svg>
      </span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   ICÔNES SVG INLINE
══════════════════════════════════════════════════════════ */
const Ico = {
  chat: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  search: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  refresh: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  ),
  menu: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  close: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  attach: (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  ),
  send: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  down: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  copy: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  trash: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  archive: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  ),
  info: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  newconv: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  upload: (
    <svg
      width="30"
      height="30"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  clock: (
    <svg
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function initiales(u) {
  return `${u?.prenom?.[0] || ''}${u?.nom?.[0] || ''}`.toUpperCase() || '?';
}
const PAL = [
  '#7c6ff7',
  '#4da6ff',
  '#059669',
  '#d97706',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f43f5e',
];
function aColor(id) {
  let h = 0,
    s = String(id || '');
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return PAL[Math.abs(h) % PAL.length];
}

function Av({ user, size = 42, online = false, cls = '' }) {
  return (
    <div
      className={`ch-av ${online ? 'on' : ''} ${cls}`}
      style={{
        width: size,
        height: size,
        background: aColor(user?._id || user?.userId),
        fontSize: size * 0.28,
      }}
    >
      {user?.image ? <img src={user.image} alt="" /> : initiales(user)}
    </div>
  );
}

function fTime(d) {
  if (!d) return '';
  return new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}
function fDate(d) {
  if (!d) return '';
  const dt = new Date(d),
    now = new Date();
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return 'Hier';
  return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}
function fConvTime(d) {
  if (!d) return '';
  const dt = new Date(d),
    now = new Date();
  const diff = Math.floor((now - dt) / 86400000);
  if (diff === 0) return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 1) return 'Hier';
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}
function parseContent(contenu) {
  if (!contenu) return { text: '', attachments: [] };
  const idx = contenu.indexOf('\n📎 ');
  if (idx === -1) return { text: contenu, attachments: [] };
  return {
    text: contenu.slice(0, idx),
    attachments: contenu
      .slice(idx + 4)
      .split(', ')
      .filter(Boolean),
  };
}
function fIcoFromName(name) {
  const ext = (name || '').split('.').pop().toLowerCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📄';
  if (['doc', 'docx'].includes(ext)) return '📝';
  if (['zip', 'rar', '7z'].includes(ext)) return '🗜️';
  return '📎';
}
function Highlighted({ text, query }) {
  if (!query || !text) return <>{text}</>;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return (
    <>
      {text.split(re).map((p, i) =>
        re.test(p) ? (
          <mark key={i} className="ch-hl">
            {p}
          </mark>
        ) : (
          p
        )
      )}
    </>
  );
}

const EMOJIS = [
  '😀',
  '😊',
  '😂',
  '🥰',
  '😍',
  '🤔',
  '😎',
  '🤓',
  '😅',
  '🙄',
  '😢',
  '😡',
  '👍',
  '👎',
  '🙏',
  '🎉',
  '🔥',
  '💡',
  '✅',
  '❌',
  '⚠️',
  '📎',
  '📝',
  '📅',
  '🎓',
  '👨‍🏫',
  '💬',
  '🕐',
  '📌',
  '🔔',
  '💪',
  '🙌',
  '👏',
  '🤝',
  '✨',
  '🚀',
  '❤️',
  '💙',
  '💜',
  '🌟',
  '🏆',
  '💯',
  '🙂',
  '😏',
  '🤗',
  '😴',
  '🤯',
  '👋',
];

/* ══════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function MessagerieePage() {
  const { user } = useAuth();
  const role = user?.role;

  const [conversations, setConversations] = useState([]);
  const [convSelected, setConvSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [texte, setTexte] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('tous');
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mesEtudiants, setMesEtudiants] = useState([]);
  const [etudiantSelId, setEtudiantSelId] = useState('');
  const [monEncadrant, setMonEncadrant] = useState(null);
  const [monProjet, setMonProjet] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [fichiers, setFichiers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isDark, setIsDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [msgSearch, setMsgSearch] = useState('');
  const [ctxMenu, setCtxMenu] = useState(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [toast, setToast] = useState('');

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const fileRef = useRef(null);
  const emojiRef = useRef(null);
  const msgsRef = useRef(null);
  const searchRef = useRef(null);
  const toastRef = useRef(null);

  /* ── Toast ── */
  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(''), 2500);
  }, []);

  /* ── Fermer emoji hors clic ── */
  useEffect(() => {
    const h = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) setShowEmoji(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  /* ── Fermer ctx menu ── */
  useEffect(() => {
    const h = () => setCtxMenu(null);
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  /* ── Focus search ── */
  useEffect(() => {
    if (showSearch) searchRef.current?.focus();
  }, [showSearch]);

  /* ── Auto-resize textarea ── */
  useEffect(() => {
    const ta = inputRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  }, [texte]);

  /* ── Scroll button ── */
  const handleScroll = useCallback(() => {
    const el = msgsRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 180);
  }, []);
  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: 'smooth' });

  /* ── Pusher ── */
  useEffect(() => {
    if (!user?._id || !PUSHER_KEY) return;
    const p = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    const ch = p.subscribe(`private-chat-${user._id}`);

    ch.bind('nouveau_message', (msg) => {
      const sid = msg.idExpediteur?._id;
      const oid = convSelected?.interlocuteur?._id || convSelected?.userId;
      if (sid === oid) {
        setMessages((prev) => [...prev, msg]);
        API.put(`/messagerie/${sid}/lus`).catch(() => {});
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.interlocuteur?._id === sid
            ? { ...c, nonLus: (c.nonLus || 0) + (sid === oid ? 0 : 1), dernierMessage: msg }
            : c
        )
      );
      if (sid !== oid)
        showToast(`💬 Nouveau message de ${msg.idExpediteur?.prenom || "quelqu'un"}`);
    });
    ch.bind('typing', ({ fromUserId }) => {
      if (fromUserId === (convSelected?.interlocuteur?._id || convSelected?.userId))
        setIsTyping(true);
    });
    ch.bind('stop_typing', ({ fromUserId }) => {
      if (fromUserId === (convSelected?.interlocuteur?._id || convSelected?.userId))
        setIsTyping(false);
    });

    return () => {
      ch.unbind_all();
      p.unsubscribe(`private-chat-${user._id}`);
      p.disconnect();
    };
  }, [user?._id, convSelected]);

  /* ── Load data ── */
  useEffect(() => {
    if (role === 'ETUDIANT') loadEtudiant();
    if (role === 'ENCADRANT') loadEncadrant();
  }, [role]);

  const loadEtudiant = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/messagerie/mon-encadrant');
      setMonEncadrant(data.encadrant);
      setMonProjet(data.projet);
      setConvSelected({ interlocuteur: data.encadrant, userId: data.encadrant?._id, nonLus: 0 });
      setFavorites([data.encadrant]);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger votre encadrant.');
    } finally {
      setLoading(false);
    }
  };

  const loadEncadrant = async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        API.get('/messagerie/mes-etudiants'),
        API.get('/messagerie'),
      ]);
      setMesEtudiants(a.data || []);
      setConversations(b.data || []);
      setFavorites(
        (a.data || [])
          .slice(0, 5)
          .map((e) => ({ _id: e.userId, prenom: e.prenom, nom: e.nom, image: e.image }))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Load messages ── */
  useEffect(() => {
    const id = convSelected?.interlocuteur?._id || convSelected?.userId;
    if (id) loadMessages(id);
  }, [convSelected]);

  const loadMessages = async (userId) => {
    setLoadingMsgs(true);
    setError('');
    setMsgSearch('');
    setShowSearch(false);
    try {
      const { data } = await API.get(`/messagerie/conversation/${userId}`);
      setMessages(Array.isArray(data) ? data : []);
      setConversations((prev) =>
        prev.map((c) => (c.interlocuteur?._id === userId ? { ...c, nonLus: 0 } : c))
      );
      setMesEtudiants((prev) =>
        prev.map((e) => (e.userId?.toString() === userId ? { ...e, nonLus: 0 } : e))
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur chargement messages.');
    } finally {
      setLoadingMsgs(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* ── Dropdown encadrant ── */
  const handleDd = (userId) => {
    setEtudiantSelId(userId);
    if (!userId) {
      setConvSelected(null);
      return;
    }
    const e = mesEtudiants.find((e) => e.userId?.toString() === userId);
    if (e)
      setConvSelected({
        interlocuteur: {
          _id: e.userId,
          prenom: e.prenom,
          nom: e.nom,
          image: e.image,
          role: 'ETUDIANT',
        },
        userId: e.userId,
        sujetTitre: e.sujetTitre,
        nonLus: e.nonLus,
      });
  };

  /* ── Fichiers ── */
  const onFile = (e) => {
    const ok = Array.from(e.target.files || []).filter((f) => f.size <= 10 * 1024 * 1024);
    const bad = Array.from(e.target.files || []).filter((f) => f.size > 10 * 1024 * 1024);
    if (bad.length) showToast(`⚠️ ${bad.length} fichier(s) > 10 MB ignoré(s)`);
    setFichiers((prev) => [...prev, ...ok]);
    e.target.value = '';
  };
  const rmFile = (i) => setFichiers((prev) => prev.filter((_, idx) => idx !== i));

  /* ── Drag & Drop ── */
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
  };
  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragOver(false);
  };
  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.size <= 10 * 1024 * 1024);
    if (files.length) setFichiers((prev) => [...prev, ...files]);
    else showToast('⚠️ Fichiers trop volumineux (max 10 MB)');
  };

  /* ── Envoi message ── */
  const handleSend = async () => {
    const txt = texte.trim();
    const destId = convSelected?.interlocuteur?._id || convSelected?.userId;
    if ((!txt && fichiers.length === 0) || !destId || sending) return;
    setSending(true);
    setTexte('');
    setFichiers([]);
    const contenu =
      txt + (fichiers.length > 0 ? `\n📎 ${fichiers.map((f) => f.name).join(', ')}` : '');
    const temp = {
      _id: 'tmp-' + Date.now(),
      idExpediteur: { _id: user?._id, prenom: user?.prenom, nom: user?.nom },
      idDestinataire: { _id: destId },
      contenu,
      lu: false,
      createdAt: new Date().toISOString(),
      _temp: true,
    };
    setMessages((prev) => [...prev, temp]);
    try {
      const { data } = await API.post('/messagerie', { idDestinataire: destId, contenu });
      setMessages((prev) => prev.map((m) => (m._id === temp._id ? data : m)));
      setConversations((prev) => {
        const ex = prev.find((c) => c.interlocuteur?._id === destId);
        if (ex)
          return prev.map((c) =>
            c.interlocuteur?._id === destId ? { ...c, dernierMessage: data } : c
          );
        return [
          { interlocuteur: convSelected.interlocuteur, dernierMessage: data, nonLus: 0 },
          ...prev,
        ];
      });
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m._id !== temp._id));
      setTexte(txt);
      showToast('❌ ' + (err.response?.data?.message || 'Erreur envoi.'));
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTyping = (val) => {
    setTexte(val);
    const destId = convSelected?.interlocuteur?._id || convSelected?.userId;
    if (!destId) return;
    API.post('/messagerie/typing', { toUserId: destId, isTyping: true }).catch(() => {});
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      API.post('/messagerie/typing', { toUserId: destId, isTyping: false }).catch(() => {});
    }, 1500);
  };

  const insertEmoji = (em) => {
    setTexte((p) => p + em);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  /* ── Context menu ── */
  const onCtxMenu = (e, msg) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY, msg });
  };

  const copyMsg = () => {
    const { text } = parseContent(ctxMenu?.msg?.contenu);
    navigator.clipboard.writeText(text).then(() => showToast('✅ Message copié'));
    setCtxMenu(null);
  };

  const deleteMsg = async () => {
    const msgId = ctxMenu?.msg?._id;
    setCtxMenu(null);
    if (!msgId || msgId.startsWith('tmp-')) return;
    try {
      await API.delete(`/messagerie/${msgId}`);
      setMessages((prev) => prev.filter((m) => m._id !== msgId));
      showToast('🗑️ Message supprimé');
    } catch {
      showToast('❌ Impossible de supprimer ce message');
    }
  };

  /* ── Archiver ── */
  const archiveConv = async () => {
    const id = convSelected?.interlocuteur?._id || convSelected?.userId;
    if (!id) return;
    try {
      await API.put(`/messagerie/${id}/archiver`);
    } catch {
      /* silencieux */
    }
    setConversations((prev) => prev.filter((c) => c.interlocuteur?._id !== id));
    setConvSelected(null);
    showToast('📦 Conversation archivée');
  };

  /* ── Infos ── */
  const showInfo = () => {
    const u = convSelected?.interlocuteur;
    if (!u) return;
    showToast(`ℹ️ ${u.prenom} ${u.nom}${u.email ? ' · ' + u.email : ''}`);
  };

  /* ── Derived ── */
  const isMine = (msg) => {
    const sid = msg.idExpediteur?._id || msg.idExpediteur;
    return sid?.toString() === user?._id?.toString();
  };

  const filteredMsgs = msgSearch.trim()
    ? messages.filter((m) => m.contenu?.toLowerCase().includes(msgSearch.toLowerCase()))
    : messages;

  const grouped = filteredMsgs.reduce((acc, msg) => {
    const dk = fDate(msg.createdAt);
    if (!acc.length || acc[acc.length - 1].date !== dk) acc.push({ date: dk, msgs: [msg] });
    else acc[acc.length - 1].msgs.push(msg);
    return acc;
  }, []);

  const convFiltered = conversations.filter((c) => {
    const n = `${c.interlocuteur?.prenom || ''} ${c.interlocuteur?.nom || ''}`.toLowerCase();
    const matchSearch = !search.trim() || n.includes(search.toLowerCase());
    const matchFilter =
      activeFilter === 'tous'
        ? true
        : activeFilter === 'non-lus'
          ? (c.nonLus || 0) > 0
          : activeFilter === 'etudiants'
            ? c.interlocuteur?.role === 'ETUDIANT'
            : true;
    return matchSearch && matchFilter;
  });

  const totalNonLus =
    conversations.reduce((s, c) => s + (c.nonLus || 0), 0) +
    mesEtudiants.reduce((s, e) => s + (e.nonLus || 0), 0);

  /* ── Loading ── */
  if (loading)
    return (
      <>
        <style>{CSS}</style>
        <div
          className={`ch-wrap${isDark ? '' : ' light'}`}
          style={{ alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ textAlign: 'center' }}>
            <div className="ch-spinner" style={{ margin: '0 auto .65rem' }} />
            <p
              style={{
                color: 'var(--accent)',
                fontWeight: 700,
                fontFamily: 'Inter,sans-serif',
                fontSize: '.88rem',
              }}
            >
              Chargement de la messagerie…
            </p>
          </div>
        </div>
      </>
    );

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  return (
    <>
      <style>{CSS}</style>

      <div className={`ch-wrap${isDark ? '' : ' light'}`}>
        {/* Toast notification */}
        {toast && <div className="ch-toast">{toast}</div>}

        {/* Context menu */}
        {ctxMenu && (
          <div
            className="ch-ctx"
            style={{ top: ctxMenu.y, left: ctxMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="ch-ctx-btn" onClick={copyMsg}>
              {Ico.copy} Copier le texte
            </button>
            {isMine(ctxMenu.msg) && (
              <>
                <div className="ch-ctx-sep" />
                <button className="ch-ctx-btn danger" onClick={deleteMsg}>
                  {Ico.trash} Supprimer
                </button>
              </>
            )}
          </div>
        )}

        {/* Overlay mobile */}
        <div
          className={`ch-mob-ov${sidebarOpen ? ' vis' : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ══════════════ SIDEBAR ══════════════ */}
        <aside className={`ch-sb${sidebarOpen ? ' open' : ''}`}>
          <div className="ch-sb-head">
            <div className="ch-sb-title">
              <span style={{ color: 'var(--accent)' }}>{Ico.chat}</span>
              Messages
              {totalNonLus > 0 && <span className="ch-badge">{totalNonLus}</span>}
            </div>
            <div className="ch-sb-acts">
              <button
                className="ch-ib"
                title="Nouvelle conversation"
                onClick={() => showToast('💬 Sélectionnez un interlocuteur dans la liste')}
              >
                {Ico.newconv}
              </button>
              {/* ☀️🌙 Bouton SVG animé */}
              <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
            </div>
          </div>

          {role === 'ENCADRANT' && (
            <div className="ch-search-wrap">
              <div className="ch-search-rel">
                <span className="ch-si">{Ico.search}</span>
                <input
                  className="ch-search"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          )}

          {role === 'ENCADRANT' && (
            <div className="ch-filters">
              {[
                { key: 'tous', label: 'Tous' },
                { key: 'non-lus', label: 'Non lus' },
                { key: 'etudiants', label: 'Étudiants' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`ch-ftab${activeFilter === key ? ' act' : ''}`}
                  onClick={() => setActiveFilter(key)}
                >
                  {label}
                  {key === 'non-lus' && totalNonLus > 0 && (
                    <span className="ch-badge" style={{ marginLeft: '.3rem', fontSize: '.55rem' }}>
                      {totalNonLus}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {favorites.length > 0 && (
            <div className="ch-fav">
              <div className="ch-lbl" style={{ paddingLeft: 0, paddingTop: 0 }}>
                Favoris
              </div>
              <div className="ch-fav-row">
                {favorites.map((fav, i) => (
                  <div
                    key={fav._id || i}
                    className="ch-fav-it"
                    onClick={() => {
                      if (role === 'ENCADRANT') handleDd(fav._id?.toString() || '');
                      setSidebarOpen(false);
                    }}
                  >
                    <div className="ch-fav-ring">
                      <div className="ch-fav-in" style={{ background: aColor(fav._id) }}>
                        {fav.image ? <img src={fav.image} alt="" /> : initiales(fav)}
                      </div>
                    </div>
                    <span className="ch-fav-nm">{fav.prenom}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {role === 'ENCADRANT' && (
            <div className="ch-dd-wrap">
              <select
                className="ch-dd"
                value={etudiantSelId}
                onChange={(e) => {
                  handleDd(e.target.value);
                  setSidebarOpen(false);
                }}
              >
                <option value="">— Sélectionner un étudiant —</option>
                {mesEtudiants.map((e) => (
                  <option key={e.userId} value={e.userId}>
                    {e.prenom} {e.nom}
                    {e.matricule ? ` · ${e.matricule}` : ''}
                    {e.nonLus > 0 ? ` 🔴 ${e.nonLus}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {role === 'ETUDIANT' && monEncadrant && (
            <div className="ch-enc-card">
              <Av user={monEncadrant} size={40} online />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: '.84rem',
                    color: 'var(--text)',
                    marginBottom: '.1rem',
                  }}
                >
                  Dr. {monEncadrant.prenom} {monEncadrant.nom}
                </p>
                <p
                  style={{
                    fontSize: '.7rem',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    marginBottom: '.06rem',
                  }}
                >
                  Encadrant PFE
                </p>
                {monProjet?.idSujet?.titre && (
                  <p
                    style={{
                      fontSize: '.64rem',
                      color: 'var(--text2)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    📝 {monProjet.idSujet.titre}
                  </p>
                )}
              </div>
              <div className="ch-online-pill" style={{ flexShrink: 0 }}>
                <div className="ch-online-dot" /> En ligne
              </div>
            </div>
          )}

          {role === 'ENCADRANT' && (
            <>
              {convFiltered.length > 0 && <div className="ch-lbl">Conversations récentes</div>}
              <div className="ch-conv-list">
                {convFiltered.length === 0 ? (
                  <div className="ch-sb-empty">
                    <div style={{ fontSize: '2rem', opacity: 0.2 }}>💬</div>
                    <p style={{ fontSize: '.77rem' }}>
                      {search ? 'Aucun résultat' : 'Aucune conversation'}
                    </p>
                  </div>
                ) : (
                  convFiltered.map((conv, i) => {
                    const autre = conv.interlocuteur;
                    const isAct =
                      (convSelected?.interlocuteur?._id || convSelected?.userId) === autre?._id;
                    const { text: prevTxt } = parseContent(conv.dernierMessage?.contenu);
                    return (
                      <div
                        key={autre?._id || i}
                        className={`ch-conv-it${isAct ? ' act' : ''}`}
                        onClick={() => {
                          setEtudiantSelId(autre?._id || '');
                          setConvSelected({ interlocuteur: autre, userId: autre?._id, nonLus: 0 });
                          setSidebarOpen(false);
                        }}
                      >
                        <Av user={autre} size={44} />
                        <div className="ch-conv-info">
                          <div className="ch-conv-r1">
                            <span className="ch-conv-name">
                              {autre?.prenom} {autre?.nom}
                            </span>
                            <span className="ch-conv-time">
                              {fConvTime(conv.dernierMessage?.createdAt)}
                            </span>
                          </div>
                          <div className="ch-conv-r2">
                            <span className={`ch-conv-prev${conv.nonLus > 0 ? ' bold' : ''}`}>
                              {prevTxt || 'Démarrer la conversation'}
                            </span>
                            {conv.nonLus > 0 && <span className="ch-badge">{conv.nonLus}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {role === 'ETUDIANT' && (
            <div className="ch-sb-empty">
              <div style={{ fontSize: '2rem', opacity: 0.15 }}>🔒</div>
              <p style={{ fontSize: '.77rem', lineHeight: 1.65 }}>
                Conversation privée avec votre encadrant assigné uniquement.
              </p>
            </div>
          )}
        </aside>

        {/* ══════════════ CHAT AREA ══════════════ */}
        <section
          className="ch-chat"
          onDragOver={convSelected ? onDragOver : undefined}
          onDragLeave={convSelected ? onDragLeave : undefined}
          onDrop={convSelected ? onDrop : undefined}
        >
          {!convSelected ? (
            <div className="ch-empty">
              <div className="ch-empty-icon">💬</div>
              <div className="ch-empty-title">
                {role === 'ENCADRANT' ? 'Sélectionnez un étudiant' : 'Aucun encadrant assigné'}
              </div>
              <div className="ch-empty-sub">
                {role === 'ENCADRANT'
                  ? 'Utilisez le menu déroulant ou les favoris pour démarrer une conversation.'
                  : error || "Vous n'avez pas encore de projet PFE affecté."}
              </div>
            </div>
          ) : (
            <>
              {/* ── Header ── */}
              <div className="ch-head">
                <button
                  className="ch-ib ch-mob-btn"
                  onClick={() => setSidebarOpen((v) => !v)}
                  style={{ marginRight: '.2rem' }}
                >
                  {Ico.menu}
                </button>
                <div className="ch-head-user">
                  <Av user={convSelected.interlocuteur} size={40} online cls="on2" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="ch-head-name">
                      {convSelected.interlocuteur?.role === 'ENCADRANT' ? 'Dr. ' : ''}
                      {convSelected.interlocuteur?.prenom} {convSelected.interlocuteur?.nom}
                    </div>
                    <div className="ch-head-meta">
                      <span className="ch-head-role">
                        {convSelected.interlocuteur?.role === 'ENCADRANT'
                          ? '👨‍🏫 Encadrant'
                          : '🎓 Étudiant'}
                      </span>
                      {convSelected.sujetTitre && (
                        <>
                          <span style={{ color: 'var(--text3)', fontSize: '.6rem' }}>·</span>
                          <span className="ch-head-subj">📝 {convSelected.sujetTitre}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="ch-head-acts">
                  <div className="ch-online-pill">
                    <div className="ch-online-dot" /> En ligne
                  </div>
                  {/* Infos */}
                  <button
                    className="ch-ib"
                    title="Informations sur l'interlocuteur"
                    onClick={showInfo}
                  >
                    {Ico.info}
                  </button>
                  {/* Recherche dans messages */}
                  <button
                    className={`ch-ib${showSearch ? ' on' : ''}`}
                    onClick={() => {
                      setShowSearch((v) => !v);
                      if (showSearch) setMsgSearch('');
                    }}
                    title="Rechercher dans les messages"
                  >
                    {Ico.search}
                  </button>
                  {/* Actualiser */}
                  <button
                    className="ch-ib"
                    title="Actualiser les messages"
                    onClick={() => {
                      loadMessages(convSelected?.interlocuteur?._id || convSelected?.userId);
                      showToast('🔄 Messages actualisés');
                    }}
                  >
                    {Ico.refresh}
                  </button>
                  {/* Archiver */}
                  <button className="ch-ib" title="Archiver la conversation" onClick={archiveConv}>
                    {Ico.archive}
                  </button>
                  {/* ☀️🌙 Bouton SVG animé */}
                  <ThemeToggle isDark={isDark} onToggle={() => setIsDark((v) => !v)} />
                </div>
              </div>

              {/* ── Recherche messages ── */}
              {showSearch && (
                <div className="ch-msg-search">
                  <input
                    ref={searchRef}
                    placeholder="Rechercher dans cette conversation…"
                    value={msgSearch}
                    onChange={(e) => setMsgSearch(e.target.value)}
                  />
                  {msgSearch && (
                    <span className="ch-search-count">
                      {filteredMsgs.length} résultat{filteredMsgs.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  <button
                    className="ch-ib"
                    onClick={() => {
                      setShowSearch(false);
                      setMsgSearch('');
                    }}
                  >
                    {Ico.close}
                  </button>
                </div>
              )}

              {/* ── Messages ── */}
              <div ref={msgsRef} className="ch-msgs" onScroll={handleScroll}>
                {dragOver && (
                  <div className="ch-drag-ov">
                    <div style={{ color: 'var(--accent)' }}>{Ico.upload}</div>
                    <div className="ch-drag-ov-title">Déposer les fichiers ici</div>
                    <div className="ch-drag-ov-sub">PDF, images, documents — max 10 MB</div>
                  </div>
                )}
                {error && <div className="ch-err">❌ {error}</div>}

                {loadingMsgs ? (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div
                      className="ch-spinner"
                      style={{ width: 28, height: 28, margin: '0 auto .5rem' }}
                    />
                    <p style={{ color: 'var(--text2)', fontSize: '.8rem' }}>
                      Chargement des messages…
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '.75rem', opacity: 0.2 }}>
                      👋
                    </div>
                    <p
                      style={{
                        fontWeight: 700,
                        color: 'var(--text)',
                        marginBottom: '.35rem',
                        fontSize: '.92rem',
                      }}
                    >
                      Démarrez la conversation
                    </p>
                    <p style={{ fontSize: '.79rem', color: 'var(--text2)' }}>
                      Envoyez votre premier message à {convSelected.interlocuteur?.prenom}.
                    </p>
                  </div>
                ) : msgSearch && filteredMsgs.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '3rem 1rem',
                      color: 'var(--text2)',
                      fontSize: '.82rem',
                    }}
                  >
                    Aucun message ne contient « {msgSearch} »
                  </div>
                ) : (
                  grouped.map((g, gi) => (
                    <div key={gi}>
                      <div className="ch-date-sep">
                        <span>{g.date}</span>
                      </div>
                      {g.msgs.map((msg, mi) => {
                        const mine = isMine(msg);
                        const { text, attachments } = parseContent(msg.contenu);
                        return (
                          <div
                            key={msg._id || mi}
                            className={`ch-row ${mine ? 'sent' : 'recv'}`}
                            onContextMenu={(e) => onCtxMenu(e, msg)}
                          >
                            {!mine && <Av user={convSelected.interlocuteur} size={28} />}
                            <div
                              className={`ch-bub${msg._temp ? '' : ' ch-new'}`}
                              style={{ opacity: msg._temp ? 0.65 : 1 }}
                            >
                              {text && (
                                <div>
                                  {msgSearch ? <Highlighted text={text} query={msgSearch} /> : text}
                                </div>
                              )}
                              {attachments.map((att, ai) => (
                                <div key={ai} className="ch-att">
                                  <span>{fIcoFromName(att)}</span>
                                  <span
                                    style={{
                                      maxWidth: 130,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontSize: '.72rem',
                                    }}
                                  >
                                    {att}
                                  </span>
                                </div>
                              ))}
                              <div className="ch-bub-meta">
                                {Ico.clock} {fTime(msg.createdAt)}
                                {msg._temp && <span style={{ opacity: 0.5 }}> · envoi…</span>}
                                {mine && !msg._temp && (
                                  <span
                                    style={{ color: msg.lu ? 'rgba(255,255,255,.7)' : undefined }}
                                  >
                                    {msg.lu ? ' ✓✓' : <span style={{ opacity: 0.45 }}> ✓</span>}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}

                {isTyping && (
                  <div className="ch-typing">
                    <Av user={convSelected.interlocuteur} size={28} />
                    <div className="ch-typing-bub">
                      <div className="tdot" />
                      <div className="tdot" />
                      <div className="tdot" />
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {showScrollBtn && (
                <button className="ch-scroll-btn" onClick={scrollToBottom} title="Aller en bas">
                  {Ico.down}
                </button>
              )}

              {/* File preview */}
              {fichiers.length > 0 && (
                <div className="ch-fprev">
                  <span style={{ fontSize: '.7rem', color: 'var(--text2)', fontWeight: 600 }}>
                    Fichiers :
                  </span>
                  {fichiers.map((f, i) => (
                    <div key={i} className="ch-fchip">
                      {f.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(f)} alt="" className="ch-fthumb" />
                      ) : (
                        <span>{fIcoFromName(f.name)}</span>
                      )}
                      <span
                        style={{
                          maxWidth: 100,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {f.name}
                      </span>
                      <span style={{ fontSize: '.6rem', opacity: 0.6 }}>
                        {(f.size / 1024).toFixed(0)}KB
                      </span>
                      <button className="ch-frm" onClick={() => rmFile(i)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Input ── */}
              <div className="ch-input-area">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp,.txt,.zip"
                  style={{ display: 'none' }}
                  onChange={onFile}
                />

                <button
                  className="ch-ib"
                  title="Joindre un fichier"
                  onClick={() => fileRef.current?.click()}
                >
                  {Ico.attach}
                </button>

                <div className="ch-input-wrap">
                  <textarea
                    ref={inputRef}
                    className="ch-input"
                    rows={1}
                    placeholder="Écrire un message… (Shift+Entrée pour nouvelle ligne)"
                    value={texte}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={handleKey}
                  />
                  <div ref={emojiRef} className="ch-emoji-wrap">
                    <button
                      className={`ch-inp-btn${showEmoji ? ' on' : ''}`}
                      style={{ fontSize: '1.15rem' }}
                      onClick={() => setShowEmoji((v) => !v)}
                      title="Emojis"
                    >
                      😊
                    </button>
                    {showEmoji && (
                      <div className="ch-emoji-picker">
                        <div className="ch-emoji-lbl">Emojis</div>
                        {EMOJIS.map((em) => (
                          <button key={em} onClick={() => insertEmoji(em)}>
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="ch-send"
                  onClick={handleSend}
                  disabled={(!texte.trim() && fichiers.length === 0) || sending}
                  title="Envoyer (Entrée)"
                >
                  {sending ? (
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: '2px solid rgba(255,255,255,.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin .7s linear infinite',
                      }}
                    />
                  ) : (
                    Ico.send
                  )}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}
