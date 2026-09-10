// src/modules/ecommerce/utils/normalizeProduct.js
import { getImageUrl } from '../../../api/client';

export const cleanNumber = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  const cleaned = String(val).replace(/[^0-9.]/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? fallback : num;
};

export const normalizeProduct = (item) => {
  if (!item) return null;

  const id = item.id || item.product_id || item.productId;
  const title =
    item.title ||
    item.product_name ||
    item.name ||
    'Product';

  const brand = item.brand || item.brand_name || '';
  const category = item.category || item.category_name || '';
  const categoryId = item.category_id || item.categoryId || null;
  const subcategory = item.subcategory || item.subcategory_name || '';
  const subcategoryId = item.subcategory_id || item.subcategoryId || null;
  const subSubcategory = item.sub_subcategory || item.sub_subcategory_name || '';

  // Extract images
  let images = [];
  if (Array.isArray(item.images) && item.images.length > 0) {
    images = item.images.map((img) => (typeof img === 'string' ? img : img?.image_url || img?.url)).filter(Boolean);
  } else if (item.image) {
    images = [item.image];
  } else if (item.image_url) {
    images = [item.image_url];
  } else if (item.thumbnail) {
    images = [item.thumbnail];
  }

  const mainImage = images[0] ? getImageUrl(images[0]) : '/placeholder.png';
  const fullImages = images.map((img) => getImageUrl(img));

  // Numeric prices
  const rawPrice =
    item.price ??
    item.sale_price ??
    item.selling_price ??
    item.final_price ??
    item.finalPrice ??
    item.variant_price;
  const numericPrice = cleanNumber(rawPrice);

  const rawOriginalPrice =
    item.originalPrice ??
    item.original_price ??
    item.mrp ??
    item.compare_at_price ??
    item.regular_price;
  const numericOriginalPrice = cleanNumber(rawOriginalPrice, numericPrice);

  // Discount
  let discount = item.discount || item.discount_percent || item.off_percent || '';
  if (!discount && numericOriginalPrice > numericPrice && numericPrice > 0) {
    const pct = Math.round(((numericOriginalPrice - numericPrice) / numericOriginalPrice) * 100);
    if (pct > 0) discount = `${pct}%`;
  } else if (discount && typeof discount === 'number') {
    discount = `${discount}%`;
  }

  // RP Price & Coins
  const rpPrice = item.rp_price ?? item.rpPrice ?? item.finalPrice ?? null;
  const numericRpPrice = rpPrice ? cleanNumber(rpPrice) : null;

  const rewardCoins = cleanNumber(
    item.rewardCoins ??
    item.reward_coins ??
    item.reward?.coins ??
    item.points ??
    Math.round(numericPrice * 0.05)
  );

  const redeemCoins = cleanNumber(
    item.redeem_coins ??
    item.redeemCoins ??
    item.redemption?.amount ??
    item.reward?.redeem ??
    (numericPrice && numericRpPrice && numericPrice > numericRpPrice ? numericPrice - numericRpPrice : 0)
  );

  // Rating & Reviews
  const rawRating = cleanNumber(item.rating ?? item.avg_rating ?? item.average_rating, 4.5);
  const rating = rawRating > 0 ? rawRating : 4.5;
  const reviews = cleanNumber(item.reviews ?? item.reviews_count ?? item.total_reviews ?? 0, 0);

  // Variants normalization
  const variants = Array.isArray(item.variants)
    ? item.variants.map((v) => {
        const vPrice = cleanNumber(v.sale_price ?? v.price ?? v.finalPrice ?? numericPrice);
        const vMrp = cleanNumber(v.mrp ?? v.originalPrice ?? numericOriginalPrice);
        let vDiscount = v.discount ?? '';
        if (!vDiscount && vMrp > vPrice && vPrice > 0) {
          vDiscount = `${Math.round(((vMrp - vPrice) / vMrp) * 100)}%`;
        }
        let vImages = [];
        if (Array.isArray(v.images)) {
          vImages = v.images.map((img) => getImageUrl(typeof img === 'string' ? img : img?.image_url || img?.url)).filter(Boolean);
        }
        return {
          id: v.variant_id || v.id,
          variant_id: v.variant_id || v.id,
          sku: v.sku || '',
          stock: cleanNumber(v.stock, 10),
          price: vPrice,
          formattedPrice: `₹${vPrice.toLocaleString('en-IN')}`,
          originalPrice: vMrp,
          formattedOriginalPrice: `₹${vMrp.toLocaleString('en-IN')}`,
          discount: vDiscount,
          rp_price: v.finalPrice ?? v.rp_price ?? null,
          redeem_coins: cleanNumber(v.redemption?.amount ?? 0),
          rewardCoins: cleanNumber(v.reward?.coins ?? 0),
          images: vImages.length > 0 ? vImages : fullImages,
          attributes: v.variant_attributes || {},
        };
      })
    : [];

  return {
    ...item,
    id,
    product_id: id,
    variant_id: item.variant_id || (variants[0] ? variants[0].id : null),
    title,
    product_name: title,
    brand,
    brand_name: brand,
    category,
    category_name: category,
    category_id: categoryId,
    subcategory,
    subcategory_name: subcategory,
    subcategory_id: subcategoryId,
    sub_subcategory: subSubcategory,
    description: item.description || item.short_description || '',
    short_description: item.short_description || '',
    image: mainImage,
    images: fullImages.length > 0 ? fullImages : [mainImage],
    price: numericPrice,
    formattedPrice: `₹${numericPrice.toLocaleString('en-IN')}`,
    originalPrice: numericOriginalPrice,
    formattedOriginalPrice: `₹${numericOriginalPrice.toLocaleString('en-IN')}`,
    discount,
    rp_price: rpPrice,
    formattedRpPrice: numericRpPrice ? `₹${numericRpPrice.toLocaleString('en-IN')}` : null,
    rewardCoins,
    redeem_coins: redeemCoins,
    rating,
    reviews,
    is_wishlisted: Boolean(item.is_wishlisted || item.is_wishlist),
    variants,
  };
};

export default normalizeProduct;
