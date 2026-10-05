React TypeScript conversion of the React Native mutual fund feature.

The `._*.tsx` files are macOS metadata, not source. Actual React Native source was found in `C:/Users/User/Downloads/mutualfund`. This web feature keeps its navy gradients (#3545A3 to #080B26), lavender surfaces, FAQ classification (`!has_children`), beginner category 5 and informed investor category 6. Layout follows the supplied website references. Calculator illustrations are browser SVG icons; the mobile illustration files were not available.

Open `/services/mutual-funds` inside the existing signed-in application. The education API client itself does not require authentication.

For a local backend, add to the root `.env` and restart Vite:

```dotenv
VITE_MF_API_URL=http://localhost:5000/v1/
VITE_MF_CATEGORY_ID=4
```

Without overrides, the feature uses `https://rewardplanners.com/api/crm/v1/` and the existing image CDN. The category tree and section-content endpoints use path IDs. Category data is loaded once; FAQ sections are fetched when searching or opened. `getArticleDetails(sectionId, articleId)` loads section content and selects the matching article, returning `null` when missing. Tree and section articles retain their section IDs so article navigation works from every list. Repeated CDN prefixes are corrected in thumbnails, banners and article HTML images while preserving cache query strings. Loading, empty, error and 404 states are handled. Requests are aborted on unmount.

Article HTML is rendered through an element and attribute allowlist. YouTube and Vimeo embeds are supported when present in article content. Article rows, including learning/video groups, follow the actual database categories; no sample articles or videos are invented. Article CTA buttons open the planning tools because the API provides CTA text but no investment URL.

Nine calculators are provided. Estimates assume constant rates, monthly SIP contributions at the start of each month, and SWP withdrawals at the end. Smart goal accounts for existing investments. Retirement assumes 6% inflation and a 4% withdrawal rate. The original calculator utility file was not available, so formulas are implemented locally.

Validation:

```powershell
npm run typecheck:mutualfund
npm run build
```
