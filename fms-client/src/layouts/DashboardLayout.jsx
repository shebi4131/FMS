import { createElement, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiArchive, FiBell, FiChevronLeft, FiClock, FiDatabase, FiDownloadCloud, FiGrid, FiLogOut, FiMenu, FiSettings, FiUser, FiX } from "react-icons/fi";
import { api } from "../lib/api";

const menu = [
  ["/dashboard", "Dashboard", FiGrid],
  ["/daily-movement", "Daily Movement", FiClock],
  ["/extended-custody", "Extended Custody", FiArchive],
  ["/ledger", "Record Room Ledger", FiDatabase],
  ["/import", "Import Data", FiDownloadCloud],
  ["/profile", "My Profile", FiUser],
  ["/settings", "Settings & Access", FiSettings]
];

export default function DashboardLayout({ children }) {
  const [collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false),[notifs,setNotifs]=useState([]),[showNotifs,setShowNotifs]=useState(false);
  const readStorageKey=`fms-read-notifications-${localStorage.getItem("userEmail")||"user"}`;
  const [readIds,setReadIds]=useState(()=>JSON.parse(localStorage.getItem(readStorageKey)||"[]"));
  const notificationRef=useRef(null),navigate=useNavigate(),location=useLocation();
  useEffect(()=>{api.get("/file/notifications").then(r=>setNotifs(r.data||[])).catch(()=>{})},[location.pathname]);
  useEffect(()=>{const close=e=>{if(notificationRef.current&&!notificationRef.current.contains(e.target))setShowNotifs(false)};document.addEventListener("mousedown",close);return()=>document.removeEventListener("mousedown",close)},[]);
  const markRead=ids=>{const next=[...new Set([...readIds,...ids])];setReadIds(next);localStorage.setItem(readStorageKey,JSON.stringify(next))};
  const unread=notifs.filter(n=>!readIds.includes(n.id));
  const logout=()=>{localStorage.clear();navigate("/login")};
  const title=menu.find(x=>location.pathname.startsWith(x[0]))?.[1]||"File Registry";
  const fullName=localStorage.getItem("fullName")||localStorage.getItem("userEmail")?.split("@")[0]||"User";
  return <div className={`app-shell ${collapsed?"is-collapsed":""}`}>
    <aside className={`sidebar ${mobile?"mobile-open":""}`}>
      <div className="brand"><div className="brand-mark">F</div><div className="brand-copy"><strong>File Registry</strong><span>Record Room</span></div><button className="icon-btn mobile-close" onClick={()=>setMobile(false)}><FiX/></button></div>
      <nav className="side-nav">{menu.map(([to,label,Icon])=><NavLink key={to} to={to} onClick={()=>setMobile(false)} className={({isActive})=>isActive?"active":""}>{createElement(Icon)}<span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-foot"><div className="user-chip"><div className="avatar">{fullName[0].toUpperCase()}</div><div><strong>{fullName}</strong><span>{JSON.parse(localStorage.getItem("userRoles")||"[]")[0]||"User"}</span></div></div><button className="logout-btn" onClick={logout}><FiLogOut/><span>Sign out</span></button></div>
    </aside>
    {mobile&&<div className="backdrop" onClick={()=>setMobile(false)}/>}
    <main className="main-panel">
      <header className="topbar"><div className="topbar-left"><button className="icon-btn desktop-toggle" onClick={()=>setCollapsed(v=>!v)}>{collapsed?<FiMenu/>:<FiChevronLeft/>}</button><button className="icon-btn mobile-toggle" onClick={()=>setMobile(true)}><FiMenu/></button><div><h1>{title}</h1><p>{new Intl.DateTimeFormat("en-PK",{weekday:"long",day:"2-digit",month:"long",year:"numeric"}).format(new Date())}</p></div></div><div className="top-actions"><div className="notification-wrap" ref={notificationRef}><button className="icon-btn bell" onClick={()=>setShowNotifs(v=>!v)}><FiBell/>{unread.length>0&&<b>{unread.length}</b>}</button>{showNotifs&&<div className="notification-panel"><div className="notification-head"><div><strong>Notifications</strong><span>{unread.length} unread</span></div>{unread.length>0&&<button onClick={()=>markRead(unread.map(n=>n.id))}>Mark all as read</button>}</div>{notifs.length?notifs.map(n=><button type="button" className={`notification-row ${n.type} ${readIds.includes(n.id)?"read":""}`} key={n.id} onClick={()=>markRead([n.id])}><i/><div><strong>{n.title}</strong><p>{n.message}</p></div>{!readIds.includes(n.id)&&<em>New</em>}</button>):<div className="empty-mini">You're all caught up.</div>}</div>}</div></div></header>
      <div className="page-content">{children}</div>
    </main>
  </div>;
}
