# Insurance web integration

The existing React/Vite insurance module was audited and completed using the available API, mapper, constant, asset, and web flow files. React Native Health.tsx, SuperTop.tsx, PA.tsx, their Step*.tsx files, and QuotesResult.tsx were not present in the workspace. Exact mobile source parity, including undocumented CRM section contracts, cannot be certified without those files. No business classifications or cover options were invented.

## Routes

These routes already existed in AppRouter.tsx and remain connected:

- /services/health-insurance/quote
- /services/super-top-up/quote
- /services/personal-accident/quote

Existing /insurance/* aliases remain. Router links switch products; an internal product key resets the form and enquiry together. The existing website authentication gate is retained. Within each product, back and edit retain form values and the CRM enquiry ID. Refresh safely starts a fresh form; draft persistence across reloads was not introduced.

## Flows and persistence

Health: explicit gender and family selection, individual member ages, contact details/city/zone/cover/terms, Firebase record, CRM completion, insurer quotes and plan selection.

Super Top-Up: the same family steps with the existing cover list and fixed 500000 deductible; uses CRM type super_topup and getAllSuperTopUpPremiums. Deductible and all selected child ages are retained in Firebase and premium payloads.

Personal Accident: self remains insured; explicit gender, contact details and a real DOB, then occupation, income, nature of work, derived category, cover and terms. Self age is derived from DOB. CRM ages and basic details are saved before advancing from the contact step. getAllPAPremiums receives coverAmount, category and age. DOB is submitted in ISO YYYY-MM-DD form in the PA mapper and Firebase record.

All steps await successful CRM persistence. IDs are positive integers and string response IDs are normalized. Age saves use the original CRM members section. The backend reported Members missing or invalid when the migration used members_ages. Final submission now validates and re-saves the member snapshot under members before completion, repairing existing enquiries on retry without creating another ID. Basic and coverage sections retain the available integration's existing basic / health / super_topup / personal_accident names and mapper shapes. Super Top-Up no longer falls back to a Health coverage section, which would lose its deductible; a rejected coverage request remains visible.

The premium API supports four child slots; selecting more than four children is rejected with an explanation instead of truncating the request. Child-only payloads include the primary insured once. Deselected members do not leave phantom child counts in Firebase payloads.

Firebase uses the existing web SDK and service_enquiries collection. The original firestore import block is preserved. The deterministic document key insurance_<service_id>_<enquiry_id> prevents duplicate records on submission retry. Firebase writes are attempted for completed forms even when no insurer quotes are available. Firebase failure or a 12-second confirmation timeout shows a notice while allowing CRM completion and quote retrieval; a timed-out SDK write may finish later using the same key.

Quote normalization is shared. It unwraps CRM/PolicyPlanner envelopes, preserves source data, rejects nested failures, supports plain and structured company/plan names and formatted premiums, and retains partial insurer failures. Selection uses numeric IDs from response data or the existing PolicyPlanner source URL, and sends the existing selectPlan payload fields. Missing premiums disable selection. A synchronous lock prevents duplicate selection clicks; errors and success appear inline.

## Preserved API separation

InsuranceCrmApi.ts uses the website's shared Axios client and its rp_access_token and token refresh convention for startInsurance, saveStep, completeInsurance, getQuotes and selectPlan. Existing POST-to-GET compatibility and exponential backoff for pending quotes remain in getQuotes.

PolicyPlannerApi.ts retains fetchPlans/getPremium/getAllPremiums, fetchSuperTopUpPlans/getSuperTopUpPremium/getAllSuperTopUpPremiums and fetchPAPlans/getPAPremium/getAllPAPremiums. Health insurer-specific payload mapping is preserved. Direct insurer transport is separate so CRM bearer tokens and authentication refresh are not sent to PolicyPlanner.

## Live backend findings (6 October 2026)

Read-only plan requests with Origin http://localhost:5173 and Origin https://rewardplanners.com returned HTTP 500 HTML reporting Not allowed by CORS. A localhost OPTIONS request also failed. Requests without Origin returned catalogs with 22 Health, 7 Super Top-Up, and 7 PA entries. This proves the observed origin rejection; it does not certify all deployments or insurer endpoints.

The Vite development proxy /api/policyplanner forwards to https://policyplanner.com, preserves paths/query/payloads, verifies TLS, and makes server-to-server requests without a browser Origin header. Development uses this proxy by default. Live requests through this proxy returned all three plan catalogs successfully (22/7/7 plans).

Production needs either PolicyPlanner origin allowlisting or a RewardPlanners backend proxy. Set VITE_POLICYPLANNER_BASE_URL to that proxy's base path/URL; it must preserve PolicyPlanner request paths and handle browser authentication/CORS as appropriate. The Vite proxy does not exist in a static production build. Production currently retains the public PolicyPlanner base when the variable is unset, with CRM quote fallback if direct requests fail. No production backend proxy endpoint was found in this frontend repository.

Anonymous live premium checks (sample age and cover, no customer data/enquiries) returned usable Super Top-Up and PA response structures. The Health endpoint https://policyplanner.com/health-insurance/star/1003/218/premium returned HTTP 404 with a JSON No premium found message for the sampled details. Follow-up checks confirmed POST is correct; this is a missing rate, not evidence of a stale route. HDFC and National Insurance returned valid premiums for a sample family. Rates depend on the submitted inputs; no ages, zones or cover amounts are changed to force a quote.

## Verification

- npm run typecheck and npm run typecheck:services pass.
- npm run build hit existing locked dist assets. The final production bundle passes with node node_modules/vite/bin/vite.js build --outDir .insurance-validation/production-build, avoiding the locked files. Missing generated files were restored into dist from that verified bundle, and dist/index.html now references existing final JS/CSS assets. The existing large bundle warning remains.
- npm run lint reports the unrelated pre-existing unused React import in src/components/layout/MobileBottomBar.jsx. The lint configuration covers JS/JSX; TypeScript coverage comes from the compiler.
- No React Native imports, navigation calls, StyleSheet.create, Alert.alert or __DEV__ remain in insurance source. No React Native packages were installed or removed because none were declared in package.json.
- Browser checks: node --experimental-strip-types scripts/check-insurance-browser.mjs. Uses installed Chrome (override CHROME_PATH if necessary), an isolated Vite cache/server, the real App/router/insurance components, intercepted CRM and insurer requests, and a test-only Firebase adapter. It creates no real CRM/Firebase records. The report is .insurance-validation/browser-report.json.
- Checks cover all three products, payloads, date validation, partial failures, failed-step retry, CRM quote backoff, state retention, route resets, duplicate selection, Firebase warnings, refresh, bearer-token isolation and 320/375/768/1280/1440px form/result widths.

Live authenticated CRM persistence, production select-plan processing, and Firebase write authorization/security rules still require the actual backend/account integration. Intercepted browser tests verify frontend behavior and request contracts rather than those external services.

## Files

Created: api/insuranceFlow.ts, utils/insuranceValidation.ts, scripts/check-insurance-browser.mjs and this document. Browser verification generates .insurance-validation/browser-report.json and a disposable Vite cache.

Modified in src/modules/services/insurance: InsuranceQuotePageFlow.tsx, components/InsuranceFormSteps.tsx, components/InsuranceQuoteResults.tsx, api/InsuranceCrmApi.ts, api/PolicyPlannerApi.ts, api/FirebaseService.tsx, api/enquiryPayloadBuilders.ts, insurancePayloadMappers.ts, types/insurance.types.ts, utils/insuranceUtils.ts and utils/insuranceQuoteUtils.ts. Also updated vite.config.ts, .env.example and .gitignore for proxy configuration. No unrelated page implementation was changed.

## Insurance entry navigation

/insurance retains its existing redirect to /services/category/2. That exact category route now renders InsuranceProductsPage with Health Insurance, Super Top-Up and Personal Accident links to the existing quote flows. Other category routes retain ServiceCategoryPage. Services category clicks recognize Insurance before generic/content/direct category routing, and supported insurance service cards go to their product quote route. Legacy Health service detail buttons open the new quote page instead of the older HealthInsuranceWizard modal; other named supported insurance detail services use the same shared resolver. Unrelated services retain their detail and checkout behavior.

Created InsuranceProductsPage.tsx and insuranceProducts.ts. Updated AppRouter.tsx, ServicesPage.tsx, ServiceDetailPage.tsx, InsuranceQuotePageFlow.tsx and the existing browser check script. Product names and quote paths are shared by the hub, quote tabs and service links. The browser regression check also exercises the redirect, all three product links, Services category entry, and legacy Health detail CTA.

## Premium availability and terms diagnostics

Provider error fields are now retained. No premium found responses are classified separately from technical failures, with counts and expandable per-plan reasons in quote results. Browser HTTP errors remain visible because the providers return real non-success statuses; the frontend does not rewrite those statuses or invent rates.

The CRM terms/status and terms/accept routes returned CRM route not found on inspection. The existing terms-status compatibility fallback remains. Concurrent checks share one request; after a 404, the missing status route is not queried again within the loaded application. An explicit terms_accepted boolean from the user profile takes precedence, including false. The backend must supply working status/accept routes if central terms recording is required.
