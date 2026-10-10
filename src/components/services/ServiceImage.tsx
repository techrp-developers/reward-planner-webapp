import { useState, type ImgHTMLAttributes } from 'react';
import { serviceImageSources } from './serviceImageSources';

export default function ServiceImage({ src = '', fallbackSrc, sizes = '100vw', loading = 'lazy', ...props }:
  ImgHTMLAttributes<HTMLImageElement> & { fallbackSrc?: string }) {
  const [failed, setFailed] = useState('');
  const actual = failed === src && fallbackSrc ? fallbackSrc : src;
  const sources = serviceImageSources[actual];
  const img = <img {...props} src={actual} sizes={sizes} loading={loading} decoding="async"
    onError={event => { if (fallbackSrc && actual !== fallbackSrc) setFailed(src); props.onError?.(event); }} />;
  return sources ? <picture style={{ display: 'contents' }}>
    <source type="image/avif" srcSet={sources.avif} sizes={sizes} />
    <source type="image/webp" srcSet={sources.webp} sizes={sizes} />
    {img}
  </picture> : img;
}
