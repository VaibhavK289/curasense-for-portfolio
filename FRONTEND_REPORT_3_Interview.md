# CuraSense Frontend — Interview Deep-Dive

> What a technical interviewer would ask about this project, and the answers directly from the codebase.

---

## 1. Security Implementation

### 1.1 Authentication Security

**Q: "How do you store tokens? Why this approach?"**

The application uses a **split-token strategy**:

| Token | Storage | Flags | Why |
|---|---|---|---|
| **Access Token** | JavaScript memory (React Context state) + localStorage backup | — | Short-lived (7 days). Attached as `Authorization: Bearer` header. Accessible to JS for API calls |
| **Refresh Token** | HTTP-only cookie | `httpOnly: true`, `secure` (prod), `sameSite: "lax"`, `maxAge: 30d` | Invisible to JavaScript — immune to XSS. Only sent automatically by the browser on same-origin requests |

**Why split?** An XSS attack can steal the access token from localStorage, but it **cannot** steal the httpOnly refresh token. The access token alone has limited validity; without the refresh token, an attacker can't maintain persistent access. The refresh token, safely in a cookie, can only be sent by the browser on requests to the same origin — not extractable via `document.cookie` or `fetch`.

### 1.2 Brute Force Protection

```typescript
// In authenticateUser() — lib/db/auth.ts
if (!isValid) {
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginCount: { increment: 1 },
      lockedUntil: user.failedLoginCount >= 4
        ? new Date(Date.now() + 15 * 60 * 1000)  // Lock for 15 minutes
        : null,
    },
  });
}
```

**Policy**: After **5 consecutive failed attempts**, the account is locked for 15 minutes. On successful login, `failedLoginCount` resets to 0 and `lockedUntil` is cleared.

### 1.3 Password Reset Security

| Measure | Implementation |
|---|---|
| **Token single-use** | `usedAt` timestamp set after use; reuse is rejected |
| **Token expiry** | 1-hour TTL; expired tokens are deleted on verification attempt |
| **Previous tokens invalidated** | On new reset request, all existing tokens for that email are deleted |
| **Session invalidation** | After password reset, **all sessions are deleted** — forces re-login everywhere |
| **Email enumeration prevention** | `createPasswordResetToken()` returns `null` for non-existent emails without revealing whether the email exists |

### 1.4 Data Sanitization

```typescript
// Login route — app/api/auth/login/route.ts
const safeUser = {
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  displayName: user.displayName,
  role: user.role,
  avatarUrl: user.avatarUrl,
};
// passwordHash, failedLoginCount, lockedUntil, etc. are NEVER sent to the client
```

### 1.5 Audit Trail (HIPAA Awareness)

Every login creates an `AuditLog` record with `action: "LOGIN"`, `ipAddress`, and `userAgent`. The audit log model supports arbitrary `details` (JSON field) for tracking future actions like `REPORT_VIEW`, `REPORT_CREATE`, etc.

---

## 2. Design Patterns Used

### 2.1 Proxy Pattern (API Layer)

**Pattern**: All 28 API routes act as reverse proxies, forwarding client requests to backend services.

**Q: "Why not call your Python backends directly from the browser?"**

Three reasons:
1. **CORS** — Browser blocks cross-origin requests unless backends set `Access-Control-Allow-Origin` headers
2. **Environment security** — Backend URLs stay server-side only; no `NEXT_PUBLIC_*` exposure
3. **Request enrichment** — Server can validate auth, log requests, transform data before forwarding

### 2.2 Provider Pattern (Auth + Theme + Scroll)

Nested Context providers create a **dependency tree** where each layer adds a capability:

```
ThemeProvider → adds class="dark" on <html>
  AuthProvider → adds user, token, login/logout methods
    ScreenReaderAnnouncer → adds ARIA live region
      SmoothScroll → adds Lenis smooth scroll engine
```

**Q: "Why not combine these into one provider?"**

Separation of concerns. Each provider has its own:
- Lifecycle (`useEffect` timers, event listeners)
- Error boundaries (auth failure doesn't crash the theme)
- Testability (can mock auth without mocking scroll)

### 2.3 Singleton Pattern (Prisma Client)

```typescript
// lib/prisma.ts — Proxy-based lazy singleton
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrismaClient(), prop);
  },
});
```

**Q: "Why a Proxy instead of just `export const prisma = new PrismaClient()`?"**

Two reasons:
1. **Hot reload safety** — Without the global singleton check, Next.js dev server creates a new Prisma connection on every file change, exhausting the database connection pool
2. **Build-time safety** — `new PrismaClient()` requires `DATABASE_URL` at import time. During `next build` (e.g., in Docker), modules load but _runtime_ env vars aren't available yet. The Proxy defers instantiation to the first actual database call

### 2.4 Observer Pattern (Lenis Scroll Events)

```typescript
// SmoothScroll hooks into Lenis event emitter
lenis.on("scroll", handleScroll);
// ScrollProgress reads lenis.progress (0 → 1)
// ScrollToTop reads lenis.scroll (pixel offset)
```

Multiple components observe the same Lenis instance through the `SmoothScrollContext` without coupling to each other.

### 2.5 Strategy Pattern (Export Utilities)

```typescript
// Each export format is an independent strategy
exportToPDF(report, options);    // → browser print dialog
exportToFHIR(report);           // → FHIR R4 JSON download
exportToText(report);           // → .txt download
emailReport(report, recipient); // → mailto: link
```

Caller doesn't need to know how each format works — just picks a strategy.

### 2.6 Adapter Pattern (Medicine Types)

```typescript
// Backend returns nested shape → flattenMedicine() → UI-friendly flat shape
const raw: MedicineDetail = await response.json();    // { basic_info: { name, uses... } }
const flat: Medicine = flattenMedicine(raw);           // { name, uses... }

// Backend returns nested interaction → flattenInteraction() → flat shape
const raw: BackendInteractionRaw = await response.json();
const flat: InteractionResponse = flattenInteraction(raw);
```

**Q: "Why not change the backend to return the flat shape?"**

The backend serves multiple consumers. The frontend adapts the data to its needs using adapter functions, keeping the backend API stable.

---

## 3. Performance Optimizations

### 3.1 Server Components vs Client Components

| Component | Rendering | Why |
|---|---|---|
| `layout.tsx` | **Server** | Renders HTML skeleton without sending React JS; fonts and CSS loaded statically |
| `providers.tsx` | **Client** | First `"use client"` boundary — everything below can use hooks |
| `page.tsx` (landing) | **Client** | Needs Framer Motion animations, scroll listeners |
| `Sidebar`, `Header` | **Client** | Need `useAuth()`, `usePathname()`, `useState` for hover |

**Net effect**: The `<html>` + `<body>` shell renders on the server as pure HTML. Only interactive components hydrate on the client.

### 3.2 `useMemo` for Expensive Computations

```typescript
// use-filtered-analytics.ts
const analytics = useMemo<EnhancedAnalytics>(() => {
  // This runs O(n * days) — iterates all reports multiple times
  // for daily bucketing, sparklines, processing trends, etc.
  // Only recomputes when `reports` or `timeRange` change
}, [reports, timeRange]);
```

Without `useMemo`, every parent re-render would recompute sparklines, activity feeds, and health scores — even if the data hasn't changed.

### 3.3 `useCallback` Memoization in Auth

Every function in `AuthProvider` is wrapped in `useCallback`:

```typescript
const login = useCallback(async (email, password) => { ... }, [persistAuth]);
const logout = useCallback(async () => { ... }, [clearAuth]);
const refreshToken = useCallback(async () => { ... }, [clearAuth]);
```

**Why?** `AuthProvider` re-renders whenever `authState` changes. Without `useCallback`, new function references would cause every consumer of `useAuth()` to re-render too — even components that only use `logout` (which hasn't changed).

### 3.4 Debounced and Controlled Re-rendering

- **Medicine hub search**: Autocomplete uses debounced input (waits for user to stop typing before querying)
- **Lenis scroll events**: `ScrollProgress` only re-renders when `lenis.progress` changes
- **Zustand selectors**: Components subscribe to only the state slice they need — `useAppStore((state) => state.reports)` won't re-render when `theme` changes

### 3.5 Reduced Motion Accessibility

```typescript
// smooth-scroll.tsx
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (prefersReducedMotion) return; // Skip Lenis entirely
```

Not just an accessibility feature — also a performance optimization for users on low-end hardware.

### 3.6 AbortController for Request Cancellation

```typescript
// use-error-recovery.ts
const abortControllerRef = useRef<AbortController | null>(null);

const execute = useCallback(async () => {
  if (abortControllerRef.current) abort.current.abort();  // Cancel previous
  abortControllerRef.current = new AbortController();     // New controller
  const result = await asyncFn();                         // Uses signal
}, [asyncFn]);

useEffect(() => {
  return () => { abortControllerRef.current?.abort(); };  // Cleanup on unmount
}, []);
```

Prevents stale responses from overwriting fresh data after component unmount or navigation.

---

## 4. Edge Cases Handled

| Edge Case | Where | How |
|---|---|---|
| **Python `str(dict)` in API responses** | `api.ts` → `extractMarkdownFromReport()` | Custom parser walks character by character, handling `\'`, `\"`, `\\n`, `\\t` escape sequences |
| **Token expired during request** | `useAuthenticatedFetch()` | Catches 401 → calls `refreshToken()` → retries with new token → if still fails, calls `logout()` |
| **Hydration mismatch (SSR)** | `auth-context.tsx`, `medicine-cabinet.ts` | All localStorage reads guarded with `typeof window === "undefined"` check |
| **Date parsing from Zustand persistence** | `store.ts` → `getAnalytics()` | `safeDate()` handles Date objects, ISO strings, and invalid values gracefully |
| **Empty medicine cabinet** | Hub dashboard | Batch interaction matrix requires ≥3 items; button disabled otherwise |
| **Duplicate cabinet entries** | `medicine-cabinet.ts` | Case-insensitive comparison before adding; silently no-ops on duplicates |
| **Activity deduplication** | `medicine-cabinet.ts` | Same `type + query` combination replaces existing entry instead of duplicating |
| **Build-time DATABASE_URL absence** | `prisma.ts` | Proxy pattern defers connection to first runtime call |
| **File too large / rate limiting** | `use-error-recovery.ts` | Maps HTTP 413 → "File too large", 429 → "Too many requests" with user-friendly messages |
| **Connection lost mid-request** | `OfflineIndicator` + `useOfflineQueue` | Shows persistent banner; queues failed requests for auto-retry on reconnection |
| **Non-existent email in password reset** | `auth.ts` | Returns `null` without error — prevents email enumeration attacks |

---

## 5. Scalability Considerations

### 5.1 Current Architecture Limits

| Aspect | Current State | Scaling Concern |
|---|---|---|
| **Reports in Zustand** | All reports loaded into client memory | With 1000+ reports, `getAnalytics()` iterates the entire array multiple times per render |
| **localStorage Cabinet** | Max 20 items, 8 recent searches | Appropriate cap; won't grow unbounded |
| **API Proxy Timeout** | 500 seconds | Long-running CrewAI pipelines tie up a Next.js server thread per request |
| **Prisma Connection Pool** | Single `pg` Pool instance (global singleton) | NeonDB serverless handles scaling; Prisma adapter manages pool |
| **No caching layer** | Every medicine lookup hits the backend | Repeated queries for the same medicine (e.g., "Aspirin") are not cached |

### 5.2 Built-in Scaling Support

| Feature | How it helps |
|---|---|
| **Standalone Docker output** | `output: "standalone"` in `next.config.ts` — minimal deployment artifact for horizontal scaling |
| **Stateless middleware** | Edge Runtime middleware — runs without Node.js, can be deployed to CDN edge nodes |
| **Fire-and-forget DB writes** | Report persistence doesn't block UI — server handles backpressure |
| **Paginated report API** | `/api/reports` supports `page` and `limit` query params |
| **Database indexes** | Prisma schema has indexes on all foreign keys, query patterns (`userId + createdAt DESC`), and content lookup fields |

---

## 6. Testing Readiness

### 6.1 What's Testable Now

| Layer | Testability | Files |
|---|---|---|
| **Pure utility functions** | Easy to unit test — no side effects | `flattenMedicine()`, `flattenInteraction()`, `extractMarkdownFromReport()`, `calculateHealthScore()` |
| **localStorage utilities** | Testable with mocked `window.localStorage` | `medicine-cabinet.ts` — all functions are pure I/O |
| **Auth logic** | `authenticateUser()`, `verifyAccessToken()` testable with mocked Prisma | `db/auth.ts` |
| **API routes** | Each is an isolated `POST`/`GET` function | 28 route files |
| **Zustand store** | Can call `useAppStore.getState()` and `setState()` directly in tests | `store.ts` |

### 6.2 Demo Data Generator

The app includes `useDemoDataGenerator()` which creates 30 realistic reports with randomized types, statuses, confidence scores, processing times, and findings. This enables:
- Manual testing of the analytics dashboard
- Screenshot generation for portfolios/demos
- Stress testing the Zustand store and `useMemo` analytics

---

## 7. Code Quality Patterns

### 7.1 Type Safety

| Pattern | Example |
|---|---|
| **Strict TypeScript interfaces** | `MedicineDetail`, `InteractionResponse`, `CompareResponse`, `ImageAnalysisResponse` — all matching backend Pydantic schemas |
| **Enum validation in API routes** | `validTypes.includes(type)` checks against Prisma-generated `ReportType` enum before DB insert |
| **Discriminated unions** | `Report.type: "prescription" \| "xray" \| "text" \| "medicine"` used throughout for conditional rendering |
| **Null-safe chaining** | `raw.basic_info?.name ?? "Unknown"` in flatten utilities |

### 7.2 Error Handling Patterns

| Pattern | Where |
|---|---|
| **Error classification in API routes** | Auth errors → 401, validation → 400, duplicates → 409, everything else → 500 |
| **Graceful degradation** | Chat assistant shows "having trouble connecting" message on failure instead of crashing |
| **Non-blocking side effects** | `saveReport()` catches DB errors with `console.warn` — never blocks UI |
| **User-friendly error messages** | `useErrorRecovery` maps technical errors to plain language |

### 7.3 SSR Safety

Every component that accesses browser APIs is behind a guard:

```typescript
// Pattern used across auth-context, medicine-cabinet, store
if (typeof window !== "undefined") {
  localStorage.getItem(...);
}
```

This prevents `ReferenceError: window is not defined` during server-side rendering.

---

## 8. Potential Interview Questions & Answers

### Architecture

**Q: "Why did you build your own auth instead of using NextAuth or Clerk?"**

Full control over the auth flow, token management, and database schema. NextAuth adds abstraction that can be hard to customize (e.g., custom role-based access, account lockout, audit logging). Since this is a healthcare app, having full visibility into the security implementation is important.

**Q: "Your API routes are essentially a BFF (Backend-for-Frontend). What are the trade-offs?"**

_Pros_: CORS elimination, URL hiding, request enrichment, unified error handling.
_Cons_: Added latency (extra hop), every backend call passes through Next.js (can become a bottleneck), and proxy routes must be maintained in sync with backend changes.

**Q: "Why Zustand over Redux or React Query?"**

Zustand: ~200 lines for entire store vs ~500+ with Redux actions/reducers/selectors. Built-in `persist` middleware handles localStorage serialization. No Provider needed (global singleton). For this app's scope — reports, chat, sidebar, theme — Redux's ceremony isn't justified.

React Query would be appropriate for server-state (caching, revalidation), but reports are client-first (Zustand → fire-and-forget to DB), not server-first.

### Security

**Q: "What happens if someone steals the access token from localStorage?"**

They get API access for up to 7 days (the token's TTL). Mitigation: the refresh token (needed for renewal) is in an httpOnly cookie — inaccessible to JS. In production, the access token TTL could be reduced to 15 minutes (the env var `ACCESS_TOKEN_EXPIRES_IN` supports this).

**Q: "How do you prevent CSRF attacks?"**

The refresh token cookie uses `sameSite: "lax"`, which prevents it from being sent on cross-origin POST requests. API routes also verify the `Authorization: Bearer` header (which a CSRF attack can't set). The combination of both makes CSRF attacks impractical.

### Performance

**Q: "Your `getAnalytics()` iterates the reports array multiple times. How would you optimize it?"**

Currently it runs: `filter(completed)` → `forEach(byType)` → `forEach(byStatus)` → `filter+map(processingTimes)` → `forEach(findings)` → `filter(dailyUsage × 30 days)`. For optimization:
1. Single-pass accumulation — iterate once, accumulate all metrics in one loop
2. Pre-computed daily buckets — use a `Map<dateString, Report[]>` instead of filtering for each day
3. Move heavy computation to a Web Worker for reports > 1000

**Q: "The medicine hub search bar navigates to a different page. Why not search in-place?"**

Each medicine feature (lookup, interactions, compare) has distinct UI and state requirements. In-place search would require loading all feature UIs conditionally — increasing the hub's bundle size and complexity. URL-based navigation also enables deep linking (share `/medicine/lookup?q=Aspirin`).

### Frontend Patterns

**Q: "How does your theme switching work without a page flash?"**

`next-themes` adds a blocking `<script>` before React hydration that reads the stored preference and sets the `class` attribute on `<html>`. Since CSS is compiled with dark-mode variants (`dark:bg-...`), the correct theme is applied _before_ the first paint. `suppressHydrationWarning` on `<html>` prevents React from complaining about the server/client class mismatch.

**Q: "Explain how `extractMarkdownFromReport()` works and why you need it."**

The ML backend calls Python's `str()` on a dict, which produces `repr()` formatted output like `{'raw': 'The patient...\n...'}`. This isn't valid JSON. The function:
1. Tries `JSON.parse()` first (future-proofing if backend switches to `json.dumps`)
2. Falls back to manual parsing: locates `'raw':` marker, detects the quote character, then walks character by character handling Python escape sequences (`\\n` → `\n`, `\\'` → `'`)
3. Validates the extracted string is >50 characters (sanity check for real clinical content)
4. Falls back to raw string if all parsing fails

---

## 9. Areas for Improvement

| Area | Current State | Production Improvement |
|---|---|---|
| **Access token TTL** | 7 days | Reduce to 15 minutes; rely on refresh rotation |
| **No request caching** | Every medicine lookup hits the backend | Add SWR/React Query or a Redis cache layer for medicine data |
| **No rate limiting** | API routes accept unlimited requests | Add rate limiting middleware (e.g., `upstash/ratelimit`) |
| **No input sanitization** | Markdown rendered via `marked.parse()` | Add DOMPurify to sanitize HTML output from markdown rendering |
| **No CSRF token** | Relies solely on `sameSite` cookie + Bearer header | Add explicit CSRF token for defense-in-depth |
| **No E2E tests** | Only demo data generator for manual testing | Add Playwright or Cypress tests for critical flows |
| **Bundle size** | Premium components in two large files (30KB + 27KB) | Code-split premium components with `dynamic()` imports |
| **Accessibility audit** | ARIA roles and skip navigation present | Run Axe/Lighthouse audit; fix any remaining contrast or focus issues |
| **Error monitoring** | `console.error` only | Add Sentry or similar for production error tracking |
| **API response caching** | No caching headers on proxy routes | Add `Cache-Control` headers for medicine data (changes infrequently) |

---

## 10. Key Metrics at a Glance

| Metric | Value |
|---|---|
| **Total dependencies** | 33 runtime + 12 dev |
| **API routes** | 28 route handlers across 11 directories |
| **Prisma models** | 10 models, 6 enums |
| **Database indexes** | 34 indexes for query optimization |
| **UI components** | 17 primitives + 30+ premium + 4 medicine + 3 layout |
| **Custom hooks** | 7 (`useAuth`, `useAuthenticatedFetch`, `useAppStore`, `useSmoothScroll`, `useErrorRecovery`, `useOfflineQueue`, `useFilteredAnalytics`) |
| **CSS design tokens** | ~2000+ lines of custom properties |
| **Animation presets** | 5 springs, 6+ variants, 5+ element springs, page transitions |
| **Password hashing** | bcrypt with 12 salt rounds |
| **Account lockout** | 5 failed attempts → 15 minute lock |
| **Token architecture** | Access (7d, localStorage) + Refresh (30d, httpOnly cookie) |
| **Max request timeout** | 500 seconds (for CrewAI pipeline processing) |

---

*CuraSense Frontend — Interview Deep-Dive v1.0 · March 2026*
