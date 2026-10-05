import { ArrowRight } from 'lucide-react';
import type { MFArticleSummary } from '../../../../api/mutualFundApi';
import MFImage from './MFImage';
export const plainText = (text: string | null) => new DOMParser().parseFromString(text || '', 'text/html').body.textContent || '';

export default function ArticleCard({ article, onOpen }: { article: MFArticleSummary; onOpen: (article: MFArticleSummary) => void }) {
  return (
    <button onClick={() => onOpen(article)} className="mf-article-card group flex h-full w-full flex-col overflow-hidden rounded-3xl border text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="mf-calculator-art relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden">
        <MFImage path={article.thumbnail} className="relative h-full w-full object-cover" fallbackClassName="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="line-clamp-3 text-lg font-semibold leading-snug">{article.title}</h3>
        <p className="mf-muted mt-3 line-clamp-3 text-sm leading-6">{plainText(article.short_description)}</p>
        <span className="mf-accent mt-auto flex items-center gap-2 pt-5 text-sm font-semibold">Read more <ArrowRight size={16} /></span>
      </div>
    </button>
  );
}
