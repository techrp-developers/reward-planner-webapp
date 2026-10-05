React TypeScript conversion of the React Native mutual fund feature.

The `._*.tsx` files are macOS metadata, not source. Actual React Native source was found in `C:/Users/User/Downloads/mutualfund`. This web feature keeps its navy gradients (#080B26, #171F59, #3545A3), lavender surfaces, FAQ classification (`!has_children`), beginner category 5 and informed investor category 6. Calculator cards intentionally start with their titles and do not contain artwork, image halos or Tool badges.

Open `/services/mutual-funds` inside the existing signed-in application. The education API client itself does not require authentication.

The root `.env` now explicitly sets the live backend. `.env` is ignored by Git; copy these values from `.env.example` for another checkout, then restart Vite:

```dotenv
VITE_MF_API_URL=https://rewardplanners.com/api/crm/v1/
VITE_MF_CATEGORY_ID=4
```

There were no `.env.local`, development/production mode environment files, or process environment overrides for `VITE_MF_*` at inspection. The existing `/api/crm` Vite proxy targets the live backend, not localhost. Mutual fund requests use the absolute live URL directly; other modules' Axios clients and proxy configuration remain unchanged. Vite was restarted at `http://localhost:5173` after the environment change. Its browser-loaded API module confirmed the live base and category ID 4.

The category tree and section-content endpoints use path IDs. Category data is loaded once; FAQ sections are fetched when searching or opened. `getArticleDetails(sectionId, articleId)` loads section content and selects the matching article, returning `null` when missing. Tree and section articles retain their section IDs so article navigation works from every list. `/mutual-fund/find/27` was also inspected: HTTP 200, `{ success: true, data: article }`, section ID 12, HTML body, images, CTA and timestamps. The UI retains the mobile-compatible section-content lookup instead of adding another article dependency.

Only the exact known malformed `https://cdn.rewardplanners.com/https://cdn.rewardplanners.com/` prefix is repaired. Other origins and URL schemes are preserved. Normalization covers thumbnails, banners, category/section icons and article HTML images, preserving cache query strings. Missing or failed thumbnails/banners render a learning illustration. Models include nullable images/descriptions and optional nullable `updated_at` values. Loading, empty, error, retry and cancellation states remain available. FAQ search uses settled results so one failed section does not discard other results; its retry reloads the FAQ search.

Article HTML is rendered through an element and attribute allowlist. YouTube and Vimeo embeds are supported when present in article content. Article rows, including learning/video groups, follow the actual database categories; no sample articles or videos are invented. Article CTA buttons open the planning tools because the API provides CTA text but no investment URL.

Nine calculators are provided. Estimates assume constant rates, monthly SIP contributions at the start of each month, and SWP withdrawals at the end. Smart goal accounts for existing investments. Retirement assumes 6% inflation and a 4% withdrawal rate. The original calculator utility file was not available, so formulas are implemented locally.

The supplied title-first calculator design is implemented in browser-only JSX: `CalculatorCard.jsx`, `CalculatorGrid.jsx` and `CalculatorScreen.jsx`. All nine exact titles/subtitles are in `calculatorItems.ts`, retaining the existing calculation IDs. The responsive grid shows all cards with equal heights in one, two or three columns. `CalculatorForm.tsx` contains the previous forms and validation; `calculations.ts` is unchanged. `MFScreen.tsx` connects cards to the existing dialog, and `Dialog.tsx` offers a calculator-only plain mode so the JSX navy header, back button and content area appear without a duplicate header. Other dialogs retain their existing header and close behavior.

Calculator JSX verification: TypeScript, targeted JSX ESLint, existing calculator checks and the production build passed. `scripts/check-calculator-layout-browser.mjs` passed in headless Chrome using the live-data component harness: all nine card/form mappings, exact labels, result changes, input bounds, Enter/Space opening, Tab/Shift+Tab navigation, back button focus restoration and Escape closing. Grid checks passed at 390px (one column), 768px (two), and 1440px (three), with equal card heights and no horizontal overflow in cards or dialogs. A live FAQ section and full article dialog also passed the shared-dialog regression check. No browser Console or page errors occurred. This run does not verify authentication; it uses the real feature in the separately labeled component harness. Results and screenshots are in `.mf-validation/calculator-layout-results.json` and `calculator-grid-*.png` / `calculator-screen-*.png`.

Validation on 2026-10-05:

- `npm run typecheck:mutualfund`: passed.
- `npm run check:mutualfund`: passed. Covers all nine calculators, zero-rate calculations, delayed starts, funded goals, step-up equivalence, exhausted withdrawals, exact CDN-prefix repair and unchanged valid/unrelated URLs.
- `npm run build`: passed. The existing large-bundle advisory remains; generated `dist` files were rebuilt.
- Live HTTP inspection: category tree 4; FAQ sections 1–4 and 7–9; child sections 10–17; and find/27 returned HTTP 200 with the expected response envelopes. Parent sections 5/6 contain no direct articles, so the UI browses their children.
- Real Chrome browser API client at frontend origin `http://localhost:5173`: category and section mapping, article 27 in section 12, normalized image URLs, missing-article null and find/27 passed. CORS allowed this origin. No `no-cors`, disabled browser security, proxy workaround or mocked API successes were used.
- Standalone feature component in Chrome against the live backend: all seven FAQ sections and their article dialogs, all eight child sections and their article dialogs, FAQ search/empty results, CTA planning behavior, all nine calculator interactions, carousel navigation, 390px mobile layout, live images and broken-image fallback passed. No unexpected Console errors, CORS failures, API HTTP errors or response-mapping errors appeared in this successful run.
- Separate controlled-failure component tests: category/section errors and retries, partial FAQ search and retry, empty categories, and cancellation when closing a loading dialog passed. The injected 503/empty responses are test conditions, not live backend results.
- **Signed-in application flow remains unverified.** The actual `/services/mutual-funds` tab redirected to the login page; the separate test profile has not acquired a signed-in session. No authentication was bypassed or fabricated. A login-page startup probe also observed an unrelated Razorpay resource `https://checkout-static-next.razorpay.com/build/undefined` blocked with `net::ERR_BLOCKED_BY_ORB`; the mutual fund component tests do not load this unrelated script.

Evidence is in the project `.mf-validation/` directory: `browser-api-results.json`, `component-flows.json`, `browser-states.json`, `signed-in-flows.json`, and desktop/mobile component screenshots. The component harness mounts the real feature with BrowserRouter, but intentionally has no authentication wrapper. It must not be described as a signed-in application test. Browser profile data is excluded from Git.

Re-run basic checks:

```powershell
npm run typecheck:mutualfund
npm run check:mutualfund
npm run build
```

Browser scripts require the dedicated Chrome debugging session on port 9223 and Vite on localhost:5173. Once signed in to the original application tab, run `node scripts/check-mutualfund-browser.mjs` to complete the outstanding signed-in check. For separately labeled component validation, run `node scripts/check-mutualfund-browser.mjs --component`. Browser API and fault-state checks are `node scripts/probe-mutualfund-browser.mjs` and `node scripts/check-mutualfund-browser-states.mjs`.
