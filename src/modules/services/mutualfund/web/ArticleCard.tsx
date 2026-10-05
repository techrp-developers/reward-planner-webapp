import { ArrowRight, BookOpen } from 'lucide-react';
import type { MFArticleSummary } from '../../../../api/mutualFundApi';
import { getImageUrl } from '../../../../api/client';
export const plainText = (text: string | null) => new DOMParser().parseFromString(text || '', 'text/html').body.textContent || '';

export default function ArticleCard({ article, onOpen }: { article: MFArticleSummary; onOpen: (article: MFArticleSummary) => void }) {
  return <button onClick={() => onOpen(article)} className="mf-article-card group flex h-full w-full flex-col overflow-hidden rounded-3xl border text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className="mf-calculator-art relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden"><BookOpen className="mf-accent absolute opacity-40" size={60} />{article.thumbnail && <img src={getImageUrl(article.thumbnail)} alt="" loading="lazy" className="relative h-full w-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; }} />}</div><div className="flex flex-1 flex-col p-5 sm:p-6"><h3 className="line-clamp-3 text-lg font-semibold leading-snug">{article.title}</h3><p className="mf-muted mt-3 line-clamp-3 text-sm leading-6">{plainText(article.short_description)}</p><span className="mf-accent mt-auto flex items-center gap-2 pt-5 text-sm font-semibold">Read more <ArrowRight size={16} /></span></div></button>;
}
