import { Link } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import healthImage from '../../../assets/servicescards/health-hd.png';
import insuranceImage from '../../../assets/sidebarpagesimages/health insurance my benefits pages.png';
import servicesImage from '../../../assets/servicescards/bg-services.jpg';
import './BenefitHighlights.css';

const highlights = [
  { title: 'Health Checkup', description: 'Stay healthy. Feel your best.', action: 'Explore health', to: '/wellness', image: healthImage, tone: 'health' },
  { title: 'Insurance', description: 'Protection for you and your family.', action: 'Explore plans', to: '/insurance', image: insuranceImage, tone: 'insurance' },
  { title: 'Services', description: 'Everyday services, made easy.', action: 'Browse services', to: '/services', image: servicesImage, tone: 'services' },
];

export default function BenefitHighlights() {
  return (
    <section className="benefit-highlights" aria-labelledby="benefit-highlights-title">
      <h2 id="benefit-highlights-title">Your Benefit Highlights</h2>
      <div className="benefit-highlights-grid">
        {highlights.map(({ title, description, action, to, image, tone }) => (
          <article key={title} className={`benefit-highlight benefit-highlight-${tone}`}>
            <div className="benefit-highlight-visual" aria-hidden="true"><img src={image} alt="" loading="lazy" /></div>
            <div className="benefit-highlight-copy"><h3>{title}</h3><p>{description}</p><Link to={to}>{action}<ArrowRight size={14} /></Link></div>
          </article>
        ))}
        <article className="benefit-highlight benefit-highlight-investment">
          <TrendingUp className="benefit-investment-art" size={80} strokeWidth={1.25} aria-hidden="true" />
          <div className="benefit-highlight-copy"><h3>Investments</h3><p>Plan today for a brighter tomorrow.</p><Link to="/services/mutual-funds">Explore investments<ArrowRight size={14} /></Link></div>
        </article>
      </div>
    </section>
  );
}
