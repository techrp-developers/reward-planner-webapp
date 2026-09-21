// src/api/campaignApi.js
import api from './client';
import { normalizeProduct } from '../modules/ecommerce/utils/normalizeProduct';

export const fetchCampaignHome = async () => {
  try {
    const res = await api.get('/v1/campaign/home');
    return res.data?.data || res.data || { posters: [], dashboard_posters: [], flash_sales: [] };
  } catch (err) {
    console.error('Failed to fetch campaign home data:', err);
    return { posters: [], dashboard_posters: [], flash_sales: [] };
  }
};

export const fetchCampaignProducts = async (campaignId) => {
  if (!campaignId) return [];
  try {
    const res = await api.get(`/v1/campaign/${campaignId}/products`);
    const rawList = res.data?.data || res.data?.products || [];
    return rawList.map((p) => {
      const normalized = normalizeProduct(p);
      return {
        ...normalized,
        id: p.id || p.product_id,
        product_id: p.product_id || p.id,
        variant_id: p.variant_id,
        title: p.product_name || normalized.title,
        brand: p.brand_name || normalized.brand,
        price: p.price ?? p.final_price ?? normalized.price,
        originalPrice: p.originalPrice ?? p.mrp ?? normalized.originalPrice,
        discount: p.discount || normalized.discount,
        rp_price: p.rp_price,
        image: p.image || normalized.image,
      };
    });
  } catch (err) {
    console.error(`Failed to fetch products for campaign ${campaignId}:`, err);
    return [];
  }
};

export default {
  fetchCampaignHome,
  fetchCampaignProducts,
};
