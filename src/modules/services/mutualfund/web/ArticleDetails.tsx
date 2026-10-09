import { useQuery } from '@tanstack/react-query';
import { mutualFundSectionQuery } from './contentQueries';
import axios from 'axios';
import { getSectionContent, getArticleDetails, type MFArticleSummary, type MFArticleDetails, type MFSectionContentResponse } from '../../../../api/mutualFundApi';
import MFImage from './MFImage';
import ArticleCard, { plainText } from './ArticleCard';
import ArticleBody from './ArticleBody';
import Dialog from './Dialog';
export type ContentSelection =
  | { kind: 'section'; id: number; title: string }
  | { kind: 'article'; id: number; sectionId: number; title: string };
export const errorText = (error: unknown) => axios.isAxiosError(error) && error.response?.status === 404 ? 'This content could not be found. Please choose another item.' : 'We could not load this content. Please try again.';

export default function ArticleDetails({ selection, onClose, onArticle }: { selection: ContentSelection; onClose: () => void; onArticle: (article: MFArticleSummary) => void }) {
  const sectionId = selection.kind === 'article' ? selection.sectionId : selection.id;
  const query = useQuery(mutualFundSectionQuery(sectionId));
  const data = selection.kind === 'article' ? query.data?.articles.find(article => article.id === selection.id) : query.data;
  const error = query.isError ? errorText(query.error) : !query.isPending && !data ? 'This article could not be found in its section. Please choose another item.' : '';
  return <Dialog title={selection.title} onClose={onClose}>{error ? <div role="alert" className="space-y-4"><p>{error}</p><button className="mf-primary-button" onClick={() => { void query.refetch(); }}>Try again</button></div> : !data ? <p role="status" className="mf-accent animate-pulse py-12 text-center">Loading content…</p> : 'section' in data ? <div><p className="mf-muted mb-6 text-sm">{data.articles.length} articles in {data.section.title}</p><div className="grid gap-5 sm:grid-cols-2">{[...data.articles].sort((a, b) => a.sort_order - b.sort_order).map(article => <ArticleCard key={article.id} article={article} onOpen={onArticle} />)}</div>{!data.articles.length && <p className="mf-muted py-8 text-center">No articles have been published in this section yet.</p>}</div> : <article className="space-y-6"><MFImage path={data.banner_image || data.thumbnail} className="max-h-96 w-full rounded-2xl object-contain" fallbackClassName="h-48 w-full rounded-2xl" />{data.short_description && <p className="mf-muted text-lg leading-8">{plainText(data.short_description)}</p>}<ArticleBody content={data.article_content} />{data.cta_text && <div className="mf-topic rounded-2xl p-5"><p className="mf-muted mb-3 text-sm">Explore your investment goals with our planning tools.</p><button className="mf-primary-button" onClick={() => { onClose(); document.getElementById('mf-calculators')?.scrollIntoView({ behavior: 'smooth' }); }}>{data.cta_text}</button></div>}</article>}</Dialog>;
}
