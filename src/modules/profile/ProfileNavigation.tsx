import { Link } from 'react-router-dom';
import { Gift, CalendarDays, Heart, FileText, BarChart2, ChevronRight } from 'lucide-react';

const links = [
  { label: 'My Rewards', description: 'Gifts, vouchers and experiences', icon: Gift, to: '/rewards' },
  { label: 'My Events', description: 'Activities and celebrations', icon: CalendarDays, to: '/events' },
  { label: 'Health & Wellness', description: 'Make time for your wellbeing', icon: Heart, to: '/wellness' },
  { label: 'My Benefits', description: 'Explore your employee benefits', icon: FileText, to: '/benefits' },
  { label: 'Reports', description: 'Your activity and insights', icon: BarChart2, to: '/reports' },
];

export default function ProfileNavigation() {
  return (
    <section aria-labelledby="profile-tools-heading">
      <h2 id="profile-tools-heading" className="text-lg font-bold text-slate-900 mb-1">Your employee hub</h2>
      <p className="text-xs text-slate-500 mb-4">All your rewards, benefits and activities in one place.</p>
      <nav aria-label="Employee services" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {links.map(({ label, description, icon: Icon, to }) => (
          <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-violet-300 hover:bg-violet-50 transition-colors focus-visible:outline-2 focus-visible:outline-violet-500">
            <span className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0"><Icon size={20} /></span>
            <span className="flex-1"><strong className="block text-xs text-slate-800">{label}</strong><span className="block text-[10px] text-slate-500 mt-1">{description}</span></span>
            <ChevronRight size={16} className="text-slate-400" />
          </Link>
        ))}
      </nav>
    </section>
  );
}
