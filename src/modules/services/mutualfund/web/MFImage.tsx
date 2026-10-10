import { useState } from 'react';
import BookOpen from '@mui/icons-material/MenuBookOutlined';
import { getImageUrl } from '../../../../api/client';
import { normalizeMutualFundImageUrl } from '../../../../api/mutualFundImages';

export default function MFImage({ path, alt = '', className = '', fallbackClassName = '' }: {
  path: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}) {
  const normalized = normalizeMutualFundImageUrl(path);
  const src = normalized ? getImageUrl(normalized) : null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <div role="img" aria-label={alt || 'Mutual fund learning illustration'} className={`mf-calculator-art flex items-center justify-center ${fallbackClassName}`}><BookOpen className="mf-accent opacity-40" sx={{ fontSize: 60 }} /></div>;
  }

  return <img src={src} alt={alt} loading="lazy" className={className} onError={() => setFailedSrc(src)} />;
}
