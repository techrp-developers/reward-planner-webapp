import React from 'react';
import { Link } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import HomeRepairServiceIcon from '@mui/icons-material/HomeRepairService';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import healthHeroImage from '../../../assets/sidebarpagesimages/health_runner_clean.jpg';
import insuranceImage from '../../../assets/sidebarpagesimages/health insurance my benefits pages.png';
import servicesImage from '../../../assets/servicescards/bg-services.jpg';
import './BenefitHighlights.css';

const stackedHighlights = [
  {
    tag: 'Protection',
    tagIcon: VerifiedUserIcon,
    tagClass: 'tag-insurance',
    title: 'Insurance Coverage',
    description: 'Protection for you and your family with tailored corporate and cashless coverage.',
    action: 'Explore plans',
    to: '/insurance',
    image: insuranceImage,
    tone: 'insurance'
  },
  {
    tag: 'Convenience',
    tagIcon: HomeRepairServiceIcon,
    tagClass: 'tag-services',
    title: 'Everyday Services',
    description: 'Corporate & government services, documentation, and doorstep convenience made simple.',
    action: 'Browse services',
    to: '/services',
    image: servicesImage,
    tone: 'services'
  },
  {
    tag: 'Wealth & Growth',
    tagIcon: AccountBalanceWalletIcon,
    tagClass: 'tag-investment',
    title: 'Investments & SIPs',
    description: 'Mutual funds, automated SIPs, and smart financial growth for a brighter tomorrow.',
    action: 'Explore investments',
    to: '/services/mutual-funds',
    tone: 'investment',
    isInvestment: true
  }
];

export default function BenefitHighlights() {
  return (
    <section className="benefit-highlights" aria-labelledby="benefit-highlights-title">
      <h2 id="benefit-highlights-title">Your Benefit Highlights</h2>
      
      <div className="benefit-highlights-layout">
        {/* BIG HERO: Health Checkup Card with Full Image Cover */}
        <article className="benefit-highlight-hero">
          {/* Full Container Cover Image (Text 'Step Challenge' cleanly removed) */}
          <div className="benefit-hero-visual" aria-hidden="true">
            <img src={healthHeroImage} alt="Health & Wellness" loading="lazy" />
          </div>
          
          {/* Subtle gradient overlay to keep text crystal clear */}
          <div className="benefit-hero-shade" />
          
          <div className="benefit-hero-copy">
            <span className="benefit-hero-pill">
              <FavoriteIcon sx={{ fontSize: 15 }} className="text-rose-500" />
              <span>Health Checkup & Wellness</span>
            </span>

            <div className="benefit-hero-titles">
              <h3 className="benefit-hero-title">
                Health Checkup
              </h3>
              <p className="benefit-hero-subtitle">
                Stay healthy. Feel your best every day.
              </p>
            </div>
            
            <p className="benefit-hero-desc">
              Make time for your wellbeing. Book comprehensive preventive checkups, consult specialists, and track your wellness to earn RP Coins.
            </p>

            <Link to="/wellness" className="benefit-hero-btn">
              <span>Explore health</span>
              <ArrowForwardIcon sx={{ fontSize: 17 }} />
            </Link>

            <div className="benefit-hero-footer">
              <span className="benefit-hero-subtag">
                <HealthAndSafetyIcon sx={{ fontSize: 16 }} /> Preventive care
              </span>
              <span className="benefit-hero-subtag">
                <MedicalServicesIcon sx={{ fontSize: 16 }} /> Doctor consultations
              </span>
              <span className="benefit-hero-subtag">
                <FavoriteIcon sx={{ fontSize: 15 }} /> Feel your best
              </span>
            </div>
          </div>
        </article>

        {/* STACKED DIV: 3 Premium Elevated Cards Stacked Vertically */}
        <div className="benefit-highlights-stacked">
          {stackedHighlights.map((item) => {
            const TagIcon = item.tagIcon;
            return (
              <article key={item.title} className={`benefit-highlight-stacked-card benefit-stacked-${item.tone}`}>
                <div className="benefit-stacked-copy">
                  <div className={`benefit-stacked-tag ${item.tagClass}`}>
                    <TagIcon sx={{ fontSize: 14 }} />
                    <span>{item.tag}</span>
                  </div>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                  <Link to={item.to} className="benefit-stacked-link">
                    <span>{item.action}</span>
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Link>
                </div>

                {item.isInvestment ? (
                  <div className="benefit-investment-badge" aria-hidden="true">
                    <div className="benefit-investment-glow" />
                    <TrendingUpIcon sx={{ fontSize: 46 }} />
                  </div>
                ) : (
                  <div className="benefit-highlight-visual" aria-hidden="true">
                    <img src={item.image} alt="" loading="lazy" />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
