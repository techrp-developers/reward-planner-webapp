import { queryOptions } from '@tanstack/react-query';
import { getMutualFundCategories, getSectionContent, MF_CATEGORY_ID } from '../../../../api/mutualFundApi';
const policy = { staleTime: 30 * 60_000, gcTime: 60 * 60_000, retry: false, refetchOnWindowFocus: false } as const;
export const mutualFundTreeQuery = () => queryOptions({ ...policy, queryKey: ['mf-content', 'tree', MF_CATEGORY_ID], queryFn: ({ signal }) => getMutualFundCategories(MF_CATEGORY_ID, signal) });
export const mutualFundSectionQuery = (id: number) => queryOptions({ ...policy, queryKey: ['mf-content', 'section', id], queryFn: ({ signal }) => getSectionContent(id, signal) });
