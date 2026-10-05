import { useState } from 'react';
import { Link } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

const sampleNotifications = [
  { id: 'events', title: 'Something to look forward to', message: 'Explore team celebrations and activities on your occasion calendar.', category: 'Events', to: '/events', icon: EventOutlinedIcon, read: false },
  { id: 'wellness', title: 'Make a little time for you', message: 'Discover wellness programs and challenges for your everyday routine.', category: 'Wellness', to: '/wellness', icon: FavoriteBorderIcon, read: false },
  { id: 'rewards', title: 'Explore your rewards', message: 'Browse gifts, vouchers and experiences in your rewards collection.', category: 'Rewards', to: '/rewards', icon: CardGiftcardOutlinedIcon, read: true },
];

export default function NotificationsPanel() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState(sampleNotifications);
  const unread = notifications.filter(item => !item.read).length;
  const visible = notifications.filter(item => filter === 'All' || !item.read);
  const markRead = id => setNotifications(items => items.map(item => item.id === id ? { ...item, read: true } : item));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Notifications, ${unread} unread`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? 'notifications-panel' : undefined} className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white hover:bg-[#F6F2F8] border border-[#E4DCE9] flex items-center justify-center cursor-pointer shrink-0 text-[#55435F] focus-visible:outline-2 focus-visible:outline-[#78538F] focus-visible:outline-offset-2">
        <NotificationsOutlinedIcon sx={{ fontSize: 21 }} />
        {unread > 0 && <span aria-hidden="true" className="w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white absolute top-2 right-2" />}
      </button>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)} slotProps={{ paper: { role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'notifications-title', id: 'notifications-panel', sx: { width: { xs: '100%', sm: 400 }, maxWidth: '100vw', bgcolor: '#FAF8FC', color: '#1C0E28' } } }}>
        <div className="p-4 border-b border-[#E4DCE9] bg-white flex items-start justify-between gap-4">
          <div><h2 id="notifications-title" className="text-xl font-semibold">Notifications</h2><p className="text-xs text-[#776B80] mt-2" aria-live="polite">{unread ? `${unread} unread updates` : "You're all caught up"}</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close notifications" className="p-2 rounded-xl hover:bg-[#F0E9F5] cursor-pointer"><CloseRoundedIcon /></button>
        </div>
        <div className="flex items-center justify-between gap-2 p-4">
          <div className="flex gap-2" aria-label="Notification filters">{['All', 'Unread'].map(value => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} className={`px-4 py-2 rounded-full text-xs cursor-pointer ${filter === value ? 'bg-[#1C0E28] text-white' : 'bg-white border border-[#E4DCE9] text-[#776B80]'}`}>{value}</button>)}</div>
          <button type="button" disabled={!unread} onClick={() => setNotifications(items => items.map(item => ({ ...item, read: true })))} className="text-xs font-medium text-[#553767] disabled:opacity-40 cursor-pointer disabled:cursor-default">Mark all as read</button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <p className="text-[11px] text-[#776B80] mb-4">Sample notifications</p>
          <ul className="space-y-4">
            {visible.map(item => {
              const Icon = item.icon;
              return <li key={item.id} className="bg-white border border-[#E4DCE9] rounded-2xl p-4">
                <div className="flex gap-4"><span className="w-10 h-10 rounded-xl bg-[#F0E9F5] text-[#553767] flex items-center justify-center shrink-0"><Icon sx={{ fontSize: 21 }} /></span><div className="min-w-0 flex-1"><div className="flex justify-between items-center gap-2"><span className="text-[10px] text-[#776B80]">{item.category}</span>{!item.read && <span className="text-[10px] font-medium text-[#553767]">Unread</span>}</div><h3 className="text-sm font-semibold mt-2">{item.title}</h3><p className="text-xs leading-relaxed text-[#776B80] mt-2">{item.message}</p></div></div>
                <div className="flex justify-between items-center gap-2 mt-4"><Link to={item.to} onClick={() => { markRead(item.id); setOpen(false); }} className="text-xs font-medium text-[#553767] inline-flex items-center gap-2">View {item.category.toLowerCase()} <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} /></Link>{!item.read && <button type="button" onClick={() => markRead(item.id)} className="text-[11px] text-[#776B80] hover:text-[#1C0E28] cursor-pointer">Mark as read</button>}</div>
              </li>;
            })}
          </ul>
          {!visible.length && <div className="text-center py-16 text-[#776B80]"><NotificationsOutlinedIcon sx={{ fontSize: 32 }} /><h3 className="mt-4 text-sm font-semibold text-[#1C0E28]">No unread notifications</h3><p className="text-xs mt-2">Switch to All to revisit your updates.</p></div>}
        </div>
      </Drawer>
    </>
  );
}
