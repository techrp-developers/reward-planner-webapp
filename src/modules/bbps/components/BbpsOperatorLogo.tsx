import { useState } from 'react';
import { getImageUrl } from '../../../api/client';

type Operator = { name?: string; logo_url?: string | null; logo_alt?: string | null };

export default function BbpsOperatorLogo({ operator, className = 'h-12 w-12', eager = false }: {
  operator: Operator; className?: string; eager?: boolean;
}) {
  const supplied = operator.logo_url?.trim();
  const src = supplied ? getImageUrl(supplied) : '';
  const [failedSource, setFailedSource] = useState('');
  const name = operator.name?.trim() || 'Biller';
  const words = name.split(/\s+/);
  const initials = words.length > 1 ? `${words[0][0]}${words[1][0]}` : name.slice(0, 2);
  return <span className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white ${className}`}>
    {src && failedSource !== src
      ? <img src={src} alt={operator.logo_alt?.trim() || name} loading={eager ? 'eager' : 'lazy'} className="h-full w-full object-contain p-1.5" onError={() => setFailedSource(src)} />
      : <span role="img" aria-label={name} className="text-sm font-bold uppercase text-brand-purple">{initials}</span>}
  </span>;
}
