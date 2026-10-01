import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, ChevronRight, Footprints, Heart, ShieldCheck, TrendingUp, Gift, Home, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import runner from '../../assets/sidebarpagesimages/step challenge.png';
import dining from '../../assets/servicescards/bg-dineout-dining.jpg';
import gift from '../../assets/home/promo-giftbox.png';
import './HomePage.css';
import OccasionCalendar from './components/OccasionCalendar';

export const HomePage = () => {
  const { user } = useAuth();
  const rawName = user?.name || user?.first_name;
  const name = rawName && !/^\d+$/.test(String(rawName).trim()) ? String(rawName).trim().split(' ')[0] : 'there';
  const avatar = user?.userImage || user?.avatar;

  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <header className="dashboard-welcome">
          <div><p className="dashboard-eyebrow">YOUR EVERYDAY, UPGRADED</p><h1>Hi, {name}<span className="greeting-dot">.</span></h1><p>A little wellbeing. A little planning. A lot to look forward to.</p></div>
          <Link to="/profile" className="dashboard-profile" aria-label="View your profile">
            <span className="dashboard-avatar">{avatar ? <img src={avatar} alt="" /> : name === 'there' ? <User size={25} /> : name.charAt(0).toUpperCase()}</span>
            <span><strong>Your space</strong><small>Profile & benefits</small></span><ChevronRight size={18} />
          </Link>
        </header>

        <section className="dashboard-overview" aria-label="Wellbeing and financial services">
          <article className="wellbeing-card">
            <img className="wellbeing-art" src={runner} alt="Illustration of a runner in a sunny park" />
            <div className="wellbeing-shade" />
            <div className="wellbeing-copy">
              <span className="dashboard-pill"><Heart size={14} /> A HEALTHIER EVERYDAY</span>
              <h2>Small steps.<br />Big difference.</h2>
              <p>Make time for you. Discover wellness activities that help you feel your best.</p>
              <Link className="dashboard-primary" to="/wellness">Let's get moving <ArrowUpRight size={18} /></Link>
            </div>
            <div className="wellbeing-footer"><span><Footprints size={21} /><strong>Move more</strong></span><span><Heart size={21} /><strong>Feel better</strong></span><span><Sparkles size={21} /><strong>Build a habit</strong></span></div>
          </article>
          <div className="dashboard-finance">
            <article className="finance-card investment-card">
              <div className="finance-heading"><span className="finance-icon"><TrendingUp size={23} /></span><h2>Investments</h2><ArrowUpRight size={19} /></div>
              <h3>A brighter tomorrow<br />starts today.</h3><p>Explore mutual funds and plan your next milestone.</p>
              <Link to="/services/mutual-funds">Explore investments <ArrowRight size={17} /></Link>
            </article>
            <article className="finance-card insurance-card">
              <div className="finance-heading"><span className="finance-icon"><ShieldCheck size={23} /></span><h2>Insurance</h2><ArrowUpRight size={19} /></div>
              <h3>A little peace of mind.</h3><p>Find cover for the people and things that matter.</p>
              <Link to="/insurance">Explore insurance <ArrowRight size={17} /></Link>
            </article>
          </div>
        </section>

        <OccasionCalendar />

        <section className="dashboard-discover" aria-label="Discover more">
          <article className="dashboard-rewards-promo"><div><span className="dashboard-pill"><Gift size={14} /> SOMETHING FOR YOU</span><h2>Make room for<br />a little rewarding.</h2><p>Discover gifts, experiences and everyday favourites.</p><Link to="/rewards">Explore rewards <ArrowRight size={17} /></Link></div><img src={gift} alt="Colourful gift box" /></article>
          <article className="dashboard-dining-promo" style={{ backgroundImage: `linear-gradient(90deg, rgba(36,25,15,.88), rgba(36,25,15,.2)), url("${dining}")` }}><span className="dashboard-pill">COMING SOON · DINE OUT</span><h2>Good food.<br />Great company.</h2><p>Your next favourite table is on its way.</p></article>
        </section>
        <p className="dashboard-signoff">A more rewarding everyday, with RewardPlanners.</p>
      </div>
      <nav className="dashboard-mobile-nav" aria-label="Dashboard navigation"><Link to="/" aria-current="page"><Home size={21} />Home</Link><Link to="/rewards"><Gift size={23} />Rewards</Link><Link to="/profile"><User size={21} />Profile</Link></nav>
    </div>
  );
};
export default HomePage;
