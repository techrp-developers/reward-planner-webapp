import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { getMutualFundCategories, getSectionContent, MF_CATEGORY_ID, type MFCategory, type MFChildCategory, type MFArticleSummary } from '../../../../api/mutualFundApi';
import CommonQuestions from './CommonQuestions';
import SmartWealthBanner from './SmartWealthBanner';
import CalculatorGrid from './CalculatorGrid';
import { CALCULATORS, type CalculatorItem } from './calculatorItems';
import CalculatorScreen from './CalculatorScreen';
const CalculatorForm = lazy(() => import('./CalculatorForm'));
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { mutualFundTreeQuery, mutualFundSectionQuery } from './contentQueries';
import type { CalculatorKind } from './calculations';
import ArticleDetails, { errorText, type ContentSelection } from './ArticleDetails';
import ArticleRow from './ArticleRow';
import ArticleCard, { plainText } from './ArticleCard';
import Dialog from './Dialog';
import './mutualfund.css';

const EMPTY_CATEGORIES: MFCategory[] = [];
const sorted = <T extends { sort_order?: number }>(items: T[] = []) => [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
function flatten(section: MFChildCategory): MFArticleSummary[] {
  return [...(section.articles || []), ...sorted(section.children).flatMap(flatten)];
}
function unique(articles: MFArticleSummary[]) { return [...new Map(articles.map(article => [article.id, article])).values()]; }
const descriptions: Record<number, string> = {
  5: 'Thinking of investing in mutual funds but not sure where to start? Explore articles that answer your investment questions.',
  6: 'Want to understand more about mutual funds? Explore curated articles for information and guidance.',
};

export default function MFScreen() {
  const contentQuery = useQuery(mutualFundTreeQuery());
  const client = useQueryClient();
  const categories = useMemo(() => sorted(contentQuery.data || EMPTY_CATEGORIES), [contentQuery.data]);
  const loading = contentQuery.isPending;
  const error = contentQuery.isError ? errorText(contentQuery.error) : '';
  const [query, setQuery] = useState('');
  const [searchArticles, setSearchArticles] = useState<MFArticleSummary[] | null>(null);
  const [searchError, setSearchError] = useState('');
  const [searchAttempt, setSearchAttempt] = useState(0);
  const [calculator, setCalculator] = useState<CalculatorKind | null>(null);
  const [selection, setSelection] = useState<ContentSelection | null>(null);
  const [group, setGroup] = useState<MFChildCategory | null>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  const hasQuery = Boolean(query.trim());
  useEffect(() => {
    if (!hasQuery || !categories.length || searchArticles) return;
    const controller = new AbortController();
    // The tree omits previews for FAQ sections. Include their articles in search.
    const timer = window.setTimeout(() => {
      Promise.allSettled(categories.filter(category => !category.has_children).map(category => client.fetchQuery(mutualFundSectionQuery(category.id))))
        .then(results => {
          if (controller.signal.aborted) return;
          setSearchArticles(results.flatMap(result => result.status === 'fulfilled' ? result.value.articles : []));
          setSearchError(results.some(result => result.status === 'rejected') ? 'Some FAQ articles could not be searched. You can still open their topics above.' : '');
        });
    }, 250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [hasQuery, categories, searchArticles, searchAttempt, client]);
  const openSection = (section: MFChildCategory) => {
    if (section.children?.length) { setSelection(null); setGroup(section); }
    else { setGroup(null); setSelection({ kind: 'section', id: section.id, title: section.title }); }
  };
  const openArticle = (article: MFArticleSummary) => {
    if (!article.section_id) return;
    setGroup(null);
    setSelection({ kind: 'article', id: article.id, sectionId: article.section_id, title: article.title });
  };
  const faq = categories.filter(category => !category.has_children);
  const matchingFaq = faq.filter(category => !query.trim() || category.title.toLowerCase().includes(query.trim().toLowerCase()));
  const rows = categories.filter(category => category.has_children);
  const articles = unique([...categories.flatMap(flatten), ...(searchArticles || [])]);
  const results = articles.filter(article => `${article.title} ${plainText(article.short_description)}`.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedCalculator = CALCULATORS.find(item => item.id === calculator);
  return <div className="mf-page mx-auto max-w-[1440px] px-4 py-6 sm:px-8 lg:px-12"><nav aria-label="Breadcrumb" className="mf-muted mb-6 flex items-center gap-2 text-sm"><Link to="/services" className="mf-accent flex items-center gap-1"><ArrowLeft size={15} /> Services</Link><span>/</span><span>Mutual Funds</span></nav>
    <SmartWealthBanner />
    <CommonQuestions categories={matchingFaq} query={query} onQuery={setQuery} results={results} onSection={openSection} onArticle={openArticle} status={loading ? 'loading' : error ? 'error' : undefined} />
    {hasQuery && !searchArticles && !searchError && !loading && !error && <p role="status" className="mf-muted -mt-8 mb-8 text-sm">Searching FAQ articles…</p>}
    {hasQuery && searchError && <div className="mf-muted -mt-8 mb-8 text-sm"><p role="status">{searchError}</p><button className="mf-accent mt-2 font-semibold" onClick={() => { setSearchError(''); setSearchArticles(null); setSearchAttempt(value => value + 1); }}>Retry FAQ search</button></div>}
    <CalculatorGrid onOpenCalculator={(item: CalculatorItem) => setCalculator(item.id)} />
    <div id="mf-learning-section" className="space-y-8 scroll-mt-8">{loading ? <div role="status" className="grid animate-pulse gap-5 sm:grid-cols-3">{[1, 2, 3].map(id => <div key={id} className="mf-topic h-72 rounded-3xl" />)}<span className="sr-only">Loading mutual fund articles</span></div> : error ? <div role="alert" className="mf-panel rounded-3xl border p-8 text-center"><p className="mf-muted mb-4">{error}</p><button className="mf-primary-button" onClick={() => { void contentQuery.refetch(); }}>Try again</button></div> : !categories.length ? <div className="mf-panel mf-muted rounded-3xl p-10 text-center">Mutual fund learning content will appear here when published.</div> : rows.map(category => <ArticleRow key={category.id} section={{ ...category, title: category.id === 5 ? 'Mutual Fund Investment for New Investors' : category.id === 6 ? 'Mutual Fund Investment for Savvy Investors' : category.title }} articles={unique(flatten(category))} description={descriptions[category.id] || (/watch|video/i.test(category.title) ? 'Learn about mutual funds with informative educational content.' : 'Explore articles and practical information to help you understand mutual funds.')} onSection={openSection} onArticle={openArticle} />)}</div>
    {selectedCalculator && <Dialog plain title={selectedCalculator.title} onClose={() => setCalculator(null)}>
      <CalculatorScreen title={selectedCalculator.title} subtitle={selectedCalculator.subtitle} image={selectedCalculator.image} onBack={() => setCalculator(null)}>
        <Suspense fallback={<p role="status">Loading calculator...</p>}><CalculatorForm key={selectedCalculator.id} kind={selectedCalculator.id} /></Suspense>
      </CalculatorScreen>
    </Dialog>}
    {selection && <ArticleDetails key={`${selection.kind}-${selection.id}`} selection={selection} onClose={() => setSelection(null)} onArticle={openArticle} />}
    {group && <Dialog title={group.title} onClose={() => setGroup(null)}><div className="space-y-4">{sorted(group.children).map(child => <button key={child.id} onClick={() => openSection(child)} className="mf-topic flex w-full items-center justify-between gap-4 rounded-2xl p-5 text-left"><span>{child.title}</span><ChevronRight className="mf-accent" size={20} /></button>)}</div>{group.articles?.length ? <div className="mt-6 grid gap-5 sm:grid-cols-2">{group.articles.map(article => <ArticleCard key={article.id} article={article} onOpen={openArticle} />)}</div> : null}</Dialog>}
  </div>;
}
