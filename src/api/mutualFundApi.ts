import axios from 'axios';
import { API_BASE_URL } from './endpoints';
import { normalizeMutualFundImageUrl } from './mutualFundImages';

export interface MFArticleSummary {
  id: number;
  section_id?: number;
  title: string;
  short_description: string | null;
  thumbnail: string | null;
}
export interface MFChildCategory {
  id: number;
  title: string;
  sort_order: number;
  article_count?: number;
  articles?: MFArticleSummary[];
  children?: MFChildCategory[];
}
export interface MFCategory extends MFChildCategory {
  icon: string | null;
  has_children: boolean;
}
export interface MFSection {
  id: number;
  category_id: number;
  title: string;
  icon: string | null;
  sort_order: number;
  parent_section_id: number | null;
}
export interface MFArticleDetails extends MFArticleSummary {
  article_content: string | null;
  banner_image: string | null;
  cta_text: string | null;
  sort_order: number;
  updated_at?: string;
  status?: number;
}
export interface MFSectionContentResponse {
  section: MFSection;
  articles: MFArticleDetails[];
}
interface ApiResponse<T> { success: boolean; data: T; message?: string }

// This public client deliberately has no login or token-refresh interceptors.
// Configure the complete v1 base, e.g. http://localhost:5000/v1/.
export const BASE_API_URL = `${(import.meta.env.VITE_MF_API_URL || `${API_BASE_URL}/v1`).replace(/\/+$/, '')}/`;
const api = axios.create({ baseURL: BASE_API_URL, timeout: 15000, headers: { Accept: 'application/json' } });

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await api.get<ApiResponse<T>>(path, { signal });
  if (!response.data.success || response.data.data == null) {
    throw new Error(response.data.message || 'Mutual fund content is unavailable.');
  }
  return response.data.data;
}
const pathId = (id: number) => {
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid content ID.');
  return id;
};
function normalizeArticle<T extends MFArticleSummary>(article: T, sectionId: number): T {
  const normalized = {
    ...article,
    section_id: sectionId,
    thumbnail: normalizeMutualFundImageUrl(article.thumbnail),
  };
  if ('banner_image' in article) {
    Object.assign(normalized, {
      banner_image: normalizeMutualFundImageUrl(typeof article.banner_image === 'string' ? article.banner_image : null),
    });
  }
  return normalized;
}

function normalizeSection<T extends MFChildCategory>(section: T): T {
  return {
    ...section,
    articles: section.articles?.map(article => normalizeArticle(article, section.id)),
    children: section.children?.map(child => normalizeSection(child)),
  };
}

export const getMutualFundCategories = async (categoryId = 4, signal?: AbortSignal): Promise<MFCategory[]> => {
  const categories = await get<MFCategory[]>(`mutual-fund/category-tree/${pathId(categoryId)}`, signal);
  return categories.map(category => normalizeSection(category));
};

export const getSectionContent = async (sectionId: number, signal?: AbortSignal): Promise<MFSectionContentResponse> => {
  const content = await get<MFSectionContentResponse>(`mutual-fund/section-content/${pathId(sectionId)}`, signal);
  return {
    ...content,
    articles: content.articles.map(article => normalizeArticle(article, content.section.id)),
  };
};

export const getArticleDetails = async (
  sectionId: number,
  articleId: number,
  signal?: AbortSignal,
): Promise<MFArticleDetails | null> => {
  pathId(articleId);
  const content = await getSectionContent(sectionId, signal);
  return content.articles.find(article => article.id === articleId) ?? null;
};
export const getCategoryById = async (categoryId: number) =>
  (await getMutualFundCategories()).find(category => category.id === categoryId);
export const getArticlesByChildCategory = async (categoryId: number, childId: number) =>
  (await getCategoryById(categoryId))?.children?.find(child => child.id === childId)?.articles ?? [];
export default api;
