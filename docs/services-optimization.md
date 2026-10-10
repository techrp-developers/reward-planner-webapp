# Services optimization report

Implemented on 9 October 2026. This is an incremental refactor of the existing application. Existing routes, endpoints, authentication, service IDs, price computations, insurance payload formulas and mutual fund calculations remain in place. The `firebase/firestore` import in `FirebaseService.tsx` is unchanged.

## Changes and file ownership

| Files | Change and reason |
| --- | --- |
| `src/queryClient.ts`, `src/App.tsx`, `src/modules/services/serviceQueries.tsx` | Reuse the installed TanStack Query client for catalog GET caching, deduplication and cancellation. Catalog keys use an opaque authentication-session scope; queries are cancelled and removed on session changes. |
| `ServicesPage.tsx`, `components/ServiceSectionState.tsx` | Banners, categories, bundles and listings load independently with matching skeletons, explicit empty/error states and manual retries. A slow bundle response no longer blocks categories and services. |
| `ServiceCategoryPage.tsx`, `serviceCatalog.ts`, `src/hooks/useDebouncedValue.ts` | Debounce search by 200 ms, memoize filtering and preserve the original matching fields. Stable category ID 4 or backend `layout: 'wide'` metadata selects the existing wide layout. Reordered categories retain their layout and categories beyond the first five remain visible. |
| `src/components/services/ServiceImage.tsx`, `serviceImageSources.ts`, `ServiceBannerCarousel.tsx`, `src/assets/servicescards/optimized/`, `scripts/optimize-service-images.mjs` | Generate responsive AVIF/WebP versions of seven existing banners without changing artwork. Use correct intrinsic-width source descriptors, eager hero loading, high hero priority and lazy loading below the fold. Carousel memoization is backed by render instrumentation during search. Existing PNG sources are retained. |
| `ServiceDetailPage.tsx`, `components/ServiceVariants.tsx`, `ServicePricing.tsx`, `ServiceDocuments.tsx`, `ServiceFaq.tsx`, `ServiceEnquiryForm.tsx`, `ServiceCartActions.tsx`, `ServiceDetailSections.tsx`, `serviceDetailTypes.ts` | Extract typed detail sections while retaining existing markup, variants and calculations. Reuse the enquiry form on desktop/mobile. Failed enquiries remain errors; successful submissions display the server reference. Synchronous submission guards prevent repeated actions. |
| `ServiceBundlePage.tsx` | Cache bundle reads, retain edited form values during profile updates, expose failures/retries and guard enquiry/cart submissions. Preserve bundle payloads and navigation. |
| `src/context/ServiceCartContext.tsx`, `ServiceCartPage.tsx` | Keep cart data in a private session-owned QueryClient, cancel reads and invalidate after mutations. Expose read failures and manual retry without changing totals. |
| `ServiceCheckoutPage.tsx`, `submissionGate.ts`, `src/api/serviceCartCheckoutApi.ts`, `src/api/servicePaymentStatus.ts`, `src/api/addressApi.ts` | Use private checkout/address queries and non-retrying order mutations. Prevent same-tick duplicate creation, reuse a confirmed order during an explicit payment retry and stop creation after an uncertain order response. Validate payment status before displaying success. Allow read-only recovery of uncertain verification. Use actual saved addresses and server order references; remove fabricated success/address/order fallbacks. |
| `insurance/InsuranceQuotePageFlow.tsx`, `api/PolicyPlannerApi.ts`, `api/InsuranceCrmApi.ts`, `api/insuranceFlow.ts` | Separate public insurer master caching from personalized premium requests. Abort obsolete requests and prevent stale responses/progress from overwriting the latest selections. Keep CRM/Firebase sequencing and canonical payloads. Load Firebase only when submitting an enquiry. |
| `mutualfund/web/contentQueries.ts`, `MFScreen.tsx`, `ArticleDetails.tsx` | Cache public educational trees and sections, deduplicate reads and lazy-load calculators. Existing nine calculator functions remain unchanged. No additional chart library was introduced. |
| `src/router/AppRouter.tsx`, `src/modules/stage/CinematicModuleStage.tsx`, `servicesPreload.ts` | Lazy-load Services category/detail/cart/checkout/bundle, insurance and mutual fund pages. Mount stage modules on first visit and retain visited modules to preserve state. Inactive modules are inert. Begin Services route/hero loading during authenticated navigation to avoid a new loading waterfall. Existing paths remain unchanged. |
| Services cards, banners, FAQ, forms and checkout address controls | Use real links/buttons, labels, keyboard-native activation, expanded/pressed states and accessible loading/error status. Preserve classes and responsive breakpoints. |
| `scripts/check-services.mjs`, `check-services-browser.mjs`, `check-insurance-browser.mjs`, `analyze-services-build.mjs` | Add focused assertions, browser regression coverage and reproducible asset/Lighthouse measurements. All API/payment fixtures are test-only; production does not receive mock results. |
| `package.json`, `package-lock.json` | Add verification/image scripts and Lighthouse as a development dependency. Reuse existing TanStack Query and Sharp dependencies. |
| `.gitignore`, `eslint.config.js`, `vite.config.ts` | Exclude generated validation artifacts from Git, linting and dev-server file watching. |
| `src/components/layout/MobileBottomBar.jsx` | Remove an unused React import so the repository lint check passes. |
| `dist/index.html`, new `dist/assets/*` | Copy the verified production build into the existing distribution directory. Retain older hashed assets for compatibility; no site deployment was performed. |

Page filenames without a full prefix are under `src/modules/services/`.

## Cache policy

| Data | Freshness | Isolation and invalidation |
| --- | --- | --- |
| Service categories | 30 minutes | Session-scoped catalog; disposed on authentication change |
| Service banners | 15 minutes | Session-scoped catalog |
| Service lists, category lists, bundles | 2 minutes | Session-scoped catalog |
| Service/bundle details | 1 minute | Session-scoped catalog |
| Cart | 15 seconds | Private per-session client, zero inactive retention; invalidated after cart mutations |
| Checkout previews and addresses | 0 seconds | Private checkout client, zero inactive retention |
| Public insurer master plans | 15 minutes | Public shared cache; no CRM bearer token forwarded |
| Public mutual fund educational content | 30 minutes | Public shared cache |
| Insurance quote results, order/payment responses | No global cache | Request-local state/private mutation client |

Catalog, master and content reads use manual retry controls. Order/payment creation is never automatically retried. AbortSignals cancel GETs and supported quote requests; cancelling an HTTP request does not undo a backend write.

## Measurements

The saved baseline was built before this refactor. The optimized build uses the same Vite configuration and production mode. Byte counts below are decimal; gzip counts use the same Node gzip settings for both builds.

| Build metric | Before | After |
| --- | ---: | ---: |
| Main entry JavaScript | 1,672,615 B | 642,596 B |
| Main entry gzip | 456,080 B | 167,896 B |
| HTML initial JS including module preloads, gzip | 456,080 B | 249,347 B |
| All emitted JavaScript | 1,672,615 B | 1,701,874 B |
| Seven original banner PNGs / largest AVIF alternatives | 6,023,945 B | 307,862 B |
| Seven original banner PNGs / largest WebP alternatives | 6,023,945 B | 465,482 B |

The main entry is 61.6% smaller; initial HTML-referenced gzip JavaScript is 45.3% smaller. Total emitted JavaScript increased about 1.7% because of the query/refactor wiring and split-chunk overhead. Initial delivery improved; the complete application is not claimed to be smaller.

Largest AVIF alternatives are 94.9% smaller than the source PNGs and WebP alternatives are 92.3% smaller. Actual image transfer depends on viewport, device pixel ratio, supported format and which carousel slides are visited.

The insurance form chunk is approximately 53.7 KB, with the approximately 419.7 KB Firebase chunk deferred until submission. Heavy calculator code is separately loaded. The main entry remains above Vite's 500 KB warning threshold; eager pages outside this scope and shared MUI code remain candidates for a subsequent refactor.

Final serial browser measurements:

| Controlled desktop fixture metric | Before | After |
| --- | ---: | ---: |
| Lighthouse performance | 72 | 81 |
| Lighthouse accessibility | 85 | 92 |
| Largest contentful paint | 3,862 ms | 3,348 ms |
| Total blocking time | 126.5 ms | 0 ms |
| Cumulative layout shift | 0.000272 | 0 |
| Cold local JavaScript response bytes | 1,672,615 B | 895,279 B |
| Cold local image response bytes | 18,094,697 B | 102,714 B |
| Cold API GET requests | 25 | 10 |
| Cold Services-related GET requests, including cart | 5 | 5 |
| Cold local asset responses | 30 | 30 |

Cold local JavaScript response bytes fell 46.5%. Local image-response bytes fell 99.4% in this fixture, which includes previously mounted inactive stage imagery; this percentage is not a claim about every production catalog. Local asset count stays the same because splitting adds JavaScript requests while avoiding unvisited module images. Earlier repeated desktop measurements ranged from 72–91 performance before and 81–96 after, illustrating timing variability. The table uses the final serial pair rather than selecting the highest scores.

The network fixture measures cold authenticated `/services` navigation at 1280×900 against local production previews. Remote API responses are intercepted with identical catalog fixtures. Asset bytes are uncompressed response bodies, not actual gzip wire transfer. Remote catalog-image transfer and real API latency are excluded. Lighthouse uses its standard desktop preset with simulated throttling, retained test authentication and performance/accessibility categories. These are laboratory results, not production field data; timing/scores vary between runs.

Warm-return regression coverage confirms zero additional catalog GETs within freshness windows. A cold visit still needs the same four independent catalog GETs; unrelated stage module requests are avoided through lazy mounting. Responsive checks cover 375/768/1280 px for Services and all calculator dialogs; insurance covers 320/375/768/1280/1440 px.

## Validation

Passed:

- `npm run typecheck`: repository TypeScript check.
- `npm run lint`: existing ESLint configuration. It covers JS/JSX; TypeScript is checked by `tsc`, not a newly forced incompatible ESLint parser.
- Production Vite build and `git diff --check`.
- `npm run check:services`: stable ID/layout mapping, unchanged search semantics, query cache/deduplication/invalidation/cancellation, synchronous duplicate protection and payment status interpretation.
- `npm run check:mutualfund`: all nine calculations, zero-rate/withdrawal boundaries and existing URL handling.
- `npm run check:services:browser`: 11 groups covering independent query states, search/render behavior, cache reuse, category/detail navigation, variants/FAQ/documents, enquiry failure/success, cart/checkout duplicate and verification behavior, bundles, insurance hub, all nine calculator dialogs, responsive widths and manual retry.
- `node --experimental-strip-types scripts/check-insurance-browser.mjs`: Health, Super Top-Up and Personal Accident payloads and flows, Firebase/CRM failures, partial quotes/fallback, navigation, token isolation, responsive layouts, master deduplication and aborted quotes.

The older mutual fund browser scripts depend on a separately running Chrome CDP session at port 9223 and a live calculator harness at port 5173. Those prerequisites were unavailable. Their live-harness runs are not reported as passing; the new isolated browser suite exercises all nine calculators and their dialog widths.

Browser tests use intercepted backend responses and a test-only Razorpay/Firebase adapter. No live payment was created. A staging pass with real backend credentials, insurer availability and a payment-provider test account is still needed before release.

Reproduction on the installed Node version:

```powershell
npm run typecheck
npm run lint
npm run check:services
npm run check:mutualfund
npm run check:services:browser
node --experimental-strip-types scripts/check-insurance-browser.mjs
node --experimental-strip-types node_modules/vite/bin/vite.js build --outDir .services-validation/optimized
node scripts/analyze-services-build.mjs
node --experimental-strip-types scripts/check-services-browser.mjs --measure=baseline
node --experimental-strip-types scripts/check-services-browser.mjs --measure=optimized
```

Measure serially after builds/tests finish. The measurement commands require saved baseline/optimized build directories and Chrome; `CHROME_PATH` overrides the default installed Chrome path. Generated reports live in ignored `.services-validation/` and `.insurance-validation/` folders. Regenerate banner variants with `npm run optimize:service-images`.

## Work requiring backend or follow-up support

- **Server search/pagination:** no documented pagination/search contract was found for the existing category endpoint. Local matching is debounced and category reads are cancelled, but no invented query parameters or endpoints were added. Server pagination requires a supported response shape, totals, filter semantics and ordering contract.
- **Order idempotency:** client guards cover repeated clicks and retries in the current checkout session. Guaranteed deduplication across reloads, multiple tabs and uncertain server responses requires backend idempotency keys and order reconciliation. An unknown creation result blocks another creation instead of blindly retrying.
- **Remote thumbnails:** existing remote image URLs are preserved and lazy-loaded. Responsive remote resizing/compression needs CDN/backend support; arbitrary URL resizing parameters were not introduced.
- **Further initial bundle reduction:** profile and split remaining eager modules outside Services, and review shared MUI imports. Total emitted JavaScript should also be monitored separately from initial transfer.
- **Field performance and accessibility:** run production/mobile Lighthouse and real-user measurements with representative accounts and API latency. The desktop accessibility score improves but is not a full manual accessibility audit.

The existing Terms/PolicyPlanner endpoint availability issues need backend confirmation where those routes return 404. The refactor preserves endpoints and exposes failures rather than fabricating successful production responses.

## Services cart entry follow-up

`src/components/layout/TopHeader.tsx` now renders a visible shopping-cart link on all Services, insurance and tax routes. The link always opens `/services/cart`, even when empty, and uses the existing Services cart count for its badge and accessible label. Mobile spacing accommodates the additional control. Product-cart behavior and the existing restrictions on insurance Add to Cart remain unchanged.

The extended `scripts/check-services-browser.mjs` passes 13 regression groups. It checks cart visibility and route navigation at 320/375/768/1280 px, cart-to-checkout navigation, the detail Add to Cart payload (`service_id` and selected `variant_id`), updated count and the resulting cart items. TypeScript, lint and a production build passed. The verified cart build was copied into `dist`. The performance measurements above describe the preceding optimization build; they were not rerun for this small header addition.

## Service detail scrolling and presentation follow-up

`ServiceDetailPage.tsx` and the new scoped `ServiceDetailPage.css` correct the two-column desktop layout. Global `overflow-x: hidden` on the document/root was creating a scroll ancestor that prevented the header and sidebar from sticking. On detail routes only, horizontal overflow now uses `clip` and vertical scrolling stays with the document. The sidebar measures the actual header height with ResizeObserver, shows the complete pricing/application/support stack without clipping or an internal scrollbar. A tall sidebar scrolls naturally until its ending reaches the viewport, then stays anchored at the bottom; a short sidebar stays below the header. Mobile uses a single visible inline form. Enquiry scrolling selects the visible form and respects reduced-motion preferences.

The new styling retains the existing purple palette and desktop/mobile breakpoints, with softer card borders/shadows, a subtle background, clearer input focus/hover states, compact pricing at short desktop heights and naturally scrolling, keyboard-accessible forms. Reduced-motion users do not receive decorative transitions or animations within the detail page.

Service metadata now prioritizes API form titles/fields, variant overview/journey/stat content and document requirements. Unknown service IDs no longer inherit PAN service metadata, variants or documents. Service ID 2 therefore uses its Aadhaar service title or its API-provided form title; when API form metadata is missing, it uses a neutral contact form instead of the PAN-specific reason field. Existing known-service editorial fallbacks and backend field keys are retained. Price calculations and cart/checkout endpoints are unchanged.

Validation passed: repository TypeScript, lint, focused Services assertions, production build and the full browser suite (14 regression groups). Added coverage checks API Aadhaar content and neutral metadata fallback, sticky positioning/form-submit reachability at 1280×900 and 1280×600, one visible mobile form at 320/375/768 px, keyboard focus, selected-variant pricing and checkout IDs. Fixture screenshots are saved as `.services-validation/detail-desktop-900.png`, `detail-desktop-600.png` and `detail-mobile.png`. The verified final detail build is copied into `dist`; no deployment or live payment was performed.

Following the request to show the entire form, the internal scrolling area was removed. ResizeObserver now also measures the full sidebar height so its ending can anchor to the viewport without constraining the form. The revised focused browser check (`node --experimental-strip-types scripts/check-services-browser.mjs --detail-only`) passes: no internal scrollbar or clipped content, Submit reachable, sidebar ending stable while document scrolls, mobile inline form, API metadata fallback and variant checkout IDs. TypeScript, lint and the revised production build also pass. This focused check replaces the earlier geometry expectation that the whole sidebar fit inside the viewport. The verified revised build is in `dist`.
