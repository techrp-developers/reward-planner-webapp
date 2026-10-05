import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, ShoppingBag, Gift, Plane, GraduationCap, Wallet, BriefcaseBusiness, CalendarDays, Gamepad2, ArrowRight, Check } from 'lucide-react';
import './ServiceDiscovery.css';

const categories = [
  { id: 'health', title: 'Health & Wellness', icon: Heart, to: '/wellness', tone: 'rose', description: 'Make time for your wellbeing.', features: ['Wellness programs', 'Fitness challenges', 'Nutrition sessions'] },
  { id: 'insurance', title: 'Insurance', icon: ShieldCheck, to: '/insurance', tone: 'blue', description: 'Protection for what matters.', features: ['Health insurance', 'Explore cover', 'Insurance services'] },
  { id: 'services', title: 'Services', icon: ShoppingBag, to: '/services', tone: 'orange', description: 'Everyday essentials, simplified.', features: ['Document services', 'Tax assistance', 'Vehicle services'] },
  { id: 'rewards', title: 'Rewards Store', icon: Gift, to: '/rewards/explore', tone: 'purple', description: 'Find your next little reward.', features: ['Gift cards', 'Products', 'Experiences'] },
  { id: 'travel', title: 'Travel & Lifestyle', icon: Plane, tone: 'teal' },
  { id: 'learning', title: 'Learning & Growth', icon: GraduationCap, to: '/benefits', tone: 'gold', description: 'Explore benefits that help you grow.', features: ['Learning vouchers', 'Employee benefits', 'Development benefits'] },
  { id: 'finance', title: 'Finance & Savings', icon: Wallet, to: '/services/mutual-funds', tone: 'blue', description: 'Plan for your next milestone.', features: ['Mutual funds', 'SIP calculator', 'Financial learning'] },
  { id: 'work', title: 'Work Essentials', icon: BriefcaseBusiness, to: '/store', tone: 'rose' },
  { id: 'events', title: 'Events & Activities', icon: CalendarDays, to: '/events', tone: 'purple' },
  { id: 'games', title: 'Games & Challenges', icon: Gamepad2, tone: 'indigo' },
];

export function ServiceShortcuts() {
  return (
    <div className="service-shortcuts-panel">
      <nav className="service-shortcuts" aria-label="Explore service categories">
        {categories.map(({ id, title, icon: Icon, to, tone }) => {
          const content = (
            <>
              <span className={`service-glyph glyph-${tone}`}>
                <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <strong>{title}</strong>
              {!to && <small>Coming soon</small>}
            </>
          );
          return to ? (
            <Link className={`service-shortcut tone-${tone}`} to={to} key={id}>
              {content}
            </Link>
          ) : (
            <div className={`service-shortcut tone-${tone} service-unavailable`} key={id}>
              {content}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

export default function ServiceDiscovery() {
  return (
    <section className="service-discovery" aria-labelledby="service-discovery-title">
      <div className="service-discovery-heading"><div><h2 id="service-discovery-title">More for your everyday</h2><p>Wellbeing, essentials and a little something for you.</p></div><Link to="/services">All services <ArrowRight size={16} /></Link></div>
      <div className="service-discovery-grid">
        {categories.filter(category => category.features).map(({ id, title, icon: Icon, to, tone, description, features }) => (
          <article key={id} className={`service-discovery-card tone-${tone}`}>
            <div className="service-card-heading"><span className={`service-glyph glyph-${tone}`}><Icon size={23} strokeWidth={1.8} aria-hidden="true" /></span><h3>{title}</h3></div>
            <p>{description}</p>
            <ul>{features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
            <Icon className="service-card-art" size={88} strokeWidth={1.1} aria-hidden="true" />
            <Link to={to} aria-label={`Explore ${title}`}>Explore <ArrowRight size={16} /></Link>
          </article>
        ))}
      </div>
    </section>
  );
}
